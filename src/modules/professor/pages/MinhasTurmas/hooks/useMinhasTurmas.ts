import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listMinhasTurmas } from '../../../api/turmas'
import type { SituacaoTurma, TurmaDoProfessor } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useMinhasTurmas = () => {
  const [turmas, setTurmas] = useState<TurmaDoProfessor[]>([])
  const [situacao, setSituacao] = useState<SituacaoTurma>('ativas')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(() => {
      setIsLoading(true)
      listMinhasTurmas({ situacao, search: search.trim() })
        .then((data) => {
          if (!cancelled) setTurmas(data)
        })
        .catch((err) => {
          if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar suas turmas.'))
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, search ? 300 : 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [situacao, search])

  return { turmas, situacao, setSituacao, search, setSearch, isLoading }
}
