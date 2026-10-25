import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listMeusAlunos } from '../../../api/alunos'
import type { AlunoDoProfessor, TipoMatricula } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export type FiltroTipo = TipoMatricula | 'todos'

export const useMeusAlunos = () => {
  const [alunos, setAlunos] = useState<AlunoDoProfessor[]>([])
  const [tipo, setTipo] = useState<FiltroTipo>('todos')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(() => {
      setIsLoading(true)
      listMeusAlunos({ tipo: tipo === 'todos' ? undefined : tipo, search: search.trim() })
        .then((data) => {
          if (!cancelled) setAlunos(data)
        })
        .catch((err) => {
          if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar seus alunos.'))
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, search ? 300 : 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [tipo, search])

  return { alunos, tipo, setTipo, search, setSearch, isLoading }
}
