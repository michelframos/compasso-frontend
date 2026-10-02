import api from '@/shared/lib/axios'

export async function getDashboardResumo(mes?: string) {
  const { data } = await api.get('/dashboard/resumo', { params: mes ? { mes } : undefined })
  return data
}

export async function getDashboardFinanceiro(mes?: string) {
  const { data } = await api.get('/dashboard/financeiro', { params: mes ? { mes } : undefined })
  return data
}

export async function getDashboardOperacional(mes?: string) {
  const { data } = await api.get('/dashboard/operacional', { params: mes ? { mes } : undefined })
  return data
}
