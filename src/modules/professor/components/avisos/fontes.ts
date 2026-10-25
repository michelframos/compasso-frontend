import { listMeusAlunos } from '../../api/alunos'
import { getMinhaTurma, listMinhasTurmas } from '../../api/turmas'
import { apelidoTurma } from '../../lib/formatters'

export interface AlvoAviso {
  id: number
  nome: string
}

/** De onde o diálogo de aviso tira as turmas e os alunos que o usuário pode escolher. */
export interface FontesAviso {
  turmas: () => Promise<AlvoAviso[]>
  alunosDaTurma: (idTurma: number) => Promise<AlvoAviso[]>
  /** Sem esta fonte, o aviso é sempre para uma turma. */
  alunos?: () => Promise<AlvoAviso[]>
}

export const MATRICULAS_ENCERRADAS = ['cancelada', 'transferida']

export const porNome = (a: AlvoAviso, b: AlvoAviso) => a.nome.localeCompare(b.nome, 'pt-BR')

export const fontesDoProfessor: FontesAviso = {
  turmas: async () => (await listMinhasTurmas({ situacao: 'ativas' })).map((t) => ({ id: t.id, nome: apelidoTurma(t) })),
  alunosDaTurma: async (idTurma) =>
    ((await getMinhaTurma(idTurma)).matriculas ?? [])
      .filter((m) => !MATRICULAS_ENCERRADAS.includes(m.status))
      .map((m) => ({ id: m.id_aluno, nome: m.aluno?.usuario.nome ?? `Aluno #${m.id_aluno}` }))
      .sort(porNome),
  alunos: async () => (await listMeusAlunos()).map((a) => ({ id: a.id, nome: a.nome ?? `Aluno #${a.id}` })).sort(porNome),
}
