import { useAuthStore } from '@/shared/store/useAuthStore'
import { useAlunoAtivoStore } from '@/shared/store/useAlunoAtivoStore'

/** Injeta `id_aluno` nas chamadas quando quem está logado é o responsável. */
export function useAlunoAtivo() {
  const role = useAuthStore((state) => state.user?.role)
  const idAluno = useAlunoAtivoStore((state) => state.idAluno)
  const setIdAluno = useAlunoAtivoStore((state) => state.setIdAluno)
  const params = role === 'responsavel' && idAluno ? { id_aluno: idAluno } : {}

  return { role, idAluno, setIdAluno, params }
}
