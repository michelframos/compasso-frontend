export type ModoPermissaoAula = 'livre' | 'aprovacao' | 'bloqueado'

export interface PermissoesAulas {
  criar: ModoPermissaoAula
  editar: ModoPermissaoAula
  excluir: ModoPermissaoAula
}

export interface ProfessorAutenticado {
  id: number
  id_usuario: number
  nome: string
  email: string
  foto: string | null
  telefone: string | null
  whatsapp: string | null
  permissoes_aulas: PermissoesAulas
}

export interface Disponibilidade {
  id?: number
  dia_semana: string
  hora_inicio: string
  hora_termino: string
}

export type TipoSolicitacaoAula = 'criacao' | 'cancelamento' | 'reposicao' | 'substituicao'

export type StatusSolicitacaoAula = 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'

export type DestinoCobranca = 'proxima_aula' | 'cancelar'

export interface AulaResumida {
  id: number
  data: string
  hora_inicio: string
  hora_termino: string
  status: AulaStatus
  tipo: AulaTipo
  titulo: string
  id_turma: number | null
  aluno: string | null
  professor: { id: number; nome: string } | null
}

export interface AnaliseSolicitacao {
  avisos: string[]
  tem_cobranca: boolean
  proxima_aula_cobranca: string | null
  disponibilidade: Disponibilidade[]
}

export interface SolicitacaoAula {
  id: number
  tipo: TipoSolicitacaoAula
  status: StatusSolicitacaoAula
  aplicada_automaticamente: boolean
  motivo: string | null
  data_sugerida: string | null
  hora_inicio_sugerida: string | null
  hora_termino_sugerida: string | null
  destino_cobranca: DestinoCobranca | null
  avisar_alunos: boolean
  motivo_decisao: string | null
  decidido_em: string | null
  created_at: string
  pode_cancelar: boolean
  aula: AulaResumida | null
  aula_gerada: AulaResumida | null
  nova_aula: {
    tipo_aula: AulaTipo | null
    turma: { id: number; titulo: string } | null
    curso: { id: number; nome: string } | null
    aluno: { id: number; nome: string } | null
  } | null
  professor: { id: number; nome: string } | null
  substituto: { id: number; nome: string } | null
  decisor: { nome: string } | null
  analise?: AnaliseSolicitacao
}

export interface SolicitacaoAulaPayload {
  tipo: TipoSolicitacaoAula
  id_aula_turma?: number | null
  motivo?: string | null
  data_sugerida?: string | null
  hora_inicio_sugerida?: string | null
  hora_termino_sugerida?: string | null
  id_professor_substituto?: number | null
  id_turma?: number | null
  id_aluno_especifico?: number | null
  id_curso?: number | null
  tipo_aula?: AulaTipo | null
  destino_cobranca?: DestinoCobranca | null
  avisar_alunos?: boolean
}

export interface OpcoesSolicitacao {
  permissoes: PermissoesAulas
  tem_cobranca: boolean
  proxima_aula_cobranca: string | null
  solicitacao_pendente: SolicitacaoAula | null
}

export interface ProfessorLivre {
  id: number
  nome: string | null
  conflito: boolean
  fora_disponibilidade: boolean
}

export type TurmaStatus = 'planejamento' | 'aberta' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada'

export type SituacaoTurma = 'ativas' | 'encerradas' | 'todas'

export type AulaStatus = 'agendada' | 'concluida' | 'cancelada'

export type AulaTipo = 'regular' | 'reposicao' | 'reforco' | 'extra'

export interface TurmaHorario {
  id: number
  id_turma: number
  dia_semana: string
  hora_inicio: string
  hora_termino: string
}

export interface AlunoDaTurma {
  id: number
  id_aluno: number
  id_turma: number
  status: string
  data: string | null
  aluno: {
    id: number
    usuario: {
      nome: string
      email: string
      telefone: string | null
      foto: string | null
    }
  } | null
}

export interface TurmaDoProfessor {
  id: number
  id_curso: number
  id_nivel: number
  id_professor: number | null
  descricao: string | null
  observacoes: string | null
  status: TurmaStatus
  maximo_alunos: number
  data_inicio: string | null
  data_fim: string | null
  alunos_ativos_count?: number
  curso?: { id: number; nome: string }
  nivel?: { id: number; nome: string }
  horarios?: TurmaHorario[]
  matriculas?: AlunoDaTurma[]
}

export type PresencaStatus = 'presente' | 'ausente' | 'justificado'

