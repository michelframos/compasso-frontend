import type {
  AulaStatus,
  AulaTipo,
  CanalAviso,
  ConceitoAvaliacao,
  DestinoCobranca,
  OrigemAviso,
  PublicoAviso,
  StatusDestinatarioAviso,
  StatusEspetaculo,
  StatusProgressao,
  StatusSolicitacaoAula,
  TipoSolicitacaoAula,
  TipoAvaliacao,
  TipoObservacao,
  TurmaStatus,
} from './types'

export const DIAS_SEMANA: { valor: string; label: string; curto: string }[] = [
  { valor: 'segunda', label: 'Segunda-feira', curto: 'Seg' },
  { valor: 'terca', label: 'Terça-feira', curto: 'Ter' },
  { valor: 'quarta', label: 'Quarta-feira', curto: 'Qua' },
  { valor: 'quinta', label: 'Quinta-feira', curto: 'Qui' },
  { valor: 'sexta', label: 'Sexta-feira', curto: 'Sex' },
  { valor: 'sabado', label: 'Sábado', curto: 'Sáb' },
  { valor: 'domingo', label: 'Domingo', curto: 'Dom' },
]

export const TURMA_STATUS: Record<TurmaStatus, { label: string; className: string }> = {
  planejamento: { label: 'Planejamento', className: 'bg-zinc-100 text-zinc-600' },
  aberta: { label: 'Aberta', className: 'bg-blue-50 text-blue-600' },
  em_andamento: { label: 'Em andamento', className: 'bg-emerald-50 text-emerald-600' },
  pausada: { label: 'Pausada', className: 'bg-amber-50 text-amber-600' },
  concluida: { label: 'Concluída', className: 'bg-slate-100 text-slate-600' },
  cancelada: { label: 'Cancelada', className: 'bg-rose-50 text-rose-600' },
}

export const AULA_STATUS: Record<AulaStatus, { label: string; className: string }> = {
  agendada: { label: 'Agendada', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  concluida: { label: 'Concluída', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  cancelada: { label: 'Cancelada', className: 'bg-rose-50 text-rose-600 border-rose-100' },
}

export const OBSERVACAO_TIPOS: Record<TipoObservacao, { label: string; className: string }> = {
  evolucao: { label: 'Evolução', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  comportamento: { label: 'Comportamento', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  alerta: { label: 'Alerta', className: 'bg-rose-50 text-rose-700 border-rose-100' },
  geral: { label: 'Geral', className: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
}

export const AVALIACAO_TIPOS: Record<TipoAvaliacao, string> = {
  pratica: 'Prática',
  teorica: 'Teórica',
  apresentacao: 'Apresentação',
  participacao: 'Participação',
  outra: 'Outra',
}

export const CONCEITOS: Record<ConceitoAvaliacao, { label: string; className: string }> = {
  excelente: { label: 'Excelente', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  bom: { label: 'Bom', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  regular: { label: 'Regular', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  insuficiente: { label: 'Insuficiente', className: 'bg-rose-50 text-rose-700 border-rose-100' },
}

export const PROGRESSAO_STATUS: Record<StatusProgressao, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  aprovada: { label: 'Aprovada', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rejeitada: { label: 'Rejeitada', className: 'bg-rose-50 text-rose-700 border-rose-100' },
}

export const ESPETACULO_STATUS: Record<StatusEspetaculo, { label: string; className: string }> = {
  planejamento: { label: 'Planejamento', className: 'bg-zinc-100 text-zinc-600' },
  ensaios: { label: 'Em ensaios', className: 'bg-indigo-50 text-indigo-600' },
  concluido: { label: 'Concluído', className: 'bg-emerald-50 text-emerald-600' },
  cancelado: { label: 'Cancelado', className: 'bg-rose-50 text-rose-600' },
}

export const SOLICITACAO_TIPO: Record<TipoSolicitacaoAula, string> = {
  criacao: 'Nova aula',
  cancelamento: 'Cancelamento',
  reposicao: 'Reposição',
  substituicao: 'Substituição',
}

export const SOLICITACAO_STATUS: Record<StatusSolicitacaoAula, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  aprovada: { label: 'Aprovada', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rejeitada: { label: 'Rejeitada', className: 'bg-rose-50 text-rose-700 border-rose-100' },
  cancelada: { label: 'Cancelada', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}

export const DESTINO_COBRANCA: Record<DestinoCobranca, string> = {
  proxima_aula: 'Vai para a próxima aula',
  cancelar: 'Cancelar a cobrança',
}

export const AULA_TIPO: Record<AulaTipo, string> = {
  regular: 'Regular',
  reposicao: 'Reposição',
  reforco: 'Reforço',
  extra: 'Extra',
}

export const PUBLICO_AVISO: Record<PublicoAviso, { label: string; descricao: string }> = {
  alunos: { label: 'Alunos', descricao: 'Quem não tem contato no canal é avisado pelos responsáveis.' },
  responsaveis: { label: 'Responsáveis', descricao: 'Alunos sem responsável cadastrado recebem diretamente.' },
  ambos: { label: 'Alunos e responsáveis', descricao: 'Todos recebem; quem é responsável por mais de um aluno recebe uma vez.' },
}

export const CANAL_AVISO: Record<CanalAviso, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
}

export const ORIGEM_AVISO: Record<OrigemAviso, string> = {
  manual: 'Aviso',
  aula_alterada: 'Aula alterada',
}

export const STATUS_DESTINATARIO_AVISO: Record<StatusDestinatarioAviso, { label: string; className: string }> = {
  pendente: { label: 'Na fila', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  enviado: { label: 'Enviado', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  erro: { label: 'Falhou', className: 'bg-rose-50 text-rose-700 border-rose-100' },
  sem_contato: { label: 'Sem contato', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}
