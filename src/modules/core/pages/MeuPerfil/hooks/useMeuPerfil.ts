import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { getPerfil, updatePerfil } from '@/modules/core/api/perfil'
import { listCidades, listEstados, type Cidade, type EnderecoCep, type Estado } from '@/modules/core/api/localidades'
import { useBuscaCep } from '@/modules/core/hooks/useBuscaCep'
import type { Perfil, PerfilFormData } from '@/modules/core/types'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { getErrorMessage } from '@/shared/lib/utils'

const perfilSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o seu nome').max(255, 'Máximo de 255 caracteres'),
    telefone: z.string().max(20, 'Máximo de 20 caracteres'),
    whatsapp: z.string().max(20, 'Máximo de 20 caracteres'),
    data_aniversario: z.string(),
    cep: z.string().max(10, 'Máximo de 10 caracteres'),
    rua: z.string().max(255, 'Máximo de 255 caracteres'),
    numero: z.string().max(20, 'Máximo de 20 caracteres'),
    complemento: z.string().max(100, 'Máximo de 100 caracteres'),
    bairro: z.string().max(255, 'Máximo de 255 caracteres'),
    id_estado: z.string(),
    id_cidade: z.string(),
  })
  .refine((dados) => !dados.id_estado || dados.id_cidade, {
    message: 'Selecione a cidade',
    path: ['id_cidade'],
  })

const paraFormulario = (perfil: Perfil | null): PerfilFormData => ({
  nome: perfil?.nome ?? '',
  telefone: perfil?.telefone ?? '',
  whatsapp: perfil?.whatsapp ?? '',
  data_aniversario: perfil?.data_aniversario?.slice(0, 10) ?? '',
  cep: perfil?.cep ?? '',
  rua: perfil?.rua ?? '',
  numero: perfil?.numero ?? '',
  complemento: perfil?.complemento ?? '',
  bairro: perfil?.bairro ?? '',
  id_estado: perfil?.id_estado?.toString() ?? '',
  id_cidade: perfil?.id_cidade?.toString() ?? '',
})

export const useMeuPerfil = () => {
  const updateUser = useAuthStore((state) => state.updateUser)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidadesCarregadas, setCidadesCarregadas] = useState<{ estado: string; lista: Cidade[] } | null>(null)

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: paraFormulario(null),
  })

  const estadoSelecionado = form.watch('id_estado')

  const aplicarPerfil = (atualizado: Perfil) => {
    setPerfil(atualizado)
    updateUser({ nome: atualizado.nome, name: atualizado.nome, foto_url: atualizado.foto_url })
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([getPerfil(), listEstados()])
      .then(([dados, listaEstados]) => {
        if (cancelled) return
        setPerfil(dados)
        setEstados(listaEstados)
        form.reset(paraFormulario(dados))
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar o seu perfil.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [form])

  useEffect(() => {
    if (!estadoSelecionado) return

    let cancelled = false

    listCidades(estadoSelecionado)
      .then((lista) => {
        if (!cancelled) setCidadesCarregadas({ estado: estadoSelecionado, lista })
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar as cidades.'))
      })

    return () => {
      cancelled = true
    }
  }, [estadoSelecionado])

  const cidadesProntas = Boolean(estadoSelecionado) && cidadesCarregadas?.estado === estadoSelecionado

  const preencherEndereco = useCallback((endereco: EnderecoCep) => {
    const opcoes = { shouldDirty: true, shouldValidate: true }

    form.setValue('cep', endereco.cep, opcoes)
    if (endereco.logradouro) form.setValue('rua', endereco.logradouro, opcoes)
    if (endereco.bairro) form.setValue('bairro', endereco.bairro, opcoes)
    if (endereco.complemento && !form.getValues('complemento')) form.setValue('complemento', endereco.complemento, opcoes)
    if (endereco.id_estado) form.setValue('id_estado', endereco.id_estado.toString(), { shouldDirty: true })
    if (endereco.id_cidade) form.setValue('id_cidade', endereco.id_cidade.toString(), opcoes)

    form.setFocus('numero')
  }, [form])

  const { buscar: buscarCep, isBuscando: isBuscandoCep } = useBuscaCep({ onEncontrado: preencherEndereco })

  const salvar = form.handleSubmit(async (valores) => {
    setIsSaving(true)

    try {
      const resposta = await updatePerfil(valores)
      aplicarPerfil(resposta.data)
      form.reset(paraFormulario(resposta.data))
      toast.success(resposta.message || 'Perfil atualizado.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o perfil.'))
    } finally {
      setIsSaving(false)
    }
  })

  return {
    perfil,
    isLoading,
    isSaving,
    form,
    salvar,
    estados,
    estadoSelecionado,
    cidades: cidadesProntas ? cidadesCarregadas?.lista ?? [] : [],
    isLoadingCidades: Boolean(estadoSelecionado) && !cidadesProntas,
    buscarCep,
    isBuscandoCep,
    aplicarPerfil,
  }
}