export interface PresencaLancada {
  id_aluno: number
  status: PresencaStatus
  observacao: string | null
}

export interface AulaDoProfessor {
  id: number
  id_turma: number | null
  id_professor: number | null
  data: string
  hora_inicio: string
  hora_termino: string
  status: AulaStatus | null
  tipo: AulaTipo
  conteudo_dado: string | null
  presencas_count?: number
  turma?: TurmaDoProfessor | null
  aluno_especifico?: { id: number; usuario: { nome: string } } | null
  presencas?: PresencaLancada[]
}

export interface ConcluirAulaPayload {
  conteudo_dado: string | null
  presencas: { id_aluno: number; status: PresencaStatus; observacao?: string | null }[]
}

export type DiarioPresenca = 'presente' | 'falta' | 'falta_justificada'

export interface DiarioTurma {
  id: number
  descricao: string | null
  curso: string
  nivel: string
  professor: string
  status: TurmaStatus
  data_inicio: string
  data_fim: string
  horarios: Pick<TurmaHorario, 'dia_semana' | 'hora_inicio' | 'hora_termino'>[]
  aulas: {
    id: number
    data: string
    hora_inicio: string
    conteudo_dado: string | null
    presencas: Record<string, DiarioPresenca>
  }[]
  alunos: {
    id_aluno: number
    nome: string
    data_matricula: string | null
    status: string
  }[]
}

export interface PainelContadores {
  aulas_hoje: number
  aulas_semana: number
  chamadas_pendentes: number
  turmas_ativas: number
  alunos_ativos: number
}

export interface PainelProfessor {
  data_referencia: string
  inicio_semana: string
  fim_semana: string
  contadores: PainelContadores
  aulas_hoje: AulaDoProfessor[]
  aulas_semana: AulaDoProfessor[]
  chamadas_pendentes: AulaDoProfessor[]
}

export interface MaterialDaTurma {
  id: number
  id_turma: number
  titulo: string
  descricao: string | null
  file_path: string | null
  file_url: string | null
  file_type: string | null
  link: string | null
  tipo: TipoMaterial
  publico: boolean
  created_at: string | null
}

export type TipoMaterial = 'arquivo' | 'link'

export type TipoObservacao = 'comportamento' | 'evolucao' | 'alerta' | 'geral'

type TurmaResumo = Pick<TurmaDoProfessor, 'id' | 'descricao'> & {
  curso: { nome: string } | null
  nivel: { nome: string } | null
}

export interface ObservacaoAluno {
  id: number
  id_aluno: number
  id_professor: number
  id_turma: number | null
  tipo: TipoObservacao
  texto: string
  visivel_responsavel: boolean
  pode_editar: boolean
  professor: { id: number; nome: string | null } | null
  turma: TurmaResumo | null
  created_at: string
  updated_at: string
}

export interface ObservacaoPayload {
  tipo: TipoObservacao
  texto: string
  visivel_responsavel: boolean
  id_turma?: number | null
}

export type TipoAvaliacao = 'pratica' | 'teorica' | 'apresentacao' | 'participacao' | 'outra'

export type ConceitoAvaliacao = 'excelente' | 'bom' | 'regular' | 'insuficiente'

export interface AvaliacaoAluno {
  id: number
  id_aluno: number
  /** Nulo = aulas individuais. */
  id_turma: number | null
  id_professor: number
  data: string
  tipo: TipoAvaliacao
  nota: number | null
  conceito: ConceitoAvaliacao | null
  comentario: string | null
  pode_editar: boolean
  aluno: { id: number; nome: string | null } | null
  professor: { id: number; nome: string | null } | null
  turma: TurmaResumo | null
  created_at: string
}

export interface AvaliacaoPayload {
  data: string
  tipo: TipoAvaliacao
  nota: number | null
  conceito: ConceitoAvaliacao | null
  comentario: string | null
  id_aluno?: number
  id_turma?: number | null
}

export type StatusProgressao = 'pendente' | 'aprovada' | 'rejeitada'

export interface SugestaoProgressao {
  id: number
  status: StatusProgressao
  justificativa: string
  motivo_decisao: string | null
  decidido_em: string | null
  created_at: string
  pode_cancelar: boolean
  aluno: { id: number; nome: string | null } | null
  matricula: {
    id: number
    tipo: TipoMatricula
    status: string | null
    curso: { nome: string } | null
    turma: { id: number; descricao: string | null } | null
  } | null
  nivel_atual: { id: number; nome: string } | null
  nivel_sugerido: { id: number; nome: string } | null
  professor: { id: number; nome: string | null } | null
  turma_destino: { id: number; descricao: string | null } | null
  decisor: { nome: string | null } | null
}

