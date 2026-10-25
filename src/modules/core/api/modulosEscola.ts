import api from '@/shared/lib/axios'
import type { ModuloAppKey, ModuloEscola } from '../types'

interface ModulosEscolaResponse {
  data: ModuloEscola[]
  meta: { modulos_ativos: ModuloAppKey[] }
}

export async function listModulosEscola() {
  const { data } = await api.get<ModulosEscolaResponse>('/instituicao/modulos')
  return data
}

export async function alterarModuloEscola(modulo: ModuloAppKey, ativo: boolean) {
  const { data } = await api.put<ModulosEscolaResponse>(`/instituicao/modulos/${modulo}`, { ativo })
  return data
}
