import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ExtratoProfessor } from '@/modules/professor'
import { getErrorMessage } from '@/shared/lib/utils'
import { fecharMesProfessor, getExtratoProfessor, reabrirMesProfessor } from '../../../../api/remuneracao'
import { useMesDaUrl } from '../../hooks/useMesDaUrl'

export const useExtratoProfessorAdmin = (idProfessor: string | undefined) => {
  const { mes, competencia, podeAvancar, mudarMes } = useMesDaUrl()
  const [extrato, setExtrato] = useState<ExtratoProfessor | null>(null)
  const [carregado, setCarregado] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [fecharAberto, setFecharAberto] = useState(false)
  const [reabrirAberto, setReabrirAberto] = useState(false)
  const chave = `${idProfessor}:${competencia}`

  useEffect(() => {
    if (!idProfessor) return
    let cancelled = false

    getExtratoProfessor(idProfessor, competencia)
      .then((dados) => {
        if (!cancelled) setExtrato(dados)
      })
      .catch((err) => {
        if (!cancelled) {
          setExtrato(null)
          toast.error(getErrorMessage(err, 'Não foi possível carregar o extrato.'))
        }
      })
      .finally(() => {
        if (!cancelled) setCarregado(`${idProfessor}:${competencia}`)
      })

    return () => {
      cancelled = true
    }
  }, [idProfessor, competencia])

  const fechar = async (dataVencimento: string | null) => {
    if (!idProfessor) return
    setIsSaving(true)
    try {
      setExtrato(await fecharMesProfessor(idProfessor, { mes: competencia, data_vencimento: dataVencimento }))
      setFecharAberto(false)
      toast.success('Mês fechado.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível fechar o mês.'))
    } finally {
      setIsSaving(false)
    }
  }

  const reabrir = async () => {
    if (!idProfessor || !extrato?.fechamento) return
    setIsSaving(true)
    try {
      await reabrirMesProfessor(idProfessor, extrato.fechamento.id)
      setExtrato(await getExtratoProfessor(idProfessor, competencia))
      setReabrirAberto(false)
      toast.success('Mês reaberto.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível reabrir o mês.'))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    mes,
    competencia,
    podeAvancar,
    mudarMes,
    extrato,
    isLoading: carregado !== chave,
    isSaving,
    fecharAberto,
    setFecharAberto,
    reabrirAberto,
    setReabrirAberto,
    fechar,
    reabrir,
  }
}
