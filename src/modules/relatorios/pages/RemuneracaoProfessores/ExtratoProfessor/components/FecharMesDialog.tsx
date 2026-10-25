import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { addMonths, format, max, setDate, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { moeda } from '@/modules/professor'

const schema = z.object({
  data_vencimento: z.string().min(1, 'Informe o vencimento'),
})

type FecharMesValues = z.infer<typeof schema>

/** Dia 5 do mês seguinte à competência ou hoje, se já passou (mesmo padrão da API). */
const vencimentoPadrao = (mes: Date) =>
  format(max([setDate(addMonths(startOfMonth(mes), 1), 5), new Date()]), 'yyyy-MM-dd')

interface FecharMesDialogProps {
  aberto: boolean
  mes: Date
  professor: string
  total: number
  geraDespesa: boolean
  isSaving: boolean
  onFechar: () => void
  onConfirmar: (dataVencimento: string | null) => void
}

export const FecharMesDialog: React.FC<FecharMesDialogProps> = ({ aberto, mes, professor, total, geraDespesa, isSaving, onFechar, onConfirmar }) => {
  const form = useForm<FecharMesValues>({
    resolver: zodResolver(schema),
    defaultValues: { data_vencimento: vencimentoPadrao(mes) },
  })
  const { register, formState: { errors } } = form

  useEffect(() => {
    if (aberto) form.reset({ data_vencimento: vencimentoPadrao(mes) })
  }, [aberto, mes, form])

  const enviar = form.handleSubmit((valores) => onConfirmar(geraDespesa ? valores.data_vencimento : null))

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      loadingText="Fechando..."
      firsChunkTitle="Fechar"
      secondChunkTitle={format(mes, 'MMMM yyyy', { locale: ptBR })}
      colorSecondChunkTitle="text-indigo-600"
      titleDescription={`Os valores de ${professor} ficam congelados em ${moeda(total)}.`}
      textConfirmButton="Fechar mês"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-4"
      >
        {geraDespesa ? (
          <>
            <p className="text-sm text-zinc-600">
              Uma despesa de <span className="font-bold">{moeda(total)}</span> será lançada no financeiro, na categoria
              "Pagamento de professores".
            </p>
            <div className="space-y-2">
              <Label htmlFor="vencimento-fechamento" className="text-zinc-700 font-medium ml-1">Vencimento *</Label>
              <Input
                id="vencimento-fechamento"
                type="date"
                disabled={isSaving}
                className={`h-11 rounded-xl ${errors.data_vencimento ? 'border-rose-500' : 'border-zinc-200'}`}
                {...register('data_vencimento')}
              />
              {errors.data_vencimento && <p className="text-[11px] text-rose-500 ml-1">{errors.data_vencimento.message}</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-600">
            Nenhuma despesa será lançada: o total do mês é zero ou a escola não usa o módulo financeiro.
          </p>
        )}
        <p className="text-[12px] text-zinc-500">
          Aulas concluídas ou pagamentos registrados depois do fechamento não alteram este extrato. Para recalcular, reabra o mês.
        </p>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
