import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import type { AvisosApi } from '../../api/avisos'
import type { AlvoAvisoPayload, AvisoTurma, OpcoesAviso, PreviaAviso } from '../../types'
import type { AlvoAviso, FontesAviso } from './fontes'
import { getErrorMessage } from '@/shared/lib/utils'

const schema = z
  .object({
    alvo: z.enum(['turma', 'alunos']),
    id_turma: z.string(),
    turma_inteira: z.boolean(),
    ids_alunos: z.array(z.number()),
    publico: z.enum(['alunos', 'responsaveis', 'ambos']),
    canais: z.array(z.enum(['email', 'whatsapp'])).min(1, 'Escolha ao menos um canal'),
    titulo: z.string().trim().min(1, 'Informe o título').max(120, 'Máximo de 120 caracteres'),
    mensagem: z.string().trim().min(1, 'Escreva a mensagem').max(2000, 'Máximo de 2000 caracteres'),
  })
  .superRefine((dados, ctx) => {
    if (dados.alvo === 'turma' && !dados.id_turma) {
      ctx.addIssue({ code: 'custom', path: ['id_turma'], message: 'Escolha a turma' })
    }
    const escolhendo = dados.alvo === 'alunos' || !dados.turma_inteira
    if (escolhendo && dados.ids_alunos.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['ids_alunos'], message: 'Escolha ao menos um aluno' })
    }
  })

export type NovoAvisoValues = z.infer<typeof schema>

const VAZIO: NovoAvisoValues = {
  alvo: 'turma',
  id_turma: '',
  turma_inteira: true,
  ids_alunos: [],
  publico: 'alunos',
  canais: ['email'],
  titulo: '',
  mensagem: '',
}

/** O alvo como a API espera, ou null enquanto falta escolher turma ou alunos. */
const montarAlvo = (v: Pick<NovoAvisoValues, 'alvo' | 'id_turma' | 'turma_inteira' | 'ids_alunos' | 'publico' | 'canais'>): AlvoAvisoPayload | null => {
  if (v.canais.length === 0) return null
  if (v.alvo === 'turma') {
    if (!v.id_turma) return null
    if (!v.turma_inteira && v.ids_alunos.length === 0) return null
    return {
      id_turma: Number(v.id_turma),
      ...(v.turma_inteira ? {} : { ids_alunos: v.ids_alunos }),
      publico: v.publico,
      canais: v.canais,
    }
  }
  return v.ids_alunos.length > 0 ? { ids_alunos: v.ids_alunos, publico: v.publico, canais: v.canais } : null
}

interface Opcoes {
  aberto: boolean
  api: AvisosApi
  fontes: FontesAviso
  turmaInicial?: number
  onConcluido: (aviso: AvisoTurma) => void
}

export const useNovoAvisoForm = ({ aberto, api, fontes, turmaInicial, onConcluido }: Opcoes) => {
  const [opcoes, setOpcoes] = useState<OpcoesAviso | null>(null)
  const [turmas, setTurmas] = useState<AlvoAviso[]>([])
  const [alunosAvulsos, setAlunosAvulsos] = useState<AlvoAviso[]>([])
  const [alunosDaTurma, setAlunosDaTurma] = useState<{ idTurma: string; alunos: AlvoAviso[] } | null>(null)
  const [previa, setPrevia] = useState<{ chave: string; dados: PreviaAviso | null } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<NovoAvisoValues>({ resolver: zodResolver(schema), defaultValues: VAZIO })
  const [alvo, idTurma, turmaInteira, idsAlunos, publico, canais] = useWatch({
    control: form.control,
    name: ['alvo', 'id_turma', 'turma_inteira', 'ids_alunos', 'publico', 'canais'],
  })

  useEffect(() => {
    if (!aberto) return
    form.reset({ ...VAZIO, id_turma: turmaInicial ? String(turmaInicial) : '' })
    let cancelled = false

    Promise.all([api.opcoes(), fontes.turmas(), fontes.alunos?.() ?? Promise.resolve([])])
      .then(([opcoesCarregadas, listaTurmas, listaAlunos]) => {
        if (cancelled) return
        setOpcoes(opcoesCarregadas)
        setTurmas(listaTurmas)
        setAlunosAvulsos(listaAlunos)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar turmas e canais.'))
      })

    return () => {
      cancelled = true
    }
  }, [aberto, api, fontes, turmaInicial, form])

  useEffect(() => {
    if (!aberto || !idTurma) return
    let cancelled = false

    fontes
      .alunosDaTurma(Number(idTurma))
      .then((alunos) => !cancelled && setAlunosDaTurma({ idTurma, alunos }))
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar os alunos da turma.'))
      })

    return () => {
      cancelled = true
    }
  }, [aberto, fontes, idTurma])

  const alvoAtual = useMemo(
    () => montarAlvo({ alvo, id_turma: idTurma, turma_inteira: turmaInteira, ids_alunos: idsAlunos, publico, canais }),
    [alvo, idTurma, turmaInteira, idsAlunos, publico, canais]
  )
  const chavePrevia = alvoAtual ? JSON.stringify(alvoAtual) : null

  useEffect(() => {
    if (!aberto || !chavePrevia) return
    let cancelled = false

    const timer = setTimeout(() => {
      api
        .previa(JSON.parse(chavePrevia) as AlvoAvisoPayload)
        .then((dados) => !cancelled && setPrevia({ chave: chavePrevia, dados }))
        .catch(() => !cancelled && setPrevia({ chave: chavePrevia, dados: null }))
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [aberto, api, chavePrevia])

  const enviar = form.handleSubmit(async (valores) => {
    const alvoEnvio = montarAlvo(valores)
    if (!alvoEnvio) return
    setIsSaving(true)
    try {
      const aviso = await api.enviar({ ...alvoEnvio, titulo: valores.titulo.trim(), mensagem: valores.mensagem.trim() })
      toast.success(`Aviso enviado para ${aviso.totais?.alunos ?? 0} aluno(s). Acompanhe a entrega no histórico.`)
      onConcluido(aviso)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar o aviso.'))
    } finally {
      setIsSaving(false)
    }
  })

  return {
    form,
    opcoes,
    turmas,
    alunosAvulsos,
    alunosDaTurma: alunosDaTurma && alunosDaTurma.idTurma === idTurma ? alunosDaTurma.alunos : null,
    previa: previa && previa.chave === chavePrevia ? previa.dados : undefined,
    carregandoPrevia: !!chavePrevia && previa?.chave !== chavePrevia,
    limiteAtingido: opcoes?.limite?.restantes === 0,
    isSaving,
    enviar,
  }
}
