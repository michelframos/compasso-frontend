import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  dispararNotificacoesAgora,
  getNotificacoesConfig,
  updateNotificacoesConfig,
  type NotificacaoConfig,
} from '../api/notificacoes'

export type { NotificacaoConfig }

export const useNotificacoesConfig = () => {
  const [configs, setConfigs] = useState<NotificacaoConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dispatching, setDispatching] = useState(false)

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getNotificacoesConfig()
      setConfigs(data)
    } catch (error) {
      console.error('Erro ao buscar configurações de notificações:', error)
      toast.error('Erro', {
        description: getErrorMessage(error, 'Falha ao carregar configurações de notificações.'),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const saveConfigs = async (newConfigs: NotificacaoConfig[]) => {
    try {
      setSaving(true)
      await updateNotificacoesConfig(newConfigs)
      toast.success('Sucesso', {
        description: 'Configurações de notificações salvas com sucesso.',
      })
      await fetchConfigs()
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro', {
        description: getErrorMessage(error, 'Falha ao salvar configurações.'),
      })
    } finally {
      setSaving(false)
    }
  }

  const dispararAgora = async () => {
    try {
      setDispatching(true)
      await dispararNotificacoesAgora()
      toast.success('Disparo Iniciado', {
        description:
          'As rotinas de notificação foram iniciadas e rodarão em plano de fundo no servidor.',
      })
    } catch (error) {
      console.error('Erro ao disparar notificações:', error)
      toast.error('Erro', {
        description: getErrorMessage(error, 'Falha ao iniciar disparo manual.'),
      })
    } finally {
      setDispatching(false)
    }
  }

  return {
    configs,
    loading,
    saving,
    dispatching,
    saveConfigs,
    dispararAgora,
  }
}
