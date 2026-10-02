import api from '@/shared/lib/axios'
import { limparCacheDadosEscola } from '@/shared/lib/print-utils'
import type { ConfiguracaoEmpresa, ConfiguracaoEmpresaFormData } from '../types'

export async function getConfiguracaoEmpresa() {
  const { data } = await api.get<ConfiguracaoEmpresa>('/configuracao-empresa')
  return data
}

export async function updateConfiguracaoEmpresa(payload: ConfiguracaoEmpresaFormData) {
  const { data } = await api.put<ConfiguracaoEmpresa>('/configuracao-empresa', payload)
  limparCacheDadosEscola()
  return data
}
