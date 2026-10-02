import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  connectWhatsapp,
  disconnectWhatsapp,
  getWhatsappConfig,
  reconnectWhatsapp,
} from '../api/whatsapp'
import { useWhatsappStore } from '../store/useWhatsappStore'

export const useWhatsappConfig = () => {
  const { instanceStatus, setStatus, setInstanceName } = useWhatsappStore()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getWhatsappConfig()
      setStatus(data.status)
      setInstanceName(data.instance_name)
      if (data.qr_code) {
        setQrCode(data.qr_code)
      }

      if (data.status === 'connected') {
        stopPolling()
        setQrCode(null)
      }
    } catch (error) {
      console.error('Erro ao buscar status do WhatsApp:', error)
    }
  }, [setStatus, setInstanceName, stopPolling])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (instanceStatus === 'pending') {
      pollingRef.current = setInterval(fetchStatus, 5000)
    } else {
      stopPolling()
    }
    return () => stopPolling()
  }, [instanceStatus, fetchStatus, stopPolling])

  const connect = async () => {
    try {
      setLoading(true)
      const data = await connectWhatsapp('camerata')
      setStatus(data.status)
      setInstanceName(data.instance_name)
      setQrCode(data.qr_code || null)
      toast.info('Conectando...', {
        description: 'Aguarde a geração do QR Code ou escaneie o código na tela.',
      })
    } catch (error) {
      console.error(error)
      toast.error('Erro', {
        description: getErrorMessage(error, 'Falha ao conectar com o WhatsApp.'),
      })
    } finally {
      setLoading(false)
    }
  }

  const reconnect = async () => {
    try {
      setLoading(true)
      const data = await reconnectWhatsapp()
      setStatus(data.status)
      setInstanceName(data.instance_name)
      setQrCode(data.qr_code || null)
      toast.info('Reconectando...', {
        description: 'Escaneie o novo QR Code.',
      })
    } catch (error) {
      console.error(error)
      toast.error('Erro', {
        description: getErrorMessage(error, 'Falha ao reconectar com o WhatsApp.'),
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      setLoading(true)
      await disconnectWhatsapp()
      setStatus('disconnected')
      setQrCode(null)
      stopPolling()
      toast.success('Desconectado', {
        description: 'Sessão do WhatsApp encerrada com sucesso.',
      })
    } catch (error) {
      console.error(error)
      toast.error('Erro', {
        description: getErrorMessage(error, 'Falha ao desconectar.'),
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    status: instanceStatus,
    qrCode,
    loading,
    connect,
    reconnect,
    disconnect,
  }
}
