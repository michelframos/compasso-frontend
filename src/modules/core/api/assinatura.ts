import api from '@/shared/lib/axios'

export type MetodoPagamentoAssinatura = 'pix' | 'credit_card' | 'boleto'

export interface PlanoAssinatura {
  id: number
  slug: string
  nome: string
  descricao?: string | null
  preco: number
  limite_alunos: number | null
  features: string[]
  destaque: boolean
}

export interface SolicitacaoAssinatura {
  id: number
  status: 'pendente' | 'aprovada' | 'rejeitada' | string
  observacao?: string | null
  created_at?: string | null
  plano?: {
    id: number
    slug: string
    nome: string
    preco: number
    limite_alunos: number | null
  } | null
}

export interface AssinaturaCobranca {
  id: number
  id_plano_assinatura: number
  status: 'pending' | 'awaiting_payment' | 'active' | 'past_due' | 'canceled' | 'failed' | string
  method: MetodoPagamentoAssinatura
  cycle: string
  amount: number
  invoice_url?: string | null
  next_due_date?: string | null
  customer_email?: string | null
  last_error?: string | null
  created_at?: string | null
  updated_at?: string | null
  plano?: {
    id: number
    slug: string
    nome: string
    preco: number
    limite_alunos: number | null
  } | null
}

export interface SubcontaAssinatura {
  status: 'none' | 'pending' | 'active' | 'failed' | string
  ativa: boolean
  last_error?: string | null
  meios_cobranca_online?: string[]
}

export interface AssinaturaAtual {
  billing_disponivel: boolean
  assinatura_status: string
  assinatura_inicia_em?: string | null
  trial_ends_at?: string | null
  plano?: {
    id: number
    slug: string
    nome: string
    preco: number
    limite_alunos: number | null
  } | null
  cobranca?: AssinaturaCobranca | null
  invoice_url?: string | null
  subconta?: SubcontaAssinatura | null
}

export interface ConfiguracaoCobrancaOnline {
  meios: MetodoPagamentoAssinatura[]
  meios_disponiveis: MetodoPagamentoAssinatura[]
  billing_disponivel: boolean
  subconta_status: string
  subconta_ativa: boolean
  subconta_last_error?: string | null
}

export async function listPlanosAssinatura() {
  const { data } = await api.get<{ data: PlanoAssinatura[] }>('/assinatura/planos')
  return data.data ?? []
}

export async function getSolicitacaoAtual() {
  const { data } = await api.get<{ data: SolicitacaoAssinatura | null }>('/assinatura/solicitacao')
  return data.data ?? null
}

export async function solicitarAssinatura(payload: {
  id_plano_assinatura: number
  observacao?: string
}) {
  const { data } = await api.post<{ data: SolicitacaoAssinatura }>('/assinatura/solicitar', payload)
  return data.data
}

export async function getAssinaturaAtual() {
  const { data } = await api.get<{ data: AssinaturaAtual }>('/assinatura/atual')
  return data.data
}

export async function checkoutAssinatura(payload: {
  id_plano_assinatura: number
  method: MetodoPagamentoAssinatura
}) {
  const { data } = await api.post<{ data: AssinaturaCobranca }>('/assinatura/checkout', payload)
  return data.data
}

export async function getCheckoutAssinatura(id: number, sync = false) {
  const { data } = await api.get<{ data: AssinaturaCobranca }>(`/assinatura/checkout/${id}`, {
    params: sync ? { sync: 1 } : undefined,
  })
  return data.data
}

export async function cancelarAssinaturaOnline() {
  const { data } = await api.post<{ data: AssinaturaCobranca }>('/assinatura/cancelar')
  return data.data
}

export async function getSubcontaAssinatura() {
  const { data } = await api.get<{ data: SubcontaAssinatura }>('/assinatura/subconta')
  return data.data
}

export async function provisionarSubcontaAssinatura() {
  const { data } = await api.post<{ data: SubcontaAssinatura }>('/assinatura/subconta')
  return data.data
}

export async function atualizarSaqueSubconta(payload: {
  pix_key: string
  pix_key_type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'
}) {
  const { data } = await api.put('/assinatura/subconta/saque', payload)
  return data
}

export async function getConfiguracaoCobrancaOnline() {
  const { data } = await api.get<{ data: ConfiguracaoCobrancaOnline }>('/configuracao-cobranca-online')
  return data.data
}

export async function updateConfiguracaoCobrancaOnline(payload: { meios: MetodoPagamentoAssinatura[] }) {
  const { data } = await api.put<{ data: ConfiguracaoCobrancaOnline }>('/configuracao-cobranca-online', payload)
  return data.data
}
