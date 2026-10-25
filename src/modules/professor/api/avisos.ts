import api from '@/shared/lib/axios'
import type { AlvoAvisoPayload, AvisoPayload, AvisoTurma, OpcoesAviso, OrigemAviso, PreviaAviso } from '../types'

export interface PaginaAvisos {
  data: AvisoTurma[]
  meta: { current_page: number; last_page: number; total: number }
}

export interface FiltrosAvisos {
  page?: number
  id_turma?: number
  origem?: OrigemAviso
  search?: string
}

export interface AvisosApi {
  listar: (filtros?: FiltrosAvisos) => Promise<PaginaAvisos>
  detalhar: (id: number) => Promise<AvisoTurma>
  opcoes: () => Promise<OpcoesAviso>
  previa: (alvo: AlvoAvisoPayload) => Promise<PreviaAviso>
  enviar: (payload: AvisoPayload) => Promise<AvisoTurma>
}

/** O professor usa /professor/me/avisos (com limite diário); a secretaria, /avisos. */
const criarAvisosApi = (base: string): AvisosApi => ({
  listar: async (filtros = {}) => {
    const { data } = await api.get<PaginaAvisos>(base, { params: { ...filtros, search: filtros.search || undefined } })
    return data
  },
  detalhar: async (id) => {
    const { data } = await api.get<{ data: AvisoTurma }>(`${base}/${id}`)
    return data.data
  },
  opcoes: async () => {
    const { data } = await api.get<{ data: OpcoesAviso }>(`${base}/opcoes`)
    return data.data
  },
  previa: async (alvo) => {
    const { data } = await api.get<{ data: PreviaAviso }>(`${base}/previa`, { params: alvo })
    return data.data
  },
  enviar: async (payload) => {
    const { data } = await api.post<{ data: AvisoTurma }>(base, payload)
    return data.data
  },
})

export const avisosProfessorApi = criarAvisosApi('/professor/me/avisos')

export const avisosEquipeApi = criarAvisosApi('/avisos')
