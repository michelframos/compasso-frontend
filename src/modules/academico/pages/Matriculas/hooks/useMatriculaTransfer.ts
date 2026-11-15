import { useState } from 'react'
import api from '@/shared/lib/axios'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import type { MensalidadeOpcoesMudancaValues } from '../components/MensalidadeOpcoesMudanca'

export type TransferirAlunoPayload = {
  matriculaId: number
  novaTurmaId: number
  motivo: string
  mensalidades?: Partial<MensalidadeOpcoesMudancaValues>
}

export const useMatriculaTransfer = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false)

  const transferirAluno = async ({
    matriculaId,
    novaTurmaId,
    motivo,
    mensalidades,
  }: TransferirAlunoPayload) => {
    try {
      setIsLoading(true)

      const payload: Record<string, unknown> = {
        id_turma: String(novaTurmaId),
        motivo_transferencia: motivo,
        reajustar_mensalidades: Boolean(mensalidades?.reajustar_mensalidades),
        gerar_novas_mensalidades: Boolean(mensalidades?.gerar_novas_mensalidades),
      }

      if (mensalidades?.reajustar_mensalidades || mensalidades?.gerar_novas_mensalidades) {
        payload.valor_mensalidade_geracao = mensalidades.valor_mensalidade_geracao
        payload.quantidade_parcelas = mensalidades.quantidade_parcelas
        payload.dia_vencimento = mensalidades.dia_vencimento
        payload.data_inicio_mensalidades = mensalidades.data_inicio_mensalidades
      }

      await api.put(`/matriculas/${matriculaId}`, payload)

      toast.success('Aluno transferido com sucesso!')
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao transferir aluno'))
      console.error('Error transferring matricula:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    transferirAluno,
    isLoading,
  }
}
