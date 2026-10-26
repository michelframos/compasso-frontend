export type ModuloAppKey =
  | 'leads'
  | 'financeiro'
  | 'espetaculos'
  | 'instrumentos'
  | 'relatorios'
  | 'avaliacoes'
  | 'progressao'
  | string

export interface ModuloEscola {
  key: ModuloAppKey
  label: string
  descricao: string
  /** Incluído no plano ou liberado pelo trial. */
  contratado: boolean
  /** Contratado e não desligado pela escola. */
  ativo: boolean
  /** A própria escola pode ligar ou desligar. */
  desativavel: boolean
}

export type AcaoProfessorAula = 'criar' | 'editar' | 'excluir'

/** livre: o professor faz direto; aprovacao: vira solicitação para a secretaria; bloqueado: não pode. */
export type ModoPermissaoAula = 'livre' | 'aprovacao' | 'bloqueado'

export type PermissoesProfessorAulas = Record<AcaoProfessorAula, ModoPermissaoAula>

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
  /** Módulos ativos: contratados e não desligados pela escola. */
  modulos?: ModuloAppKey[]
  modulos_contratados?: ModuloAppKey[]
  em_trial?: boolean
}

export interface AuthUser {
  id: number
  nome: string
  email: string
  role?: string
  is_super_admin?: boolean
  deve_trocar_senha?: boolean
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
  code?: 'activation_required' | 'already_activated' | string
  errors?: Record<string, string[]>
}

/** State de navegação enviado ao /login logo após o cadastro da escola. */
export interface LoginLocationState {
  cnpj?: string
  email?: string
  aguardandoAtivacao?: boolean
}

export interface RegistrarEscolaResponse {
  message: string
  email_enviado: boolean
  tenant: {
    id: number
    slug: string
    nome_fantasia: string
    cnpj: string
    trial_ends_at: string | null
  }
  user: {
    id: number
    nome: string
    email: string
  }
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
  permitir_aluno_editar_medidas?: boolean
  limite_reposicoes_periodo?: number | null
  prazo_reposicao_dias?: number | null
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
  permitir_aluno_editar_medidas?: boolean
  limite_reposicoes_periodo?: number | string | null
  prazo_reposicao_dias?: number | string | null
}

export interface Perfil {
  id: number
  nome: string
  email: string
  cpf: string | null
  role: string
  foto: string | null
  foto_url: string | null
  telefone: string | null
  whatsapp: string | null
  data_aniversario: string | null
  cep: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  id_estado: number | null
  id_cidade: number | null
}

export interface PerfilFormData {
  nome: string
  telefone: string
  whatsapp: string
  data_aniversario: string
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  id_estado: string
  id_cidade: string
}

export type { Usuario } from './store/useUsuariosStore'
