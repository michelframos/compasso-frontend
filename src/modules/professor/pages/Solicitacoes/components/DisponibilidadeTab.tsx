import React from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { DIAS_SEMANA } from '../../../constants'
import { useDisponibilidade } from '../hooks/useDisponibilidade'

export const DisponibilidadeTab: React.FC = () => {
  const { janelas, isLoading, isSaving, alterado, adicionar, alterar, remover, salvar } = useDisponibilidade()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando disponibilidade...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Informe quando você pode dar aulas. A secretaria vê um aviso ao marcar reposições ou substituições fora destes horários.
        Sem horários cadastrados, nenhum aviso é exibido.
      </p>

      <div className="rounded-2xl bg-white border border-zinc-100 shadow-sm divide-y divide-zinc-100">
        {DIAS_SEMANA.map((dia) => {
          const doDia = janelas.filter((j) => j.dia_semana === dia.valor)
          return (
            <div key={dia.valor} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4">
              <p className="sm:w-36 shrink-0 text-sm font-bold text-zinc-900 sm:pt-2">{dia.label}</p>
              <div className="flex-1 space-y-2">
                {doDia.length === 0 && <p className="text-xs text-zinc-400 sm:pt-2.5">Indisponível</p>}
                {doDia.map((janela) => (
                  <div key={janela.chave} className="flex items-center gap-2">
                    <Input
                      type="time"
                      aria-label={`Início em ${dia.label}`}
                      value={janela.hora_inicio}
                      disabled={isSaving}
                      onChange={(e) => alterar(janela.chave, 'hora_inicio', e.target.value)}
                      className="h-10 w-32 rounded-xl border-zinc-200"
                    />
                    <span className="text-xs text-zinc-400">até</span>
                    <Input
                      type="time"
                      aria-label={`Término em ${dia.label}`}
                      value={janela.hora_termino}
                      disabled={isSaving}
                      onChange={(e) => alterar(janela.chave, 'hora_termino', e.target.value)}
                      className="h-10 w-32 rounded-xl border-zinc-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="Remover horário"
                      disabled={isSaving}
                      onClick={() => remover(janela.chave)}
                      className="h-9 w-9 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                disabled={isSaving}
                onClick={() => adicionar(dia.valor)}
                className="self-start h-9 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-50 gap-1 hover:cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Horário
              </Button>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={salvar}
          disabled={isSaving || !alterado}
          className="h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 px-8 font-bold hover:cursor-pointer"
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar disponibilidade
        </Button>
      </div>
    </div>
  )
}
