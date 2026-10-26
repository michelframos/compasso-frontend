import api from '@/shared/lib/axios'
import type { AulaReposicao, RegrasReposicao, ReposicaoDoAluno } from '../types'

export async function listarReposicoes(idAluno?: number | null) {
  const { data } = await api.get<{ data: ReposicaoDoAluno[]; regras: RegrasReposicao }>('/aluno/me/reposicoes', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data
}

export async function listarOpcoesReposicao(idAulaPerdida: number, idAluno?: number | null) {
  const { data } = await api.get<{ data: AulaReposicao[] }>('/aluno/me/reposicoes/opcoes', {
    params: { id_aula_turma_perdida: idAulaPerdida, ...(idAluno ? { id_aluno: idAluno } : {}) },
  })
  return data.data
}

export async function solicitarReposicao(payload: {
  idAulaPerdida: number
  idAulaDestino: number | null
  motivo: string
  idAluno?: number | null
}) {
  const { data } = await api.post<{ data: ReposicaoDoAluno }>('/aluno/me/reposicoes', {
    id_aula_turma_perdida: payload.idAulaPerdida,
    id_aula_turma_destino: payload.idAulaDestino,
    motivo: payload.motivo,
    ...(payload.idAluno ? { id_aluno: payload.idAluno } : {}),
  })
  return data.data
}