export interface NivelOpcao {
  id: number
  nome: string
  curso_id: number | null
  ordem: number | null
}

export interface ResumoFrequencia {
  total: number
  presentes: number
  ausentes: number
  justificados: number
  percentual_presenca: number | null
}

export interface FichaAluno {
  aluno: {
    id: number
    nome: string | null
    email: string | null
    telefone: string | null
    whatsapp: string | null
    foto_url: string | null
    data_nascimento: string | null
    idade: number | null
    responsaveis: {
      id: number
      nome: string | null
      parentesco: string | null
      telefone: string | null
      whatsapp: string | null
    }[]
  }
  matriculas: {
    id: number
    tipo: 'turma' | 'curso'
    id_turma: number | null
    id_curso: number | null
    id_nivel: number | null
    status: string | null
    data: string | null
    curso: { nome: string } | null
    nivel: { nome: string } | null
    turma: (TurmaResumo & { status: TurmaStatus }) | null
  }[]
  frequencia: ResumoFrequencia & {
    /** `id_turma` nulo agrupa as aulas individuais (sem turma). */
    por_turma: (ResumoFrequencia & { id_turma: number | null })[]
    ultimas: {
      id_aula: number
      id_turma: number | null
      data: string
      status: PresencaStatus
      observacao: string | null
    }[]
  }
  observacoes: ObservacaoAluno[]
  avaliacoes: AvaliacaoAluno[]
  progressoes: SugestaoProgressao[]
}

export type TipoMatricula = 'turma' | 'curso'

export interface AlunoDoProfessor {
  id: number
  nome: string | null
  email: string | null
  telefone: string | null
  foto_url: string | null
  matriculas: {
    id: number
    tipo: TipoMatricula
    status: string | null
    id_turma: number | null
    turma: { id: number; descricao: string | null } | null
    curso: { id: number; nome: string } | null
    nivel: { nome: string } | null
  }[]
}

export interface FrequenciaDoAluno {
  id: number
  nome_aluno: string
  total_aulas: number
  total_presencas: number
  /** Inclui as justificadas. */
  total_faltas: number
  total_justificadas: number
  taxa_absenteismo: number
  /** Faltas não justificadas seguidas até o fim do período (ou hoje). */
  faltas_consecutivas: number
  em_risco: boolean
}

export interface RelatorioFrequencia {
  data: FrequenciaDoAluno[]
  summary: {
    total_alunos: number
    media_absenteismo: number
    alunos_em_risco: number
  }
  filters: {
    data_inicio: string
    data_fim: string
    id_turma: number | null
    limite_faltas: number
  }
}

export type SituacaoApresentacao = 'proximas' | 'passadas' | 'todas'

export type StatusEspetaculo = 'planejamento' | 'ensaios' | 'concluido' | 'cancelado'

export interface EnsaioAgendado {
  id: number
  id_apresentacao: number
  id_professor: number | null
  data: string
  hora_inicio: string
  hora_termino: string
  local: string | null
  observacoes: string | null
  pode_editar: boolean
  professor: { id: number; nome: string | null } | null
  /** Só na agenda geral (`/ensaios`). */
  apresentacao: {
    id: number
    titulo_musica: string | null
    turma: { id: number; descricao: string | null } | null
    espetaculo: { id: number; titulo: string; data_evento: string } | null
  } | null
}

export interface EnsaioPayload {
  data: string
  hora_inicio: string
  hora_termino: string
  local: string | null
  observacoes: string | null
}

export interface ParticipanteApresentacao {
  id: number
  id_aluno: number
  nome: string | null
  meu_aluno: boolean
  papel: string | null
  tamanho_figurino: string | null
  recebeu_figurino: boolean
  presenca_ensaio_geral: boolean
}

export interface ApresentacaoDoProfessor {
  id: number
  titulo_musica: string | null
  ordem_entrada: number | null
  duracao_estimada: string | null
  espetaculo: {
    id: number
    titulo: string
    data_evento: string
    local: string | null
    status: StatusEspetaculo
  } | null
  turma: {
    id: number
    descricao: string | null
    curso: { nome: string } | null
    nivel: { nome: string } | null
    minha: boolean
  } | null
  total_participantes: number
  meus_alunos: number
  proximo_ensaio: Pick<EnsaioAgendado, 'id' | 'data' | 'hora_inicio' | 'hora_termino' | 'local'> | null
  ensaios_futuros: number
  pode_agendar_ensaio: boolean
  /** Só no detalhe. */
  participantes?: ParticipanteApresentacao[]
  ensaios?: EnsaioAgendado[]
}

