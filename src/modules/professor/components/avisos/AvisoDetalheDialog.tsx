import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { getErrorMessage } from '@/shared/lib/utils'
import type { AvisosApi } from '../../api/avisos'
import { CANAL_AVISO, PUBLICO_AVISO, STATUS_DESTINATARIO_AVISO } from '../../constants'
import type { AvisoTurma } from '../../types'

interface AvisoDetalheDialogProps {
  aviso: AvisoTurma | null
  api: AvisosApi
  onFechar: () => void
}

export const AvisoDetalheDialog: React.FC<AvisoDetalheDialogProps> = ({ aviso, api, onFechar }) => {
  const [detalhe, setDetalhe] = useState<AvisoTurma | null>(null)

  useEffect(() => {
    if (!aviso) return
    let cancelled = false

    api
      .detalhar(aviso.id)
      .then((dados) => !cancelled && setDetalhe(dados))
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar o aviso.'))
      })

    return () => {
      cancelled = true
      setDetalhe(null)
    }
  }, [aviso, api])

  const atual = detalhe ?? aviso

  return (
    <CustomModalGlobal
      open={aviso !== null}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={onFechar}
      isLoading={false}
      firsChunkTitle={atual?.titulo ?? 'Aviso'}
      titleDescription={
        atual
          ? `${atual.turma?.nome ?? 'Alunos escolhidos'} · ${PUBLICO_AVISO[atual.publico].label}${
              atual.enviado_em ? ` · ${format(new Date(atual.enviado_em), "dd/MM/yyyy 'às' HH:mm")}` : ''
            }`
          : undefined
      }
      showConfirmButton={false}
      textCancelButton="Fechar"
    >
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
        {atual && <p className="text-sm text-zinc-700 whitespace-pre-line break-words">{atual.mensagem}</p>}
        {atual?.autor.nome && <p className="text-xs text-zinc-400">Enviado por {atual.autor.nome}</p>}

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Entrega</p>
          {!detalhe?.destinatarios ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando...
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100">
              {detalhe.destinatarios.map((d) => {
                const status = STATUS_DESTINATARIO_AVISO[d.status]
                return (
                  <li key={d.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{d.nome}</p>
                      <p className="text-[11px] text-zinc-500">
                        {d.tipo === 'responsavel' ? `Responsável${d.aluno ? ` por ${d.aluno}` : ''}` : 'Aluno'} · {CANAL_AVISO[d.canal]}
                        {d.destino && ` · ${d.destino}`}
                      </p>
                      {d.erro && <p className="text-[11px] text-rose-600 mt-0.5">{d.erro}</p>}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.className}`}>
                      {status.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </CustomModalGlobal>
  )
}
