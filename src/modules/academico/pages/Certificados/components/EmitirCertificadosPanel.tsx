import React, { useMemo, useState } from 'react'
import { Award, Check, Download, Loader2, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useCertificados } from '../hooks/useCertificados'

function carga(valor: number | null | undefined) {
  if (valor == null) return '—'
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`
}

function freq(valor: number) {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

export const EmitirCertificadosPanel: React.FC = () => {
  const {
    certificados,
    elegiveis,
    totalElegiveis,
    totalEmitidos,
    isLoading,
    emitindoId,
    emitindoLote,
    baixandoPdfId,
    selecionados,
    buscaElegiveis,
    setBuscaElegiveis,
    buscaEmitidos,
    setBuscaEmitidos,
    todosFiltradosSelecionados,
    alternarSelecao,
    alternarSelecionarTodosFiltrados,
    emitir,
    emitirLote,
    baixarPdf,
  } = useCertificados()

  const [confirmandoLote, setConfirmandoLote] = useState(false)
  const idsSelecionados = useMemo(() => Array.from(selecionados), [selecionados])
  const ocupado = emitindoId !== null || emitindoLote

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Prontas para emitir</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {totalElegiveis === 0
                ? 'Nenhuma matrícula elegível no momento.'
                : `${totalElegiveis} matrícula${totalElegiveis === 1 ? '' : 's'} com frequência mínima e status Completada.`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <Input
                value={buscaElegiveis}
                onChange={(e) => setBuscaElegiveis(e.target.value)}
                placeholder="Buscar aluno, curso ou turma"
                className="h-9 rounded-full border-zinc-200 pl-9 text-sm"
              />
            </div>
            <Button
              type="button"
              disabled={idsSelecionados.length === 0 || ocupado}
              onClick={() => setConfirmandoLote(true)}
              className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {emitindoLote ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Emitindo...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Emitir selecionados ({idsSelecionados.length})
                </>
              )}
            </Button>
          </div>
        </div>

        {elegiveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-4 py-12 text-center">
            <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-zinc-900">
              {totalElegiveis === 0 ? 'Nenhuma matrícula elegível' : 'Nenhum resultado na busca'}
            </p>
            <p className="mt-1 max-w-sm text-xs text-zinc-500">
              {totalElegiveis === 0
                ? 'Só entram matrículas Completadas com frequência mínima atingida e sem certificado.'
                : 'Tente outro termo de busca.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
              <Checkbox
                checked={todosFiltradosSelecionados}
                onCheckedChange={() => alternarSelecionarTodosFiltrados()}
                aria-label="Selecionar todos"
                className="border-zinc-300"
              />
              <button
                type="button"
                onClick={alternarSelecionarTodosFiltrados}
                className="text-xs font-bold text-zinc-600 hover:text-indigo-600 hover:cursor-pointer"
              >
                {todosFiltradosSelecionados ? 'Limpar seleção' : 'Selecionar todos'}
              </button>
              <span className="ml-auto text-[11px] font-medium text-zinc-400">
                {elegiveis.length} na lista
              </span>
            </div>

            <ul className="divide-y divide-zinc-100">
              {elegiveis.map((matricula) => {
                const selecionada = selecionados.has(matricula.id)
                const emitindo = emitindoId === matricula.id
                return (
                  <li
                    key={matricula.id}
                    className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                      selecionada ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <Checkbox
                        checked={selecionada}
                        disabled={ocupado}
                        onCheckedChange={() => alternarSelecao(matricula.id)}
                        aria-label={`Selecionar ${matricula.aluno?.nome ?? 'aluno'}`}
                        className="mt-1 border-zinc-300"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-900">
                          {matricula.aluno?.nome ?? 'Aluno'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {[matricula.curso, matricula.turma, matricula.nivel].filter(Boolean).join(' · ')}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            Freq. {freq(matricula.frequencia_percentual)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                            {carga(matricula.carga_horaria)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={ocupado}
                      onClick={() => void emitir(matricula.id)}
                      className="h-8 shrink-0 rounded-full bg-emerald-600 px-3 text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {emitindo ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Emitindo...
                        </>
                      ) : (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Emitir
                        </>
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Já emitidos</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {totalEmitidos === 0
                ? 'Nenhum certificado emitido ainda.'
                : `${totalEmitidos} certificado${totalEmitidos === 1 ? '' : 's'} na escola.`}
            </p>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={buscaEmitidos}
              onChange={(e) => setBuscaEmitidos(e.target.value)}
              placeholder="Buscar aluno ou código"
              className="h-9 rounded-full border-zinc-200 pl-9 text-sm"
            />
          </div>
        </div>

        {certificados.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {totalEmitidos === 0 ? 'Nenhum certificado emitido ainda.' : 'Nenhum resultado na busca.'}
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <ul className="divide-y divide-zinc-100">
              {certificados.map((certificado) => (
                <li
                  key={certificado.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-900">
                      {certificado.aluno?.nome ?? 'Aluno'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {[certificado.curso, certificado.turma, certificado.nivel, carga(certificado.carga_horaria)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                      {certificado.codigo_verificacao}
                      {certificado.emitido_em ? ` · ${certificado.emitido_em}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={baixandoPdfId === certificado.id}
                    onClick={() => void baixarPdf(certificado)}
                    className="h-8 shrink-0 rounded-full border-zinc-200 px-3 text-xs font-bold"
                  >
                    {baixandoPdfId === certificado.id ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        PDF
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <AlertDialog open={confirmandoLote} onOpenChange={setConfirmandoLote}>
        <AlertDialogContent className="gap-0 overflow-hidden rounded-[28px] border-none p-0 shadow-2xl sm:max-w-[420px]">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <AlertDialogTitle className="text-xl font-bold leading-tight text-zinc-900">
                  Emitir <span className="text-emerald-600">em lote</span>?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="text-sm leading-relaxed text-zinc-500">
                    Serão emitidos {idsSelecionados.length} certificado
                    {idsSelecionados.length === 1 ? '' : 's'}. Matrículas que falharem continuam na
                    lista com o motivo do erro.
                  </div>
                </AlertDialogDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/80 px-6 py-4 sm:flex-row sm:justify-end">
            <AlertDialogCancel
              disabled={emitindoLote}
              className="mt-0 h-9 rounded-full border-zinc-200 px-5 font-bold hover:cursor-pointer hover:bg-white"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={emitindoLote}
              onClick={(e) => {
                e.preventDefault()
                void emitirLote(idsSelecionados).then(() => setConfirmandoLote(false))
              }}
              className="h-9 rounded-full border-none bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-100 hover:cursor-pointer hover:bg-emerald-700"
            >
              {emitindoLote ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Emitindo...
                </>
              ) : (
                'Confirmar emissão'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