export interface MaterialPayload {
  titulo: string
  descricao: string | null
  publico: boolean
  /** Na edição, omitir arquivo e link mantém o conteúdo atual. */
  arquivo?: File | null
  link?: string | null
}

/** em_andamento: mês corrente (parcial); aberto: encerrado, aguardando fechamento; fechado: valores congelados. */
export type SituacaoExtrato = 'em_andamento' | 'aberto' | 'fechado'

export type StatusContaPagamento = 'pendente' | 'pago' | 'pago_parcialmente' | 'vencido' | 'cancelado'

export interface TurmaRemuneracao {
  id: number
  descricao: string | null
  curso: { nome: string } | null
  nivel: { nome: string } | null
}

export interface ResumoRemuneracao {
  salario_fixo: number
  total_aulas: number
  total_horas: number
  valor_hora_aula: number
  base_comissao: number
  valor_comissao: number
  valor_total: number
}

export interface AulaRemunerada {
  id: number
  data: string
  hora_inicio: string
  hora_termino: string
  tipo: string | null
  horas: number
  valor_hora: number
  valor: number
  turma: TurmaRemuneracao | null
  curso: { nome: string } | null
  aluno: { id: number; nome: string | null } | null
}

export interface ComissaoTurma {
  chave: string
  /** Nula para as aulas individuais. */
  turma: TurmaRemuneracao | null
  base: number
  /** Nulo quando houve percentuais diferentes no grupo. */
  percentual: number | null
  valor: number
  pagamentos: number
  alunos: number
}

export interface FechamentoRemuneracao {
  id: number
  fechado_em: string
  fechado_por: string | null
  conta: {
    id: number
    status: StatusContaPagamento
    valor: number
    data_vencimento: string | null
    data_pagamento: string | null
  } | null
}

export interface ExtratoProfessor {
  competencia: string
  periodo: { inicio: string; fim: string }
  situacao: SituacaoExtrato
  professor: { id: number; nome: string | null }
  regras: { salario_fixo: number; valor_hora_aula: number; comissao: number }
  resumo: ResumoRemuneracao
  aulas: AulaRemunerada[]
  comissoes: ComissaoTurma[]
  fechamento: FechamentoRemuneracao | null
}

export type PublicoAviso = 'alunos' | 'responsaveis' | 'ambos'

export type CanalAviso = 'email' | 'whatsapp'

export type OrigemAviso = 'manual' | 'aula_alterada'

export type StatusDestinatarioAviso = 'pendente' | 'enviado' | 'erro' | 'sem_contato'

export interface TotaisAviso {
  alunos: number
  destinatarios: number
  enviados: number
  pendentes: number
  erros: number
  sem_contato: number
}

export interface DestinatarioAviso {
  id: number
  nome: string
  tipo: 'aluno' | 'responsavel'
  aluno: string | null
  canal: CanalAviso
  destino: string | null
  status: StatusDestinatarioAviso
  erro: string | null
  enviado_em: string | null
}

export interface AvisoTurma {
  id: number
  titulo: string
  mensagem: string
  publico: PublicoAviso
  canais: CanalAviso[]
  origem: OrigemAviso
  turma: { id: number; nome: string } | null
  professor: { id: number; nome: string | null } | null
  autor: { id: number | null; nome: string | null; role: string | null }
  id_aula_turma: number | null
  enviado_em: string | null
  totais?: TotaisAviso
  destinatarios?: DestinatarioAviso[]
}

export interface OpcoesAviso {
  canais: Record<CanalAviso, boolean>
  limite: { por_dia: number; enviados_hoje: number; restantes: number } | null
}

export interface AlvoAvisoPayload {
  id_turma?: number
  ids_alunos?: number[]
  publico: PublicoAviso
  canais: CanalAviso[]
}

export interface AvisoPayload extends AlvoAvisoPayload {
  titulo: string
  mensagem: string
}

export interface PreviaAviso {
  alunos: number
  mensagens: number
  por_canal: Partial<Record<CanalAviso, number>>
  sem_contato: { nome: string; canal: CanalAviso }[]
}
