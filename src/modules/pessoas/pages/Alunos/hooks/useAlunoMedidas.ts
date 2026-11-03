import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  atualizarMedidaAluno,
  criarMedidaAluno,
  listarMedidasDoAluno,
  type MedidaAluno,
} from '../../../api/medidas'

export type CamposMedida = {
  medida_torax: number
  medida_cintura: number
  medida_quadril: number
  medida_altura: number
}

export function useAlunoMedidas(alunoId: number | undefined) {
  const [medida, setMedida] = useState<MedidaAluno | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    if (!alunoId) {
      setMedida(null)
      return
    }

    setIsLoading(true)
    try {
      const lista = await listarMedidasDoAluno(alunoId)
      setMedida(lista[0] ?? null)
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível carregar as medidas.'))
      setMedida(null)
    } finally {
      setIsLoading(false)
    }
  }, [alunoId])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const salvar = async (campos: CamposMedida) => {
    if (!alunoId) return

    setSalvando(true)
    try {
      if (medida) {
        const atualizada = await atualizarMedidaAluno(medida.id, {
          ...campos,
          ativo: true,
        })
        setMedida(atualizada)
      } else {
        const criada = await criarMedidaAluno({
          id_aluno: alunoId,
          ...campos,
          ativo: true,
        })
        setMedida(criada)
      }
      toast.success('Medidas salvas.')
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível salvar as medidas.'))
    } finally {
      setSalvando(false)
    }
  }

  return { medida, isLoading, salvando, salvar, refetch: carregar }
}
