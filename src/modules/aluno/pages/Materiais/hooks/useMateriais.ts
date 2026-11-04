import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { estaOffline, lerCacheOffline, salvarCacheOffline } from '@/shared/lib/offlineCache'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarMateriais } from '../../../api/materiais'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { MaterialDoAluno } from '../../../types'

const RECURSO = 'materiais'

export function useMateriais() {
  const { role, idAluno, params } = useAlunoAtivo()
  const { offline } = useOnlineStatus()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [materiais, setMateriais] = useState<MaterialDoAluno[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)
  const [doCache, setDoCache] = useState(false)

  useEffect(() => {
    if (aguardandoDependente) {
      setMateriais([])
      setDoCache(false)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    const partes = [params.id_aluno]

    listarMateriais(params.id_aluno)
      .then((dados) => {
        if (!ativo) return
        setMateriais(dados)
        setDoCache(false)
        salvarCacheOffline(RECURSO, dados, partes)
      })
      .catch((erro) => {
        if (!ativo) return
        const cache = lerCacheOffline<MaterialDoAluno[]>(RECURSO, partes)
        if (cache && (estaOffline() || offline)) {
          setMateriais(cache.dados)
          setDoCache(true)
          return
        }
        setMateriais([])
        setDoCache(false)
        toast.error(getErrorMessage(erro, 'Não foi possível carregar os materiais.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno, offline])

  return { materiais, isLoading, aguardandoDependente, offline, doCache }
}
