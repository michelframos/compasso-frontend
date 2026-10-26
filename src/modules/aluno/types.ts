export interface AlunoAutenticado {
  id: number
  id_usuario: number
  nome: string
  email: string | null
}

export interface ProximaAula {
  origem: 'aula' | 'horario'
  id: number
  data: string
  hora_inicio: string
  hora_termino: string
  status: string | null
  tipo: string | null
  turma: string
  dia_semana: string | null
}

export interface MensalidadePainel {
  id: number
  descricao: string
  valor: number
  data_vencimento: string
  status: string
  situacao: 'atrasada' | 'vence_hoje' | 'a_vencer'
}

export interface ResumoFinanceiro {
  disponivel: boolean
  proxima_mensalidade: MensalidadePainel | null
  em_aberto: number
  atrasadas: number
  valor_em_aberto: number
  valor_atrasado: number
}

export interface ApresentacaoPainel {
  id: number
  titulo_musica: string
  espetaculo: string
  data_evento: string
  local: string | null
}

export interface AvisoPainel {
  tipo: 'cancelada' | 'remarcada'
  titulo: string
  mensagem: string
  data: string | null
}

export interface HorarioMatricula {
  dia_semana: string
  hora_inicio: string
  hora_termino: string
}

export interface MatriculaDoAluno {
  id: number
  tipo: 'turma' | 'curso'
  status: string | null
  data: string | null
  curso: { id: number; nome: string } | null
  nivel: { id: number; nome: string } | null
  turma: { id: number; nome: string; status: string | null } | null
  professor: { id: number; nome: string | null } | null
  horarios: HorarioMatricula[]
  periodo: { inicio: string | null; fim: string | null }
}

export interface HistoricoMatricula {
  id: number
  id_matricula: number
  id_turma_origem: number | null
  turma_origem: { id: number; nome: string } | null
  id_turma_destino: number | null
  turma_destino: { id: number; nome: string } | null
  data_transferencia: string | null
  motivo: string | null
}

export interface MarcoAgenda {
  data: string | null
  hora_inicio: string
  hora_termino: string
}

export interface ItemAgenda {
  tipo: 'aula' | 'apresentacao' | 'ensaio'
  id: number
  data: string
  hora_inicio: string | null
  hora_termino: string | null
  titulo: string
  detalhe: string | null
  status: string | null
  remarcada: boolean
  remarcacao: { de: MarcoAgenda | null; para: MarcoAgenda | null } | null
}

export interface AgendaAluno {
  inicio: string
  fim: string
  espetaculos: boolean
  itens: ItemAgenda[]
}

export interface ResumoFrequencia {
  total: number
  presentes: number
  ausentes: number
  justificados: number
  percentual: number | null
}

export interface AulaFrequencia {
  id: number
  id_aula: number
  data: string
  hora_inicio: string
  hora_termino: string
  status: 'presente' | 'ausente' | 'justificado'
}

export interface JustificativaDoAluno {
  id: number
  id_aula_turma: number
  tipo: 'aviso_previo' | 'justificativa'
  motivo: string
  status: 'pendente' | 'aceita' | 'recusada'
  anexo_url: string | null
  decidido_em: string | null
}

export interface AulaReposicao {
  id: number
  data: string
  hora_inicio: string
  hora_termino: string
  turma: string | null
}

export interface ReposicaoDoAluno {
  id: number
  id_aula_turma_perdida: number
  id_aula_turma_destino: number | null
  motivo: string
  status: 'pendente' | 'aprovada' | 'recusada'
  destino: AulaReposicao | null
  decidido_em: string | null
}

export interface RegrasReposicao {
  limite_periodo: number | null
  prazo_dias: number | null
  usados_no_periodo: number
}

export interface TurmaFrequencia extends ResumoFrequencia {
  id_matricula: number | null
  id_turma: number | null
  nome: string
  curso: string | null
  status_matricula: string | null
  aulas: AulaFrequencia[]
}

