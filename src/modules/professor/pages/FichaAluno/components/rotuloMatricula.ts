import { apelidoTurma, nomeTurma } from '../../../lib/formatters'
import type { FichaAluno } from '../../../types'

export const rotuloMatricula = (matricula: FichaAluno['matriculas'][number]) =>
  matricula.tipo === 'curso'
    ? `${nomeTurma({ descricao: null, curso: matricula.curso, nivel: matricula.nivel })} · Individual`
    : apelidoTurma(matricula.turma)
