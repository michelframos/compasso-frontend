import api from '@/shared/lib/axios'

export type NotificacaoConfig = {
  modulo: 'agendamentos' | 'contas_a_receber'
  tipo: 'vencimento' | 'atraso' | null
  ativo: boolean
  dias_antecedencia: number
  intervalo_repeticao: number
  max_repeticoes: number | null
  template_mensagem: string | null
  horario_envio: string | null
}

export type ContaNotificacaoCanal = 'whatsapp' | 'email'

export type ContaNotificacaoPreview = {
  canal: ContaNotificacaoCanal
  destinatario: string
  destino: string | null
  mensagem: string
  conta: {
    id: number
    descricao: string
    valor: number
    data_vencimento: string
  }
}

export async function getNotificacoesConfig() {
  const { data } = await api.get<NotificacaoConfig[]>('/notificacoes/config')
  return data
}

export async function updateNotificacoesConfig(configs: NotificacaoConfig[]) {
  const { data } = await api.put('/notificacoes/config', { configs })
  return data
}

export async function dispararNotificacoesAgora() {
  const { data } = await api.post('/notificacoes/disparar-agora')
  return data
}

export async function previewContaNotificacao(contaId: number, canal: ContaNotificacaoCanal) {
  const { data } = await api.get<ContaNotificacaoPreview>(`/notificacoes/contas/${contaId}/preview`, {
    params: { canal },
  })
  return data
}

export async function enviarContaNotificacao(
  contaId: number,
  payload: { canal: ContaNotificacaoCanal; mensagem: string }
) {
  const { data } = await api.post<{ message: string; destino?: string }>(
    `/notificacoes/contas/${contaId}/enviar`,
    payload
  )
  return data
}
