import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { listMeusAlunos } from '../../../api/alunos'
import { criarSolicitacao } from '../../../api/solicitacoes'
import { listMinhasTurmas } from '../../../api/turmas'
import type { AlunoDoProfessor, AulaTipo, SolicitacaoAula, TurmaDoProfessor } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

const schema = z
  .object({
    alvo: z.enum(['turma', 'aluno']),
    id_turma: z.string(),
    id_aluno: z.string(),
    id_curso: z.string(),
    tipo_aula: z.enum(['regular', 'reposicao', 'reforco', 'extra']),
    data: z.string().min(1, 'Informe a data'),
    hora_inicio: z.string().regex(HORA, 'Informe o início'),
    hora_termino: z.string().regex(HORA, 'Informe o término'),
    motivo: z.string().max(1000, 'Máximo de 1000 caracteres'),
  })
  .superRefine((dados, ctx) => {
    if (dados.alvo === 'turma' && !dados.id_turma) {
      ctx.addIssue({ code: 'custom', path: ['id_turma'], message: 'Escolha a turma' })
    }
    if (dados.alvo === 'aluno' && !dados.id_aluno) {
      ctx.addIssue({ code: 'custom', path: ['id_aluno'], message: 'Escolha o aluno' })
    }
    if (dados.alvo === 'aluno' && dados.id_aluno && !dados.id_curso) {
      ctx.addIssue({ code: 'custom', path: ['id_curso'], message: 'Escolha o curso' })
    }
    if (dados.data && dados.data < format(new Date(), 'yyyy-MM-dd')) {
      ctx.addIssue({ code: 'custom', path: ['data'], message: 'A aula não pode ser no passado' })
    }
    if (HORA.test(dados.hora_inicio) && HORA.test(dados.hora_termino) && dados.hora_termino <= dados.hora_inicio) {
      ctx.addIssue({ code: 'custom', path: ['hora_termino'], message: 'O término deve ser depois do início' })
    }
  })

type NovaAulaValues = z.infer<typeof schema>

const VAZIO: NovaAulaValues = {
  alvo: 'turma',
  id_turma: '',
  id_aluno: '',
  id_curso: '',
  tipo_aula: 'extra',
  data: '',
  hora_inicio: '',
  hora_termino: '',
  motivo: '',
}

export const useNovaAulaForm = (aberto: boolean, onConcluido: (solicitacao: SolicitacaoAula) => void) => {
  const [turmas, setTurmas] = useState<TurmaDoProfessor[]>([])
  const [alunos, setAlunos] = useState<AlunoDoProfessor[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<NovaAulaValues>({ resolver: zodResolver(schema), defaultValues: VAZIO })
  const idAluno = form.watch('id_aluno')

  useEffect(() => {
    if (!aberto) return
    form.reset(VAZIO)
    let cancelled = false

    Promise.all([listMinhasTurmas({ situacao: 'ativas' }), listMeusAlunos()])
      .then(([listaTurmas, listaAlunos]) => {
        if (cancelled) return
        setTurmas(listaTurmas)
        setAlunos(listaAlunos)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar turmas e alunos.'))
      })

    return () => {
      cancelled = true
    }
  }, [aberto, form])

  const cursosDoAluno = useMemo(() => {
    const aluno = alunos.find((a) => String(a.id) === idAluno)
    const cursos = new Map<number, string>()
    aluno?.matriculas.forEach((m) => m.curso && cursos.set(m.curso.id, m.curso.nome))
    return [...cursos].map(([id, nome]) => ({ id, nome }))
  }, [alunos, idAluno])

  useEffect(() => {
    if (cursosDoAluno.length === 1) form.setValue('id_curso', String(cursosDoAluno[0].id))
  }, [cursosDoAluno, form])

  const enviar = form.handleSubmit(async (valores) => {
    setIsSaving(true)
    try {
      const solicitacao = await criarSolicitacao({
        tipo: 'criacao',
        ...(valores.alvo === 'turma'
          ? { id_turma: Number(valores.id_turma) }
          : { id_aluno_especifico: Number(valores.id_aluno), id_curso: Number(valores.id_curso) }),
        tipo_aula: valores.tipo_aula as AulaTipo,
        data_sugerida: valores.data,
        hora_inicio_sugerida: valores.hora_inicio,
        hora_termino_sugerida: valores.hora_termino,
        motivo: valores.motivo.trim() || null,
      })
      toast.success(solicitacao.status === 'aprovada' ? 'Aula agendada.' : 'Pedido de nova aula enviado para a secretaria.')
      onConcluido(solicitacao)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar o pedido.'))
    } finally {
      setIsSaving(false)
    }
  })

  return { form, turmas, alunos, cursosDoAluno, isSaving, enviar }
}
