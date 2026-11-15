import React from 'react'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { CurrencyInput } from '@/shared/components/ui/currency-input'

export type MensalidadeOpcoesMudancaValues = {
  reajustar_mensalidades: boolean
  gerar_novas_mensalidades: boolean
  valor_mensalidade_geracao: number
  quantidade_parcelas: number
  dia_vencimento: number
  data_inicio_mensalidades: string
}

type Props = {
  values: MensalidadeOpcoesMudancaValues
  onChange: (patch: Partial<MensalidadeOpcoesMudancaValues>) => void
  valorOrigem?: number | null
  valorDestino?: number | null
  disabled?: boolean
}

export const MensalidadeOpcoesMudanca: React.FC<Props> = ({
  values,
  onChange,
  valorOrigem,
  valorDestino,
  disabled,
}) => {
  const format = (v: number | null | undefined) =>
    Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
      <div>
        <p className="text-sm font-bold text-zinc-900">Mensalidades</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Opções independentes ao mudar de turma.
          {valorOrigem != null || valorDestino != null ? (
            <> Valor origem {format(valorOrigem)} → destino {format(valorDestino)}.</>
          ) : null}
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-zinc-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={values.reajustar_mensalidades}
          disabled={disabled}
          onChange={(e) => onChange({ reajustar_mensalidades: e.target.checked })}
        />
        <span>
          <span className="font-semibold">Reajustar mensalidades restantes</span>
          <span className="block text-xs text-zinc-500">
            Atualiza o valor das parcelas pendentes/vencidas a partir do mês da mudança.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm text-zinc-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={values.gerar_novas_mensalidades}
          disabled={disabled}
          onChange={(e) => onChange({ gerar_novas_mensalidades: e.target.checked })}
        />
        <span>
          <span className="font-semibold">Gerar novas mensalidades</span>
          <span className="block text-xs text-zinc-500">
            Cria um novo lote a partir da data informada (sem duplicar mês já existente).
          </span>
        </span>
      </label>

      {(values.reajustar_mensalidades || values.gerar_novas_mensalidades) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <Label className="text-zinc-700 font-medium ml-1">Valor (R$)</Label>
            <CurrencyInput
              value={values.valor_mensalidade_geracao}
              onChange={(v) => onChange({ valor_mensalidade_geracao: v })}
              prefix="R$"
              disabled={disabled}
              className="h-11 rounded-xl border-zinc-200"
            />
          </div>

          {values.gerar_novas_mensalidades && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-700 font-medium ml-1">Parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={values.quantidade_parcelas}
                  disabled={disabled}
                  onChange={(e) => onChange({ quantidade_parcelas: Number(e.target.value) || 1 })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700 font-medium ml-1">Dia de vencimento</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={values.dia_vencimento}
                  disabled={disabled}
                  onChange={(e) => onChange({ dia_vencimento: Number(e.target.value) || 1 })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700 font-medium ml-1">Início das parcelas</Label>
                <Input
                  type="date"
                  value={values.data_inicio_mensalidades}
                  disabled={disabled}
                  onChange={(e) => onChange({ data_inicio_mensalidades: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
