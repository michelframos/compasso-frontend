import React from 'react'
import { avisosEquipeApi, HistoricoAvisos, MATRICULAS_ENCERRADAS, porNome, type FontesAviso } from '@/modules/professor'
import { getTurma, listTurmas } from '../../api/turmas'
import type { Turma } from '../Turmas/types'

const TURMAS_ENCERRADAS = ['concluida', 'cancelada']

const nomeTurma = (turma: Turma) => turma.descricao || [turma.curso?.nome, turma.nivel?.nome].filter(Boolean).join(' · ') || `Turma #${turma.id}`

const todasAsTurmas = async () => {
  const primeira = await listTurmas({ page: 1 })
  const demais = await Promise.all(
    Array.from({ length: primeira.meta.last_page - 1 }, (_, i) => listTurmas({ page: i + 2 }))
  )
  return [primeira, ...demais].flatMap((pagina) => pagina.data)
}

const fontesDaEquipe: FontesAviso = {
  turmas: async () =>
    (await todasAsTurmas())
      .filter((t) => !TURMAS_ENCERRADAS.includes(t.status))
      .map((t) => ({ id: t.id, nome: nomeTurma(t) }))
      .sort(porNome),
  alunosDaTurma: async (idTurma) => {
    const { data } = (await getTurma(idTurma)) as { data: Turma }
    return (data.matriculas ?? [])
      .filter((m) => !MATRICULAS_ENCERRADAS.includes(m.status))
      .map((m) => ({ id: m.id_aluno, nome: m.aluno?.usuario.nome ?? `Aluno #${m.id_aluno}` }))
      .sort(porNome)
  },
}

export const AvisosPage: React.FC = () => (
  <HistoricoAvisos
    api={avisosEquipeApi}
    fontes={fontesDaEquipe}
    mostrarAutor
    descricao="Todos os avisos enviados por professores e pela secretaria, e os automáticos de aulas alteradas."
  />
)

export default AvisosPage
