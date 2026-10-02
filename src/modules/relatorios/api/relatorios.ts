import api from '@/shared/lib/axios'

export type RelatorioParams = Record<string, string | number | undefined | null>

export async function getInadimplencia(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/financeiro/inadimplencia', { params })
  return data
}

export async function getFluxoCaixa(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/financeiro/fluxo-caixa', { params })
  return data
}

export async function getFluxoCaixaMovimentos(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/financeiro/fluxo-caixa/movimentos', { params })
  return data
}

export async function getAbsenteismo(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/academico/absenteismo', { params })
  return data
}

export async function getDiarioClasse(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/academico/diario-classe', { params })
  return data
}

export async function getFunilVendas(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/comercial/funil-vendas', { params })
  return data
}

export async function getAniversariantes(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/comercial/aniversariantes', { params })
  return data
}

export async function getInventarioInstrumentos(params?: RelatorioParams) {
  const { data } = await api.get('/relatorios/logistica/inventario', { params })
  return data
}
