import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getPermissoesProfessor, salvarPermissoesProfessor } from '../../../api/permissoesProfessor'
import type { AcaoProfessorAula, ModoPermissaoAula, PermissoesProfessorAulas } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const usePermissoesProfessor = () => {
  const [permissoes, setPermissoes] = useState<PermissoesProfessorAulas | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alterando, setAlterando] = useState<AcaoProfessorAula | null>(null)

  useEffect(() => {
    let cancelled = false

    getPermissoesProfessor()
      .then((resposta) => {
        if (!cancelled) setPermissoes(resposta)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar as permissões dos professores.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const alterar = async (acao: AcaoProfessorAula, modo: ModoPermissaoAula) => {
    if (!permissoes || permissoes[acao] === modo) return
    setAlterando(acao)

    try {
      setPermissoes(await salvarPermissoesProfessor({ ...permissoes, [acao]: modo }))
      toast.success('Permissão atualizada.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar a permissão.'))
    } finally {
      setAlterando(null)
    }
  }

  return { permissoes, isLoading, alterando, alterar }
}
