import React, { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { getErrorMessage } from '@/shared/lib/utils'
import { listAulasAgendadas } from '../../../api/aulas'
import { dataLocal, hora, tituloAula } from '../../../lib/formatters'
import type { AulaDoProfessor } from '../../../types'

interface EscolherAulaDialogProps {
  aberto: boolean
  onFechar: () => void
  onEscolher: (aula: AulaDoProfessor) => void
}

const DIAS_A_FRENTE = 45

export const EscolherAulaDialog: React.FC<EscolherAulaDialogProps> = ({ aberto, onFechar, onEscolher }) => {
  const [aulas, setAulas] = useState<AulaDoProfessor[] | null>(null)

  useEffect(() => {
    if (!aberto) return
    let cancelled = false
    const hoje = new Date()

    listAulasAgendadas({ data_inicio: format(hoje, 'yyyy-MM-dd'), data_fim: format(addDays(hoje, DIAS_A_FRENTE), 'yyyy-MM-dd') })
      .then((lista) => {
        if (!cancelled) setAulas(lista)
      })
      .catch((err) => {
        if (cancelled) return
        setAulas([])
        toast.error(getErrorMessage(err, 'Não foi possível carregar suas aulas.'))
      })

    return () => {
      cancelled = true
      setAulas(null)
    }
  }, [aberto])

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={onFechar}
      isLoading={false}
      firsChunkTitle="Qual"
      secondChunkTitle="aula?"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription={`Suas aulas agendadas nos próximos ${DIAS_A_FRENTE} dias.`}
      showConfirmButton={false}
      textCancelButton="Fechar"
    >
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-2">
        {aulas === null ? (
          <div className="flex items-center justify-center py-10 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando aulas...</span>
          </div>
        ) : aulas.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">Nenhuma aula agendada no período.</p>
        ) : (
          aulas.map((aula) => (
            <button
              key={aula.id}
              type="button"
              onClick={() => onEscolher(aula)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-white text-left hover:border-indigo-300 hover:bg-indigo-50/40 hover:cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 truncate">{tituloAula(aula)}</p>
                <p className="text-[11px] text-zinc-500 first-letter:uppercase">
                  {format(dataLocal(aula.data), "EEE, dd/MM", { locale: ptBR })} · {hora(aula.hora_inicio)}–{hora(aula.hora_termino)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
            </button>
          ))
        )}
      </div>
    </CustomModalGlobal>
  )
}
