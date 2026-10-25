import React from 'react'
import { avisosProfessorApi } from '../../api/avisos'
import { HistoricoAvisos } from '../../components/avisos/HistoricoAvisos'
import { fontesDoProfessor } from '../../components/avisos/fontes'

export const AvisosPage: React.FC = () => (
  <HistoricoAvisos
    api={avisosProfessorApi}
    fontes={fontesDoProfessor}
    descricao="Recados para suas turmas e alunos, e os avisos automáticos de aulas canceladas ou remarcadas."
  />
)

export default AvisosPage
