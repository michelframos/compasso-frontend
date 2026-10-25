import api from '@/shared/lib/axios'

export interface ComunicacaoProfessor {
  limite_avisos_dia: number
}

export async function getComunicacaoProfessor() {
  const { data } = await api.get<{ data: ComunicacaoProfessor }>('/instituicao/comunicacao-professor')
  return data.data
}

export async function salvarComunicacaoProfessor(payload: ComunicacaoProfessor) {
  const { data } = await api.put<{ data: ComunicacaoProfessor }>('/instituicao/comunicacao-professor', payload)
  return data.data
}
