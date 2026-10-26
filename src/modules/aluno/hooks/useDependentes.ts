import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useAlunoAtivoStore } from '@/shared/store/useAlunoAtivoStore'
import { listarDependentes } from '../api/dependentes'
import type { Dependente } from '../types'

/** Carrega os dependentes do responsável e garante um aluno selecionado. */
export function useDependentes() {
  const role = useAuthStore((state) => state.user?.role)
  const idAluno = useAlunoAtivoStore((state) => state.idAluno)
  const setIdAluno = useAlunoAtivoStore((state) => state.setIdAluno)
  const responsavel = role === 'responsavel'
  const [dependentes, setDependentes] = useState<Dependente[]>([])
  const [pronto, setPronto] = useState(!responsavel)

  useEffect(() => {
    if (!responsavel) {
      setPronto(true)
      return
    }

    let ativo = true
    listarDependentes()
      .then((lista) => {
        if (!ativo) return
        setDependentes(lista)
        const atual = useAlunoAtivoStore.getState().idAluno
        if (!lista.some((dependente) => dependente.id === atual)) {
          setIdAluno(lista[0]?.id ?? null)
        }
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar os dependentes.'))
      })
      .finally(() => {
        if (ativo) setPronto(true)
      })

    return () => {
      ativo = false
    }
  }, [responsavel, setIdAluno])

  return { responsavel, dependentes, idAluno, setIdAluno, pronto }
}
