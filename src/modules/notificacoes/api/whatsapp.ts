import api from '@/shared/lib/axios'

export type WhatsappStatus = 'connected' | 'disconnected' | 'pending' | 'unknown'

export type WhatsappConfigResponse = {
  instance_name: string | null
  status: WhatsappStatus
  qr_code: string | null
}

export async function getWhatsappConfig() {
  const { data } = await api.get<WhatsappConfigResponse>('/whatsapp/config')
  return data
}

export async function connectWhatsapp(instanceName = 'camerata') {
  const { data } = await api.post<WhatsappConfigResponse>('/whatsapp/connect', {
    instance_name: instanceName,
  })
  return data
}

export async function reconnectWhatsapp() {
  const { data } = await api.put<WhatsappConfigResponse>('/whatsapp/reconnect')
  return data
}

export async function disconnectWhatsapp() {
  const { data } = await api.delete<WhatsappConfigResponse>('/whatsapp/disconnect')
  return data
}
