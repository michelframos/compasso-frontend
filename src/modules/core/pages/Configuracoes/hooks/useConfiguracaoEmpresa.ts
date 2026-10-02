import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import type { ConfiguracaoEmpresa, ConfiguracaoEmpresaFormData } from '@/modules/core'
import { getConfiguracaoEmpresa, updateConfiguracaoEmpresa } from '@/modules/core/api/configuracaoEmpresa'

export const useConfiguracaoEmpresa = () => {
  const [config, setConfig] = useState<ConfiguracaoEmpresa | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getConfiguracaoEmpresa()
      setConfig(data)
    } catch (error) {
      console.error('Erro ao buscar configuração da empresa:', error)
      toast.error(getErrorMessage(error, 'Não foi possível carregar as configurações da empresa'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const salvarConfig = async (data: ConfiguracaoEmpresaFormData) => {
    try {
      setIsSaving(true)
      const updated = await updateConfiguracaoEmpresa(data)
      setConfig(updated)
      toast.success('Configurações da empresa salvas com sucesso!')
    } catch (error: unknown) {
      console.error('Erro ao salvar configuração da empresa:', error)
      toast.error(getErrorMessage(error, 'Erro ao salvar configurações'))
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    isLoading,
    isSaving,
    salvarConfig,
    refetch: fetchConfig,
  }
}
