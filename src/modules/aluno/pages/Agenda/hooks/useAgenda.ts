import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { toast } from 'sonner'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { estaOffline, lerCacheOffline, salvarCacheOffline } from '@/shared/lib/offlineCache'
import { getErrorMessage } from '@/shared/lib/utils'
import { getAgenda } from '../../../api/agenda'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { AgendaAluno } from '../../../types'

export type VisaoAgenda = 'semana' | 'mes'

const SEMANA = { weekStartsOn: 1 as const }
const RECURSO = 'agenda'

function periodo(visao: VisaoAgenda, ancora: Date) {
  if (visao === 'semana') {
    const inicio = startOfWeek(ancora, SEMANA)
    const fim = endOfWeek(ancora, SEMANA)
    return { inicio, fim, dias: eachDayOfInterval({ start: inicio, end: fim }) }
  }

  const inicio = startOfWeek(startOfMonth(ancora), SEMANA)
  const fim = endOfWeek(endOfMonth(ancora), SEMANA)
  return { inicio, fim, dias: eachDayOfInterval({ start: inicio, end: fim }) }
}

export function useAgenda() {
  const { role, idAluno, params } = useAlunoAtivo()
  const { offline } = useOnlineStatus()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [visao, setVisao] = useState<VisaoAgenda>('semana')
  const [ancora, setAncora] = useState(() => new Date())
  const [agenda, setAgenda] = useState<AgendaAluno | null>(null)
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)
  const [doCache, setDoCache] = useState(false)

  const janela = useMemo(() => periodo(visao, ancora), [visao, ancora])
  const inicio = format(janela.inicio, 'yyyy-MM-dd')
  const fim = format(janela.fim, 'yyyy-MM-dd')

  useEffect(() => {
    if (aguardandoDependente) {
      setAgenda(null)
      setDoCache(false)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    const partes = [params.id_aluno, inicio, fim]

    getAgenda(inicio, fim, params.id_aluno)
      .then((dados) => {
        if (!ativo) return
        setAgenda(dados)
        setDoCache(false)
        salvarCacheOffline(RECURSO, dados, partes)
      })
      .catch((erro) => {
        if (!ativo) return
        const cache = lerCacheOffline<AgendaAluno>(RECURSO, partes)
        if (cache && (estaOffline() || offline)) {
          setAgenda(cache.dados)
          setDoCache(true)
          return
        }
        setAgenda(null)
        setDoCache(false)
        toast.error(getErrorMessage(erro, 'Não foi possível carregar a agenda.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, inicio, fim, params.id_aluno, offline])

  const mover = (direcao: -1 | 1) => {
    setAncora((atual) => (visao === 'semana' ? addWeeks(atual, direcao) : addMonths(atual, direcao)))
  }

  return {
    visao,
    setVisao,
    ancora,
    dias: janela.dias,
    agenda,
    isLoading,
    aguardandoDependente,
    offline,
    doCache,
    anterior: () => mover(-1),
    proximo: () => mover(1),
    hoje: () => setAncora(new Date()),
  }
}
