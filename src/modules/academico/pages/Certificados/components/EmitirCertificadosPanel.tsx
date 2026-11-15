import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Check, Download, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
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
  listarTemplatesCertificados,
  type TemplateCertificado,
} from '../../../api/templatesCertificados'
import type { CertificadoStaff } from '../../../api/certificados'
import { useCertificados } from '../hooks/useCertificados'

type SubAba = 'pendentes' | 'emitidos'

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
    gruposElegiveis,
    totalElegiveis,
    totalEmitidos,
    isLoading,
    emitindoId,
    emitindoLote,
    reemitindoId,
    baixandoPdfId,
    selecionados,
    buscaElegiveis,
    setBuscaElegiveis,
    buscaEmitidos,
    setBuscaEmitidos,
    filtroTurma,
    setFiltroTurma,
    turmasDisponiveis,
    falhasRecentes,
    limparFalhas,
    todosFiltradosSelecionados,
    alternarSelecao,
    alternarSelecionarTodosFiltrados,
    selecionarTurma,
    turmaTotalmenteSelecionada,
    emitir,
    emitirLote,
    reemitir,
    baixarPdf,
  } = useCertificados()

  const [subAba, setSubAba] = useState<SubAba>('pendentes')
  const [confirmandoLote, setConfirmandoLote] = useState(false)
  const [reemitindoCertificado, setReemitindoCertificado] = useState<CertificadoStaff | null>(null)
  const [templates, setTemplates] = useState<TemplateCertificado[]>([])
  const [carregandoTemplates, setCarregandoTemplates] = useState(false)
  const [templateSelecionado, setTemplateSelecionado] = useState('')
  const idsSelecionados = useMemo(() => Array.from(selecionados), [selecionados])
  const ocupado = emitindoId !== null || emitindoLote || reemitindoId !== null
  const temFiltroAtivo = Boolean(buscaElegiveis.trim() || filtroTurma)
  const temFiltroEmitidos = Boolean(buscaEmitidos.trim() || filtroTurma)

  useEffect(() => {
    if (!reemitindoCertificado) {
      setTemplates([])
      setTemplateSelecionado('')
      return
    }

    let ativo = true
    setCarregandoTemplates(true)
    setTemplateSelecionado('')

    listarTemplatesCertificados()
      .then((lista) => {
        if (ativo) setTemplates(lista)
      })
      .catch((erro) => {
        if (!ativo) return
        toast.error(getErrorMessage(erro, 'Não foi possível carregar os templates.'))
        setReemitindoCertificado(null)
      })
      .finally(() => {
        if (ativo) setCarregandoTemplates(false)
      })

    return () => {
      ativo = false
    }
  }, [reemitindoCertificado])

  const confirmarReemissao = async () => {
    if (!reemitindoCertificado) return
    const idTemplate = templateSelecionado === '' ? null : Number(templateSelecionado)
    const atualizado = await reemitir(reemitindoCertificado, idTemplate)
    if (atualizado) setReemitindoCertificado(null)
  }

  const irParaEmitidos = () => {
    setSubAba('emitidos')
    limparFalhas()
  }

  const confirmarLote = async () => {
    const resultado = await emitirLote(idsSelecionados)
    setConfirmandoLote(false)
    if (resultado.emitidos > 0 && resultado.falhas === 0) {
      toast.success(
        resultado.emitidos === 1
          ? '1 certificado emitido.'
          : `${resultado.emitidos} certificados emitidos.`,
        {
          action: {
            label: 'Ver emitidos',
            onClick: irParaEmitidos,
          },
        },
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative space-y-5 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 border-b border-zinc-100">
          <button
            type="button"
            onClick={() => setSubAba('pendentes')}
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-bold transition-all hover:cursor-pointer ${
              subAba === 'pendentes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Pendentes
            {totalElegiveis > 0 && (
              <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                {totalElegiveis}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubAba('emitidos')}
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-bold transition-all hover:cursor-pointer ${
              subAba === 'emitidos'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Emitidos
            {totalEmitidos > 0 && (
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500">
                {totalEmitidos}
              </span>
            )}
          </button>
        </div>

        {subAba === 'pendentes' && (
          <Link
            to="/turmas"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Emitir por turma
          </Link>
        )}
      </div>

      {subAba === 'pendentes' ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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
              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <option value="">Todas as turmas</option>
                {turmasDisponiveis.map((turma) => (
                  <option key={turma} value={turma}>
                    {turma}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {falhasRecentes.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    {falhasRecentes.length} falha{falhasRecentes.length === 1 ? '' : 's'} na emissão
                  </p>
                  <ul className="mt-2 space-y-1">
                    {falhasRecentes.map((falha) => (
                      <li key={falha.id_matricula} className="text-xs text-amber-800">
                        <span className="font-semibold">
                          {falha.aluno ?? `Matrícula #${falha.id_matricula}`}
                        </span>
                        {' — '}
                        {falha.mensagem}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={limparFalhas}
                  className="rounded-full p-1 text-amber-700 hover:bg-amber-100 hover:cursor-pointer"
                  aria-label="Dispensar falhas"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {elegiveis.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-4 py-12 text-center">
              <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400">
                <Award className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-zinc-900">
                {totalElegiveis === 0 ? 'Nenhuma matrícula elegível' : 'Nenhum resultado'}
              </p>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                {totalElegiveis === 0
                  ? 'Só entram matrículas Completadas com frequência mínima atingida e sem certificado.'
                  : temFiltroAtivo
                    ? 'Tente outro termo ou limpe o filtro de turma.'
                    : 'Tente outro termo de busca.'}
              </p>
              {totalElegiveis === 0 && (
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 h-9 rounded-full border-zinc-200 px-4 text-xs font-bold"
                >
                  <Link to="/turmas">Nas turmas concluídas use Emitir certificados</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5">
                <Checkbox
                  checked={todosFiltradosSelecionados}
                  onCheckedChange={() => alternarSelecionarTodosFiltrados()}
                  aria-label="Selecionar todos"
                  className="border-zinc-300"
                />
                <button
                  type="button"
                  onClick={alternarSelecionarTodosFiltrados}
                  className="text-xs font-bold text-zinc-600 hover:cursor-pointer hover:text-indigo-600"
                >
                  {todosFiltradosSelecionados ? 'Limpar seleção' : 'Selecionar todos visíveis'}
                </button>
                <span className="ml-auto text-[11px] font-medium text-zinc-400">
                  {elegiveis.length} na lista
                </span>
              </div>

              {gruposElegiveis.map((grupo) => {
                const todosDoGrupo = turmaTotalmenteSelecionada(grupo.turma)
                return (
                  <div
                    key={grupo.turma}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                  >
                    <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
                      <Checkbox
                        checked={todosDoGrupo}
                        disabled={ocupado}
                        onCheckedChange={() => selecionarTurma(grupo.turma)}
                        aria-label={`Selecionar turma ${grupo.turma}`}
                        className="border-zinc-300"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-zinc-800">{grupo.turma}</p>
                        <p className="text-[11px] text-zinc-400">
                          {grupo.itens.length} aluno{grupo.itens.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => selecionarTurma(grupo.turma)}
                        className="text-[11px] font-bold text-indigo-600 hover:cursor-pointer hover:text-indigo-700 disabled:opacity-50"
                      >
                        {todosDoGrupo ? 'Limpar turma' : 'Selecionar turma'}
                      </button>
                    </div>

                    <ul className="divide-y divide-zinc-100">
                      {grupo.itens.map((matricula) => {
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
                                  {[matricula.curso, matricula.nivel].filter(Boolean).join(' · ')}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                    {freq(matricula.frequencia_percentual)} · mín.{' '}
                                    {freq(matricula.frequencia_minima)}
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
                )
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Já emitidos</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {totalEmitidos === 0
                  ? 'Nenhum certificado emitido ainda.'
                  : `${totalEmitidos} certificado${totalEmitidos === 1 ? '' : 's'} na escola.`}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={buscaEmitidos}
                  onChange={(e) => setBuscaEmitidos(e.target.value)}
                  placeholder="Buscar aluno ou código"
                  className="h-9 rounded-full border-zinc-200 pl-9 text-sm"
                />
              </div>
              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <option value="">Todas as turmas</option>
                {turmasDisponiveis.map((turma) => (
                  <option key={turma} value={turma}>
                    {turma}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {certificados.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-4 py-12 text-center">
              <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400">
                <Award className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-zinc-900">
                {totalEmitidos === 0 ? 'Nenhum certificado emitido' : 'Nenhum resultado'}
              </p>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                {totalEmitidos === 0
                  ? 'Os certificados emitidos aparecem aqui para download do PDF.'
                  : temFiltroEmitidos
                    ? 'Tente outro termo ou limpe o filtro de turma.'
                    : 'Tente outro termo de busca.'}
              </p>
            </div>
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
                        {[
                          certificado.curso,
                          certificado.turma,
                          certificado.nivel,
                          carga(certificado.carga_horaria),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        {certificado.codigo_verificacao}
                        {certificado.emitido_em ? ` · ${certificado.emitido_em}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={ocupado || baixandoPdfId === certificado.id}
                        onClick={() => setReemitindoCertificado(certificado)}
                        className="h-8 rounded-full border-zinc-200 px-3 text-xs font-bold"
                      >
                        {reemitindoId === certificado.id ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Reemitindo...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            Reemitir
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={baixandoPdfId === certificado.id}
                        onClick={() => void baixarPdf(certificado)}
                        className="h-8 rounded-full border-zinc-200 px-3 text-xs font-bold"
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
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Dialog
        open={reemitindoCertificado !== null}
        onOpenChange={(open) => {
          if (!open && reemitindoId === null) setReemitindoCertificado(null)
        }}
      >
        <DialogContent className="rounded-[24px] border-none p-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold text-zinc-900">
              Reemitir certificado
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              O código de verificação permanece o mesmo
              {reemitindoCertificado
                ? ` (${reemitindoCertificado.codigo_verificacao})`
                : ''}
              . Escolha o template para regenerar o PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="template-reemissao" className="ml-1 font-medium text-zinc-700">
                Template
              </Label>
              {carregandoTemplates ? (
                <div className="flex h-11 items-center justify-center rounded-xl border border-zinc-200">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                </div>
              ) : (
                <select
                  id="template-reemissao"
                  value={templateSelecionado}
                  onChange={(e) => setTemplateSelecionado(e.target.value)}
                  disabled={reemitindoId !== null}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <option value="">Template do curso (padrão)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={String(template.id)}>
                      {template.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              Aluno: {reemitindoCertificado?.aluno?.nome ?? '—'}
            </p>
          </div>

          <DialogFooter className="gap-2 border-t border-zinc-100 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              disabled={reemitindoId !== null}
              onClick={() => setReemitindoCertificado(null)}
              className="h-9 rounded-full px-5 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={reemitindoId !== null || carregandoTemplates}
              onClick={() => void confirmarReemissao()}
              className="h-9 rounded-full bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700"
            >
              {reemitindoId !== null ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Reemitindo...
                </>
              ) : (
                'Confirmar reemissão'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {subAba === 'pendentes' && idsSelecionados.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="text-sm font-bold text-zinc-800">
              {idsSelecionados.length} selecionado{idsSelecionados.length === 1 ? '' : 's'}
            </p>
            <Button
              type="button"
              disabled={ocupado}
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
      )}

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
                    {idsSelecionados.length === 1 ? '' : 's'}. Matrículas que falharem aparecem com o
                    motivo do erro.
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
                void confirmarLote()
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