export interface FrequenciaAluno {
  resumo: ResumoFrequencia
  turmas: TurmaFrequencia[]
}

export interface AvaliacaoDoBoletim {
  id: number
  data: string | null
  tipo: string
  nota: number | null
  conceito: string | null
  comentario: string | null
  professor: string | null
  turma: string | null
}

export interface ObservacaoDoBoletim {
  id: number
  data: string | null
  tipo: string
  texto: string
  professor: string | null
  turma: string | null
}

export interface MatriculaBoletim {
  id_matricula: number | null
  id_turma: number | null
  nome: string
  curso: string | null
  status_matricula: string | null
  nivel: { id: number; nome: string } | null
  avaliacoes: AvaliacaoDoBoletim[]
  observacoes: ObservacaoDoBoletim[]
}

export interface BoletimAluno {
  matriculas: MatriculaBoletim[]
}

export interface MaterialDoAluno {
  id: number
  titulo: string
  descricao: string | null
  tipo: 'arquivo' | 'link'
  file_url: string | null
  file_type: string | null
  link: string | null
  turma: { id: number; nome: string; curso: string | null }
  created_at: string | null
}

export interface PagamentoDoAluno {
  id: number
  valor_pago: number
  data_pagamento: string
  forma_pagamento: string
}

export interface EnsaioDaApresentacao {
  id: number
  data: string
  hora_inicio: string
  hora_termino: string
  local: string | null
}

export interface ApresentacaoDoAluno {
  id: number
  titulo_musica: string | null
  ordem_entrada: number | null
  duracao_estimada: string | null
  papel: string | null
  tamanho_figurino: string | null
  recebeu_figurino: boolean
  espetaculo: {
    id: number
    titulo: string
    data_evento: string
    local: string | null
    status: string
  } | null
  turma: { id: number; nome: string | null } | null
  ensaios: EnsaioDaApresentacao[]
}

export interface MedidaDoAluno {
  id: number
  id_aluno: number
  medida_torax: number | null
  medida_cintura: number | null
  medida_quadril: number | null
  medida_altura: number | null
  ativo: boolean
  criado_em: string | null
}

export interface MedidasDoAluno {
  data: MedidaDoAluno[]
  pode_editar: boolean
}

export interface InstrumentoDoAluno {
  id: number
  nome: string
  tipo: string
  numero_serie: string | null
  status: string
  data_emprestimo: string | null
  data_prevista_devolucao: string | null
}

export interface HistoricoInstrumento {
  id: number
  acao: 'emprestimo' | 'devolucao' | 'manutencao'
  data: string
  instrumento: { id: number; nome: string; tipo: string } | null
}

export interface InstrumentosDoAluno {
  atuais: InstrumentoDoAluno[]
  historico: HistoricoInstrumento[]
}

export interface ContratoDoAluno {
  id: number
  nome: string | null
  contrato_gerado: string | null
  aceito: boolean
  aceito_em: string | null
}

export interface CertificadoDoAluno {
  id: number
  codigo_verificacao: string
  emitido_em: string | null
  carga_horaria: number | null
  curso: string | null
  turma: string | null
  nivel: string | null
}

export interface Dependente {
  id: number
  nome: string
  email: string | null
  parentesco: string | null
}

export interface ContaDoAluno {
  id: number
  id_matricula: number | null
  descricao: string
  valor: number
  saldo_devedor: number
  data_vencimento: string
  status: string
  situacao: 'atrasada' | 'vence_hoje' | 'a_vencer' | 'paga'
  aluno?: { id: number; nome: string | null }
  pagamentos: PagamentoDoAluno[]
}

export interface PixDaConta {
  payload: string
  qr_code: string
  valor: number
  descricao: string
}

export interface PainelAluno {
  data_referencia: string
  proxima_aula: ProximaAula | null
  proximas_aulas: ProximaAula[]
  financeiro: ResumoFinanceiro
  apresentacao: {
    disponivel: boolean
    proxima: ApresentacaoPainel | null
  }
  avisos: AvisoPainel[]
}
