import { create } from 'zustand'
import type { WhatsappStatus } from '../api/whatsapp'

interface WhatsappState {
  instanceStatus: WhatsappStatus
  instanceName: string | null
  setStatus: (status: WhatsappStatus) => void
  setInstanceName: (name: string | null) => void
}

export const useWhatsappStore = create<WhatsappState>((set) => ({
  instanceStatus: 'unknown',
  instanceName: null,
  setStatus: (status) => set({ instanceStatus: status }),
  setInstanceName: (name) => set({ instanceName: name }),
}))
