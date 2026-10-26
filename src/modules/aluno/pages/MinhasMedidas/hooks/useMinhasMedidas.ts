import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { atualizarMedida, listarMedidas } from '../../../api/medidas'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { MedidaDoAluno } from '../../../types'

export function useMinhasMedidas() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [medidas, setMedidas] = useState<MedidaDoAluno[]>([])
  const [podeEditar, setPodeEditar] = useState(false)
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aguardandoDependente) {
      setMedidas([])
      setPodeEditar(false)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    listarMedidas(params.id_aluno)
      .then((dados) => {
        if (!ativo) return
        setMedidas(dados.data)
        setPodeEditar(dados.pode_editar)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as medidas.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  const salvar = async (payload: Pick<MedidaDoAluno, 'medida_torax' | 'medida_cintura' | 'medida_quadril' | 'medida_altura'>) => {
    const atual = medidas[0]
    if (!atual) return

    setSalvando(true)
    try {
      const salva = await atualizarMedida(atual.id, payload, params.id_aluno)
      setMedidas((lista) => lista.map((item) => (item.id === salva.id ? salva : item)))
      toast.success('Medidas atualizadas.')
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível salvar as medidas.'))
    } finally {
      setSalvando(false)
    }
  }

  return { medidas, podeEditar, isLoading, salvando, aguardandoDependente, salvar }
}
