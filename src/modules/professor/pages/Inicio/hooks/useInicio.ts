import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getProfessorAutenticado } from '../../../api/me'
import { getPainel } from '../../../api/painel'
import type { AulaDoProfessor, PainelProfessor, ProfessorAutenticado } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useInicio = () => {
  const navigate = useNavigate()
  const [professor, setProfessor] = useState<ProfessorAutenticado | null>(null)
  const [painel, setPainel] = useState<PainelProfessor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [emAlteracao, setEmAlteracao] = useState<AulaDoProfessor | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([getProfessorAutenticado(), getPainel()])
      .then(([professorResult, painelResult]) => {
        if (cancelled) return
        if (professorResult.status === 'fulfilled') setProfessor(professorResult.value)
        if (painelResult.status === 'fulfilled') {
          setPainel(painelResult.value)
        } else {
          toast.error(getErrorMessage(painelResult.reason, 'Não foi possível carregar o painel.'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const recarregarPainel = useCallback(() => {
    getPainel()
      .then(setPainel)
      .catch((err) => toast.error(getErrorMessage(err, 'Não foi possível atualizar o painel.')))
  }, [])

  const proximasAulas = useMemo(
    () => painel?.aulas_semana.filter((aula) => aula.data > painel.data_referencia) ?? [],
    [painel]
  )

  const abrirChamada = (aula: AulaDoProfessor) => navigate(`/professor/aulas/${aula.id}/chamada`)

  return {
    professor,
    painel,
    proximasAulas,
    isLoading,
    abrirChamada,
    emAlteracao,
    abrirAlteracao: setEmAlteracao,
    fecharAlteracao: () => setEmAlteracao(null),
    recarregarPainel,
  }
}
