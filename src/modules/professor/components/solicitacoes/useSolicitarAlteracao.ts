import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { criarSolicitacao, getOpcoesSolicitacao, listProfessoresLivres } from '../../api/solicitacoes'
import { hora } from '../../lib/formatters'
import type { AulaDoProfessor, ModoPermissaoAula, OpcoesSolicitacao, PermissoesAulas, ProfessorLivre, SolicitacaoAula } from '../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export type TipoAlteracao = 'cancelamento' | 'reposicao' | 'substituicao'

const ACAO: Record<TipoAlteracao, keyof PermissoesAulas> = {
  cancelamento: 'excluir',
  reposicao: 'editar',
  substituicao: 'editar',
}

const TIPOS: TipoAlteracao[] = ['cancelamento', 'reposicao', 'substituicao']

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

const criarSchema = (temCobranca: boolean, substitutoObrigatorio: boolean) =>
  z
    .object({
      tipo: z.enum(['cancelamento', 'reposicao', 'substituicao']),
      motivo: z.string().trim().min(1, 'Informe o motivo').max(1000, 'Máximo de 1000 caracteres'),
      data_sugerida: z.string(),
      hora_inicio_sugerida: z.string(),
      hora_termino_sugerida: z.string(),
      id_professor_substituto: z.string(),
      destino_cobranca: z.string(),
      avisar_alunos: z.boolean(),
    })
    .superRefine((dados, ctx) => {
      if (dados.tipo === 'reposicao') {
        if (!dados.data_sugerida) {
          ctx.addIssue({ code: 'custom', path: ['data_sugerida'], message: 'Informe a data da reposição' })
        } else if (dados.data_sugerida < format(new Date(), 'yyyy-MM-dd')) {
          ctx.addIssue({ code: 'custom', path: ['data_sugerida'], message: 'A reposição não pode ser no passado' })
        }
        if (!HORA.test(dados.hora_inicio_sugerida)) {
          ctx.addIssue({ code: 'custom', path: ['hora_inicio_sugerida'], message: 'Informe o início' })
        }
        if (!HORA.test(dados.hora_termino_sugerida)) {
          ctx.addIssue({ code: 'custom', path: ['hora_termino_sugerida'], message: 'Informe o término' })
        } else if (dados.hora_termino_sugerida <= dados.hora_inicio_sugerida) {
          ctx.addIssue({ code: 'custom', path: ['hora_termino_sugerida'], message: 'O término deve ser depois do início' })
        }
      }
      if (dados.tipo === 'substituicao' && substitutoObrigatorio && !dados.id_professor_substituto) {
        ctx.addIssue({ code: 'custom', path: ['id_professor_substituto'], message: 'Escolha o professor substituto' })
      }
      if (temCobranca && dados.tipo !== 'substituicao' && !dados.destino_cobranca) {
        ctx.addIssue({ code: 'custom', path: ['destino_cobranca'], message: 'Escolha o destino da cobrança' })
      }
    })

type AlteracaoFormValues = z.infer<ReturnType<typeof criarSchema>>

const valoresIniciais = (tipo: TipoAlteracao, aula: AulaDoProfessor | null): AlteracaoFormValues => ({
  tipo,
  motivo: '',
  data_sugerida: '',
  hora_inicio_sugerida: hora(aula?.hora_inicio),
  hora_termino_sugerida: hora(aula?.hora_termino),
  id_professor_substituto: '',
  destino_cobranca: '',
  avisar_alunos: true,
})

export const useSolicitarAlteracao = (aula: AulaDoProfessor | null, onConcluido: (solicitacao: SolicitacaoAula) => void) => {
  const [opcoes, setOpcoes] = useState<OpcoesSolicitacao | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [professoresLivres, setProfessoresLivres] = useState<ProfessorLivre[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const permitidos = useMemo(
    () => (opcoes ? TIPOS.filter((tipo) => opcoes.permissoes[ACAO[tipo]] !== 'bloqueado') : []),
    [opcoes]
  )

  const temCobranca = opcoes?.tem_cobranca ?? false
  const substitutoObrigatorio = opcoes?.permissoes.editar === 'livre'
  const schema = useMemo(() => criarSchema(temCobranca, substitutoObrigatorio), [temCobranca, substitutoObrigatorio])

  const form = useForm<AlteracaoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais('cancelamento', aula),
  })

  const tipo = form.watch('tipo')

  useEffect(() => {
    if (!aula) return
    let cancelled = false
    setOpcoes(null)
    setProfessoresLivres(null)
    setCarregando(true)

    getOpcoesSolicitacao(aula.id)
      .then((resposta) => {
        if (cancelled) return
        setOpcoes(resposta)
        const primeiro = TIPOS.find((t) => resposta.permissoes[ACAO[t]] !== 'bloqueado') ?? 'cancelamento'
        form.reset(valoresIniciais(primeiro, aula))
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar as opções da aula.'))
      })
      .finally(() => {
        if (!cancelled) setCarregando(false)
      })

    return () => {
      cancelled = true
    }
  }, [aula, form])

  useEffect(() => {
    if (!aula || tipo !== 'substituicao' || professoresLivres !== null) return
    let cancelled = false

    listProfessoresLivres({
      data: aula.data.substring(0, 10),
      hora_inicio: hora(aula.hora_inicio),
      hora_termino: hora(aula.hora_termino),
      ignorar_aula: aula.id,
    })
      .then((lista) => {
        if (!cancelled) setProfessoresLivres(lista.filter((p) => p.id !== aula.id_professor))
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar os professores.'))
      })

    return () => {
      cancelled = true
    }
  }, [aula, tipo, professoresLivres])

  const modo = (t: TipoAlteracao): ModoPermissaoAula | null => (opcoes ? opcoes.permissoes[ACAO[t]] : null)

  const enviar = form.handleSubmit(async (valores) => {
    if (!aula) return
    setIsSaving(true)

    try {
      const solicitacao = await criarSolicitacao({
        tipo: valores.tipo,
        id_aula_turma: aula.id,
        motivo: valores.motivo.trim(),
        avisar_alunos: valores.avisar_alunos,
        ...(valores.tipo === 'reposicao' && {
          data_sugerida: valores.data_sugerida,
          hora_inicio_sugerida: valores.hora_inicio_sugerida,
          hora_termino_sugerida: valores.hora_termino_sugerida,
        }),
        ...(valores.tipo === 'substituicao' && {
          id_professor_substituto: valores.id_professor_substituto ? Number(valores.id_professor_substituto) : null,
        }),
        ...(temCobranca && valores.tipo !== 'substituicao' && {
          destino_cobranca: valores.destino_cobranca as 'proxima_aula' | 'cancelar',
        }),
      })
      toast.success(solicitacao.status === 'aprovada' ? 'Alteração aplicada na agenda.' : 'Solicitação enviada para a secretaria.')
      onConcluido(solicitacao)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar a solicitação.'))
    } finally {
      setIsSaving(false)
    }
  })

  return { form, tipo, opcoes, carregando, permitidos, modo, professoresLivres, isSaving, enviar }
}
