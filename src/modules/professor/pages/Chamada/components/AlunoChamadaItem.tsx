import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import type { PresencaStatus } from '../../../types'

const OPCOES: { status: PresencaStatus; sigla: string; label: string; ativo: string }[] = [
  { status: 'presente', sigla: 'P', label: 'Presente', ativo: 'bg-emerald-500 text-white border-emerald-500' },
  { status: 'ausente', sigla: 'F', label: 'Falta', ativo: 'bg-rose-500 text-white border-rose-500' },
  { status: 'justificado', sigla: 'J', label: 'Falta justificada', ativo: 'bg-amber-500 text-white border-amber-500' },
]

interface AlunoChamadaItemProps {
  nome: string
  status?: PresencaStatus
  observacao: string
  somenteLeitura: boolean
  onMarcar: (status: PresencaStatus) => void
  onObservacao: (texto: string) => void
  onAbrirFicha: () => void
}

export const AlunoChamadaItem: React.FC<AlunoChamadaItemProps> = ({
  nome,
  status,
  observacao,
  somenteLeitura,
  onMarcar,
  onObservacao,
  onAbrirFicha,
}) => {
  const [mostrarObservacao, setMostrarObservacao] = useState(!!observacao)

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
          {nome.charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={onAbrirFicha}
          title="Abrir ficha do aluno"
          className="flex-1 min-w-0 text-left text-sm font-bold text-zinc-900 truncate hover:text-indigo-600 hover:underline underline-offset-2 hover:cursor-pointer"
        >
          {nome}
        </button>

        {!somenteLeitura && (
          <button
            type="button"
            onClick={() => setMostrarObservacao((v) => !v)}
            className={`p-2 rounded-full hover:bg-zinc-100 hover:cursor-pointer ${observacao ? 'text-indigo-600' : 'text-zinc-400'}`}
            title="Observação"
            aria-label={`Observação para ${nome}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}

        <div className="flex gap-1.5 shrink-0" role="radiogroup" aria-label={`Presença de ${nome}`}>
          {OPCOES.map((opcao) => {
            const selecionado = status === opcao.status
            return (
              <button
                key={opcao.status}
                type="button"
                role="radio"
                aria-checked={selecionado}
                title={opcao.label}
                disabled={somenteLeitura}
                onClick={() => onMarcar(opcao.status)}
                className={`w-10 h-10 rounded-xl border text-sm font-black transition-all active:scale-95 disabled:cursor-default ${
                  selecionado ? opcao.ativo : 'bg-white text-zinc-400 border-zinc-200 enabled:hover:border-zinc-300 enabled:hover:cursor-pointer'
                } ${somenteLeitura && !selecionado ? 'opacity-40' : ''}`}
              >
                {opcao.sigla}
              </button>
            )
          })}
        </div>
      </div>

      {mostrarObservacao && !somenteLeitura && (
        <Input
          value={observacao}
          onChange={(e) => onObservacao(e.target.value)}
          placeholder="Observação (opcional)"
          maxLength={1000}
          className="h-9 rounded-xl text-sm"
        />
      )}
      {somenteLeitura && observacao && <p className="text-xs text-zinc-500 pl-[52px]">{observacao}</p>}
    </div>
  )
}
