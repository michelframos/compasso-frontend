import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AlunoAtivoState {
  idAluno: number | null
  setIdAluno: (idAluno: number | null) => void
}

/** Dependente escolhido pelo responsável. O aluno autenticado não precisa deste id. */
export const useAlunoAtivoStore = create<AlunoAtivoState>()(
  persist(
    (set) => ({
      idAluno: null,
      setIdAluno: (idAluno) => set({ idAluno }),
    }),
    {
      name: 'aluno-ativo',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
