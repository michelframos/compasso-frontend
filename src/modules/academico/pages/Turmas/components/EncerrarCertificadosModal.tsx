import React, { useEffect, useMemo, useState } from 'react'
import { Award, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  emitirEncerramentoCertificados,
  previewEncerramentoCertificados,
  type MatriculaEncerramentoCertificado,
  type PreviewEncerramentoCertificados,
} from '../../../api/certificados'

function carga(valor: number | null | undefined) {
  if (valor == null) return '—'
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`
}

function freq(valor: number | null | undefined) {
  if (valor == null) return '—'
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

type Props = {
  turmaId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConcluido?: () => void
}

export const EncerrarCertificadosModal: React.FC<Props> = ({
  turmaId,
  open,
  onOpenChange,
  onConcluido,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [emitindo, setEmitindo] = useState(false)
  const [preview, setPreview] = useState<PreviewEncerramentoCertificados | null>(null)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!open || !turmaId) {
      setPreview(null)
      setSelecionados(new Set())
      return
    }

    let ativo = true
    setIsLoading(true)

    previewEncerramentoCertificados(turmaId)
      .then((dados) => {
        if (!ativo) return
        setPreview(dados)
        setSelecionados(new Set(dados.aptos.map((item) => item.id)))
      })
      .catch((erro) => {
        if (!ativo) return
        toast.error(getErrorMessage(erro, 'Não foi possível carregar os alunos aptos.'))
        onOpenChange(false)
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [open, turmaId, onOpenChange])

  const idsSelecionados = useMemo(() => Array.from(selecionados), [selecionados])
  const todosAptosSelecionados =
    (preview?.aptos.length ?? 0) > 0 && idsSelecionados.length === (preview?.aptos.length ?? 0)

  const alternarSelecao = (id: number) => {
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  const alternarTodos = () => {
    if (!preview) return
    setSelecionados((atual) => {
      if (atual.size === preview.aptos.length) return new Set()
      return new Set(preview.aptos.map((item) => item.id))
    })
  }

  const emitir = async () => {
    if (!turmaId || idsSelecionados.length === 0) return
    setEmitindo(true)
    try {
      const resultado = await emitirEncerramentoCertificados(turmaId, idsSelecionados)
      if (resultado.falhas.length === 0) {
        toast.success(
          resultado.emitidos.length === 1
            ? 'Certificado emitido.'
            : `${resultado.emitidos.length} certificados emitidos.`,
        )
      } else if (resultado.emitidos.length === 0) {
        toast.error('Nenhum certificado foi emitido.')
      } else {
        toast.warning(
          `${resultado.emitidos.length} emitido(s), ${resultado.falhas.length} falha(s).`,
        )
      }
      onOpenChange(false)
      onConcluido?.()
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível emitir os certificados.'))
    } finally {
      setEmitindo(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-[24px] border-none p-0 shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-xl font-bold text-zinc-900">Emitir certificados</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Alunos aptos serão marcados como Completados e receberão o certificado. Inaptos ficam
            só para consulta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-8 py-5">
          {isLoading || !preview ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Aptos ({preview.aptos.length})
                  </h3>
                  {preview.aptos.length > 0 && (
                    <button
                      type="button"
                      onClick={alternarTodos}
                      className="text-xs font-bold text-zinc-500 hover:cursor-pointer hover:text-indigo-600"
                    >
                      {todosAptosSelecionados ? 'Limpar seleção' : 'Selecionar todos'}
                    </button>
                  )}
                </div>

                {preview.aptos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center">
                    <Award className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                    <p className="text-sm font-bold text-zinc-900">Nenhum aluno apto</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Ninguém atingiu a frequência mínima ou todos já têm certificado.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    {preview.aptos.map((item) => (
                      <AptoItem
                        key={item.id}
                        item={item}
                        selecionado={selecionados.has(item.id)}
                        disabled={emitindo}
                        onToggle={() => alternarSelecao(item.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>

              {preview.inaptos.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Inaptos ({preview.inaptos.length})
                  </h3>
                  <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/60">
                    {preview.inaptos.map((item) => (
                      <li key={item.id} className="px-4 py-3">
                        <p className="truncate text-sm font-bold text-zinc-700">
                          {item.aluno?.nome ?? 'Aluno'}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{item.motivo}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                            Freq. {freq(item.frequencia_percentual)}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                            Mín. {freq(item.frequencia_minima)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-3 border-t border-zinc-100 px-8 py-5">
          <Button
            variant="ghost"
            disabled={emitindo}
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-full px-6 font-bold hover:cursor-pointer hover:bg-zinc-100"
          >
            Cancelar
          </Button>
          <Button
            disabled={emitindo || isLoading || idsSelecionados.length === 0}
            onClick={() => void emitir()}
            className="h-9 rounded-full bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-100 hover:cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
          >
            {emitindo ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Emitindo...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Emitir ({idsSelecionados.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AptoItem({
  item,
  selecionado,
  disabled,
  onToggle,
}: {
  item: MatriculaEncerramentoCertificado
  selecionado: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <li className={`flex items-start gap-3 px-4 py-3 ${selecionado ? 'bg-indigo-50/40' : ''}`}>
      <Checkbox
        checked={selecionado}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={`Selecionar ${item.aluno?.nome ?? 'aluno'}`}
        className="mt-1 border-zinc-300"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-zinc-900">{item.aluno?.nome ?? 'Aluno'}</p>
        <p className="mt-0.5 text-xs text-zinc-500 capitalize">Status: {item.status}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            Freq. {freq(item.frequencia_percentual)}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {carga(item.carga_horaria)}
          </span>
        </div>
      </div>
    </li>
  )
}
