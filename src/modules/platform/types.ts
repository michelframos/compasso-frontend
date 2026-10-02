export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface PlanoAssinatura {
  id: number
  slug: string
  nome: string
  descricao: string | null
  preco_mensal: string | number
  limite_alunos: number | null
  modulos: string[]
  ativo: boolean
  instituicoes_count?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ModuloAppCatalogItem {
  key: string
  label: string
  descricao: string
}

export type InstituicaoStatus = 'a' | 'i' | 's'
export type AssinaturaStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface PlatformInstituicao {
  id: number
  slug: string
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  rua: string | null
  numero: string | null
  bairro: string | null
  complemento: string | null
  cep: string | null
  id_estado: number | null
  id_cidade: number | null
  status: InstituicaoStatus
  id_plano_assinatura: number | null
  plano?: PlanoAssinatura | null
  trial_ends_at: string | null
  trial_usa_padrao: boolean
  assinatura_inicia_em: string | null
  assinatura_status: AssinaturaStatus
  em_trial: boolean
  trial_expirado: boolean
  acesso_bloqueado: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface PlanoFormData {
  slug: string
  nome: string
  descricao: string | null
  preco_mensal: number
  limite_alunos: number | null
  modulos: string[]
  ativo: boolean
}

export interface Depoimento {
  id: number
  nome: string
  cargo: string
  escola: string
  conteudo: string
  avatar_url: string | null
  ordem: number
  aprovado: boolean
  aprovado_em: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface DepoimentoFormData {
  nome: string
  cargo: string
  escola: string
  conteudo: string
  avatar_url: string | null
  ordem: number
}

export const SITE_MODULO_ICONES = [
  'Users',
  'UserRoundPen',
  'UserPlus',
  'GraduationCap',
  'CalendarDays',
  'Wallet',
  'Star',
  'Music',
  'BarChart3',
  'MessageCircle',
  'LayoutGrid',
] as const

export type SiteModuloIcone = (typeof SITE_MODULO_ICONES)[number]

export interface SiteModulo {
  id: number
  nome: string
  descricao: string
  recursos: string[]
  icone: string
  ordem: number
  aprovado: boolean
  aprovado_em: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface SiteModuloFormData {
  nome: string
  descricao: string
  recursos: string[]
  icone: string
  ordem: number
}

export interface InstituicaoFormData {
  slug: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  rua: string
  numero: string
  bairro: string
  complemento: string
  cep: string
  id_estado: number | null
  id_cidade: number | null
  status: InstituicaoStatus
  id_plano_assinatura: number | null
  assinatura_status: AssinaturaStatus
  assinatura_inicia_em: string
  trial_mode: 'padrao' | 'dias' | 'data'
  trial_dias: number | null
  trial_ends_at: string
  usar_trial_padrao: boolean
}

export interface PlatformInstituicaoUsuario {
  id: number
  nome: string
  email: string
  role: string | null
  membership_status: string | null
  is_super_admin: boolean
}
