export type ModuloAppKey =
  | 'leads'
  | 'financeiro'
  | 'espetaculos'
  | 'instrumentos'
  | 'relatorios'
  | string

export interface Instituicao {
  id: number
  slug: string
  nome_fantasia: string
  razao_social?: string | null
  role?: string
  status?: string
  assinatura_status?: 'trialing' | 'active' | 'past_due' | 'canceled' | string | null
  trial_ends_at?: string | null
  id_plano_assinatura?: number | null
  limite_alunos?: number | null
  modulos?: ModuloAppKey[]
  em_trial?: boolean
}

export interface AuthUser {
  id: number
  nome: string
  email: string
  role?: string
  is_super_admin?: boolean
  [key: string]: unknown
}

export interface AuthResponse {
  data: AuthUser
  token: string
  tenant?: Instituicao | null
  tenants?: Instituicao[] | { data: Instituicao[] }
}

export interface SwitchInstituicaoResponse {
  token: string
  tenant: Instituicao
  tenants?: Instituicao[] | { data: Instituicao[] }
}

export interface LoginErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export interface ConfiguracaoEmpresa {
  id: number
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
  estado?: { id: number; nome: string; sigla: string }
  cidade?: { id: number; nome: string }
}

export interface ConfiguracaoEmpresaFormData {
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  rua: string | null
  numero: string | null
  bairro: string | null
  complemento: string | null
  cep: string | null
  id_estado: string | null
  id_cidade: string | null
}

export type { Usuario } from './store/useUsuariosStore'
