import api from '@/shared/lib/axios'

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
