import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, MoveRight, History, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { useMatriculaTransfer } from '../hooks/useMatriculaTransfer'
import { useTurmas } from '../../Turmas/hooks/useTurmas'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import {
  MensalidadeOpcoesMudanca,
  type MensalidadeOpcoesMudancaValues,
} from './MensalidadeOpcoesMudanca'
import { getConfiguracaoEmpresa } from '@/modules/core/api/configuracaoEmpresa'

const transferSchema = z.object({
  id_turma_destino: z.string().min(1, 'Selecione a nova turma'),
  motivo: z.string().min(1, 'Informe o motivo da transferência'),
})

type TransferFormValues = z.infer<typeof transferSchema>

interface MatriculaTransferFormProps {
  matriculaId: number
  turmaAtualId: number
  alunoNome: string
  onClose: () => void
  onSuccess: () => void
}

export const MatriculaTransferForm: React.FC<MatriculaTransferFormProps> = ({
  matriculaId,
  turmaAtualId,
  alunoNome,
  onClose,
  onSuccess,
}) => {
  const hasFinanceiro = useHasModulo('financeiro')
  const { transferirAluno, isLoading: isTransferring } = useMatriculaTransfer(onSuccess)
  const { turmas, fetchTurmas, isLoading: isLoadingTurmas } = useTurmas()
  const [opcoesMensalidade, setOpcoesMensalidade] = useState<MensalidadeOpcoesMudancaValues>({
    reajustar_mensalidades: false,
    gerar_novas_mensalidades: false,
    valor_mensalidade_geracao: 0,
    quantidade_parcelas: 12,
    dia_vencimento: 10,
    data_inicio_mensalidades: new Date().toISOString().split('T')[0],
  })
  const [valorOrigem, setValorOrigem] = useState<number | null>(null)
  const [valorDestino, setValorDestino] = useState<number | null>(null)

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      id_turma_destino: '',
      motivo: '',
    },
  })

  const { register, handleSubmit, watch, formState: { errors } } = form
  const idTurmaDestino = watch('id_turma_destino')

  useEffect(() => {
    fetchTurmas()
  }, [fetchTurmas])

  useEffect(() => {
    if (!hasFinanceiro) return
    const origem = turmas.find((t) => t.id === turmaAtualId)
    setValorOrigem(origem?.valor_mensalidade ?? null)
  }, [hasFinanceiro, turmas, turmaAtualId])

  useEffect(() => {
    if (!hasFinanceiro || !idTurmaDestino) {
      setValorDestino(null)
      return
    }

    let ativo = true
    const carregar = async () => {
      const destino = turmas.find((t) => String(t.id) === String(idTurmaDestino))
      const valor = Number(destino?.valor_mensalidade || 0)
      setValorDestino(valor)

      try {
        const empresa = await getConfiguracaoEmpresa()
        if (!ativo) return
        setOpcoesMensalidade((prev) => ({
          ...prev,
          valor_mensalidade_geracao: valor || prev.valor_mensalidade_geracao,
          dia_vencimento: Number(destino?.dia_vencimento_mensalidade ?? empresa.dia_vencimento_mensalidade ?? prev.dia_vencimento),
          quantidade_parcelas: Number(destino?.quantidade_parcelas_mensalidade ?? empresa.quantidade_parcelas_mensalidade ?? prev.quantidade_parcelas),
        }))
      } catch {
        setOpcoesMensalidade((prev) => ({
          ...prev,
          valor_mensalidade_geracao: valor || prev.valor_mensalidade_geracao,
        }))
      }
    }
    void carregar()
    return () => { ativo = false }
  }, [hasFinanceiro, idTurmaDestino, turmas])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSubmit(onSubmit, (formErrors) => {
      if (formErrors.id_turma_destino) toast.error(formErrors.id_turma_destino.message)
      if (formErrors.motivo) toast.error(formErrors.motivo.message)
    })(e)
  }

  const onSubmit = async (values: TransferFormValues) => {
    try {
      await transferirAluno({
        matriculaId,
        novaTurmaId: Number(values.id_turma_destino),
        motivo: values.motivo,
        mensalidades: hasFinanceiro ? opcoesMensalidade : undefined,
      })
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  const turmasDisponiveis = turmas.filter(
    (t) => t.id !== turmaAtualId && t.status !== 'cancelada' && t.status !== 'concluida',
  )

  if (isLoadingTurmas) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Carregando turmas disponíveis...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6">
        <p className="text-sm text-indigo-900 leading-relaxed">
          Você está transferindo o aluno{' '}
          <span className="font-black underline decoration-indigo-300 underline-offset-4">{alunoNome}</span>{' '}
          para uma nova turma.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="id_turma_destino"
            className={`font-bold text-[13px] ml-1 uppercase tracking-tight ${errors.id_turma_destino ? 'text-rose-500' : 'text-zinc-600'}`}
          >
            Nova Turma *
          </Label>
          <select
            id="id_turma_destino"
            {...register('id_turma_destino')}
            className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${errors.id_turma_destino ? 'border-rose-500' : 'border-zinc-200'}`}
          >
            <option value="">Selecione a turma de destino</option>
            {turmasDisponiveis.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.curso?.nome} - {turma.nivel?.nome} (#{turma.id})
              </option>
            ))}
          </select>
          {errors.id_turma_destino && (
            <p className="text-[11px] text-rose-500 ml-1 font-medium">{errors.id_turma_destino.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 ml-1">
            <History className="w-4 h-4 text-zinc-400" />
            <Label
              htmlFor="motivo"
              className={`font-bold text-[13px] uppercase tracking-tight ${errors.motivo ? 'text-rose-500' : 'text-zinc-600'}`}
            >
              Motivo da Transferência *
            </Label>
          </div>
          <Input
            id="motivo"
            {...register('motivo')}
            placeholder="Ex: Mudança de horário, solicitação do aluno..."
            className={`h-11 rounded-xl focus-visible:ring-indigo-600 transition-all ${errors.motivo ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
          />
          {errors.motivo && (
            <p className="text-[11px] text-rose-500 ml-1 font-medium">{errors.motivo.message}</p>
          )}
        </div>
      </div>

      {hasFinanceiro && (
        <MensalidadeOpcoesMudanca
          values={opcoesMensalidade}
          onChange={(patch) => setOpcoesMensalidade((prev) => ({ ...prev, ...patch }))}
          valorOrigem={valorOrigem}
          valorDestino={valorDestino}
          disabled={isTransferring}
        />
      )}

      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <Info className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-800 font-medium">
          Ao confirmar, o aluno será removido da turma atual e vinculado à nova turma. Um registro histórico será gerado automaticamente.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-50">
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isTransferring}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 gap-2"
        >
          {isTransferring ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Transferindo...
            </>
          ) : (
            <>
              Confirmar Transferência
              <MoveRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
