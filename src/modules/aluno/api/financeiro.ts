import api from '@/shared/lib/axios'
import type { ContaCobrancaGateway, ContaDoAluno, MetodoCobrancaOnline, PixDaConta } from '../types'

export async function listarContasConsolidadas(situacao: string) {
  const { data } = await api.get<{ data: ContaDoAluno[] }>('/aluno/me/contas/consolidado', {
    params: { situacao },
  })
  return data.data
}

export async function listarContas(situacao: string, idAluno?: number | null) {
  const { data } = await api.get<{ data: ContaDoAluno[] }>('/aluno/me/contas', {
    params: {
      situacao,
      ...(idAluno ? { id_aluno: idAluno } : {}),
    },
  })
  return data.data
}

export async function getPix(idConta: number, idAluno?: number | null) {
  const { data } = await api.get<{ data: PixDaConta }>(`/aluno/me/contas/${idConta}/pix`, {
    params: idAluno ? { id_aluno: idAluno } : undefined,
  })
  return data.data
}

export async function criarCobrancaOnline(
  idConta: number,
  method: MetodoCobrancaOnline,
  idAluno?: number | null,
) {
  const { data } = await api.post<{ data: ContaCobrancaGateway }>(
    `/aluno/me/contas/${idConta}/cobranca-online`,
    { method },
    { params: idAluno ? { id_aluno: idAluno } : undefined },
  )
  return data.data
}

export async function getCobrancaOnline(idConta: number, sync = false, idAluno?: number | null) {
  const { data } = await api.get<{ data: ContaCobrancaGateway | null }>(
    `/aluno/me/contas/${idConta}/cobranca-online`,
    {
      params: {
        ...(sync ? { sync: 1 } : {}),
        ...(idAluno ? { id_aluno: idAluno } : {}),
      },
    },
  )
  return data.data
}

export async function baixarCarne(contaIds: number[], idAluno?: number | null) {
  const { data } = await api.post<Blob>(
    '/aluno/me/carne',
    { conta_ids: contaIds, ...(idAluno ? { id_aluno: idAluno } : {}) },
    { responseType: 'blob' },
  )
  return data
}

export async function baixarRecibo(idPagamento: number, idAluno?: number | null) {
  const { data } = await api.get<Blob>(`/aluno/me/pagamentos/${idPagamento}/recibo`, {
    params: idAluno ? { id_aluno: idAluno } : undefined,
    responseType: 'blob',
  })
  return data
}
