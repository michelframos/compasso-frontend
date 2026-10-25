export { professorRoutes } from './routes'
export type {
  ProfessorAutenticado,
  PainelProfessor,
  AulaDoProfessor,
  TurmaDoProfessor,
  AlunoDaTurma,
  MaterialDaTurma,
  ExtratoProfessor,
  ResumoRemuneracao,
  FechamentoRemuneracao,
  SituacaoExtrato,
  SolicitacaoAula,
  TipoSolicitacaoAula,
  StatusSolicitacaoAula,
  DestinoCobranca,
  Disponibilidade,
  ProfessorLivre,
} from './types'
export type { AvisoTurma } from './types'
export { ResumoSolicitacao } from './components/solicitacoes/ResumoSolicitacao'
export { HistoricoAvisos } from './components/avisos/HistoricoAvisos'
export { MATRICULAS_ENCERRADAS, porNome, type AlvoAviso, type FontesAviso } from './components/avisos/fontes'
export { avisosEquipeApi } from './api/avisos'
export { DESTINO_COBRANCA, SOLICITACAO_STATUS, SOLICITACAO_TIPO } from './constants'
export { listProfessoresLivres } from './api/solicitacoes'
export { ExtratoDetalhado } from './components/extrato/ExtratoDetalhado'
export { NavegadorMes } from './components/extrato/NavegadorMes'
export { duracao, moeda } from './lib/formatters'
export * as professorMeApi from './api/me'
export * as professorPainelApi from './api/painel'
export * as professorTurmasApi from './api/turmas'
export * as professorMateriaisApi from './api/materiais'
