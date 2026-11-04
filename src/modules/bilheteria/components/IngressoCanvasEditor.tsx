import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BringToFront,
  Copy,
  MousePointer2,
  QrCode,
  SendToBack,
  Square,
  Trash2,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  dimensoesPreviewPx,
  novoIdElemento,
  type ElementoIngresso,
  type ElementoTextoIngresso,
  type LayoutIngresso,
  type UnidadeTemplate,
} from '../types'

const PLACEHOLDERS = [
  { label: 'Número', value: '{{numero}}' },
  { label: 'Espetáculo', value: '{{espetaculo}}' },
  { label: 'Data', value: '{{data}}' },
  { label: 'Hora', value: '{{hora}}' },
  { label: 'Local', value: '{{local}}' },
  { label: 'Valor', value: '{{valor}}' },
]

const TAMANHOS = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48]

type DragMode = 'move' | 'se' | 'e' | 's'

interface Props {
  layout: LayoutIngresso
  onChange: (layout: LayoutIngresso) => void
  largura: number
  altura: number
  unidade: UnidadeTemplate
  fundoUrl?: string | null
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function rotuloElemento(el: ElementoIngresso): string {
  if (el.tipo === 'texto') {
    const t = el.texto.replace(/\s+/g, ' ').trim()
    return t ? (t.length > 28 ? `${t.slice(0, 28)}…` : t) : 'Texto vazio'
  }
  if (el.tipo === 'qrcode') return 'QR Code'
  if (el.tipo === 'retangulo') return 'Retângulo'
  if (el.tipo === 'linha') return 'Linha'
  return 'Imagem'
}

export const IngressoCanvasEditor: React.FC<Props> = ({
  layout,
  onChange,
  largura,
  altura,
  unidade,
  fundoUrl,
}) => {
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: string
    mode: DragMode
    startX: number
    startY: number
    orig: { x: number; y: number; w: number; h: number }
  } | null>(null)

  const { w: baseW, h: baseH } = dimensoesPreviewPx(largura, altura, unidade)
  const fitW = Math.min(baseW, 640)
  const fitScale = fitW / baseW
  const displayW = fitW * zoom
  const displayH = baseH * fitScale * zoom
  const fontScale = fitScale * zoom

  const selecionadoEl = useMemo(
    () => layout.elementos.find((e) => e.id === selecionado) ?? null,
    [layout.elementos, selecionado],
  )

  const atualizar = useCallback(
    (id: string, patch: Partial<ElementoIngresso>) => {
      onChange({
        ...layout,
        elementos: layout.elementos.map((el) =>
          el.id === id ? ({ ...el, ...patch } as ElementoIngresso) : el,
        ),
      })
    },
    [layout, onChange],
  )

  const adicionar = (el: ElementoIngresso) => {
    onChange({ ...layout, elementos: [...layout.elementos, el] })
    setSelecionado(el.id)
  }

  const adicionarTexto = () =>
    adicionar({
      id: novoIdElemento(),
      tipo: 'texto',
      x: 8,
      y: 12,
      w: 50,
      h: 14,
      texto: '{{espetaculo}}',
      fonteTamanho: 16,
      fontePeso: 'bold',
      alinhamento: 'left',
      cor: '#18181b',
    })

  const adicionarQr = () =>
    adicionar({
      id: novoIdElemento(),
      tipo: 'qrcode',
      x: 72,
      y: 28,
      w: 22,
      h: 40,
    })

  const adicionarRetangulo = () =>
    adicionar({
      id: novoIdElemento(),
      tipo: 'retangulo',
      x: 5,
      y: 5,
      w: 90,
      h: 18,
      preenchimento: 'transparent',
      bordaCor: '#4f46e5',
      bordaLargura: 2,
    })

  const remover = useCallback(
    (id?: string | null) => {
      const alvo = id ?? selecionado
      if (!alvo) return
      onChange({ ...layout, elementos: layout.elementos.filter((e) => e.id !== alvo) })
      if (selecionado === alvo) setSelecionado(null)
    },
    [layout, onChange, selecionado],
  )

  const duplicar = () => {
    if (!selecionadoEl) return
    const copia = {
      ...selecionadoEl,
      id: novoIdElemento(),
      x: clamp(selecionadoEl.x + 3, 0, 95),
      y: clamp(selecionadoEl.y + 3, 0, 95),
    } as ElementoIngresso
    adicionar(copia)
  }

  const trazerFrente = () => {
    if (!selecionado) return
    const resto = layout.elementos.filter((e) => e.id !== selecionado)
    const el = layout.elementos.find((e) => e.id === selecionado)
    if (!el) return
    onChange({ ...layout, elementos: [...resto, el] })
  }

  const enviarFundo = () => {
    if (!selecionado) return
    const resto = layout.elementos.filter((e) => e.id !== selecionado)
    const el = layout.elementos.find((e) => e.id === selecionado)
    if (!el) return
    onChange({ ...layout, elementos: [el, ...resto] })
  }

  const inserirPlaceholder = (token: string) => {
    if (selecionadoEl?.tipo !== 'texto') {
      adicionar({
        id: novoIdElemento(),
        tipo: 'texto',
        x: 10,
        y: 40,
        w: 40,
        h: 12,
        texto: token,
        fonteTamanho: 14,
        fontePeso: 'normal',
        alinhamento: 'left',
        cor: '#18181b',
      })
      return
    }
    atualizar(selecionadoEl.id, { texto: `${selecionadoEl.texto}${token}` })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selecionado) {
        e.preventDefault()
        remover(selecionado)
      }
      if ((e.key === 'd' || e.key === 'D') && (e.metaKey || e.ctrlKey) && selecionado) {
        e.preventDefault()
        duplicar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecionado, layout])

  const startDrag = (e: React.PointerEvent, id: string, mode: DragMode) => {
    e.stopPropagation()
    e.preventDefault()
    const el = layout.elementos.find((x) => x.id === id)
    if (!el || !canvasRef.current) return
    setSelecionado(id)
    dragRef.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      orig: { x: el.x, y: el.y, w: el.w, h: el.h },
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100
    const { id, mode, orig } = dragRef.current

    if (mode === 'move') {
      atualizar(id, {
        x: clamp(orig.x + dx, 0, 100 - orig.w),
        y: clamp(orig.y + dy, 0, 100 - orig.h),
      })
      return
    }
    if (mode === 'e') {
      atualizar(id, { w: clamp(orig.w + dx, 4, 100 - orig.x) })
      return
    }
    if (mode === 's') {
      atualizar(id, { h: clamp(orig.h + dy, 4, 100 - orig.y) })
      return
    }
    // se
    atualizar(id, {
      w: clamp(orig.w + dx, 4, 100 - orig.x),
      h: clamp(orig.h + dy, 4, 100 - orig.y),
    })
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  const handleClass =
    'absolute z-20 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 shadow'

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4 min-w-0">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-2">
          <Button type="button" size="sm" variant="outline" onClick={adicionarTexto} className="h-8 rounded-full text-xs font-bold">
            <Type className="mr-1 h-3.5 w-3.5" />
            Texto
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={adicionarQr} className="h-8 rounded-full text-xs font-bold">
            <QrCode className="mr-1 h-3.5 w-3.5" />
            QR
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={adicionarRetangulo} className="h-8 rounded-full text-xs font-bold">
            <Square className="mr-1 h-3.5 w-3.5" />
            Forma
          </Button>
          <div className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />
          <Button type="button" size="sm" variant="ghost" disabled={!selecionado} onClick={duplicar} className="h-8 rounded-full px-2" title="Duplicar (Ctrl+D)">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={!selecionado} onClick={trazerFrente} className="h-8 rounded-full px-2" title="Trazer para frente">
            <BringToFront className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={!selecionado} onClick={enviarFundo} className="h-8 rounded-full px-2" title="Enviar para trás">
            <SendToBack className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={!selecionado} onClick={() => remover()} className="h-8 rounded-full px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700" title="Excluir (Del)">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => setZoom((z) => clamp(z - 0.1, 0.6, 1.6))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center text-[11px] font-bold text-zinc-500">{Math.round(zoom * 100)}%</span>
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => setZoom((z) => clamp(z + 0.1, 0.6, 1.6))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-zinc-200 bg-zinc-100/80 p-4">
          <div
            ref={canvasRef}
            className="relative mx-auto touch-none overflow-hidden bg-white shadow-md"
            style={{
              width: displayW,
              height: displayH,
              backgroundImage: fundoUrl ? `url(${fundoUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onClick={() => setSelecionado(null)}
          >
            {!fundoUrl && (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(228_228_231_/_0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgb(228_228_231_/_0.45)_1px,transparent_1px)] bg-[size:10%_10%]" />
            )}

            {layout.elementos.map((el) => {
              const ativo = selecionado === el.id
              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => startDrag(e, el.id, 'move')}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute select-none ${ativo ? 'z-10' : 'z-[1]'}`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.w}%`,
                    height: `${el.h}%`,
                    cursor: 'move',
                    outline: ativo ? '2px solid rgb(79 70 229)' : undefined,
                    outlineOffset: 1,
                  }}
                >
                  {el.tipo === 'texto' && (
                    <div
                      className="h-full w-full overflow-hidden whitespace-pre-wrap leading-tight"
                      style={{
                        color: el.cor,
                        fontWeight: el.fontePeso === 'bold' || el.fontePeso === 'extrabold' ? 700 : 400,
                        textAlign: el.alinhamento,
                        fontSize: Math.max(8, el.fonteTamanho * fontScale * 0.55),
                      }}
                    >
                      {el.texto || 'Texto'}
                    </div>
                  )}
                  {el.tipo === 'qrcode' && (
                    <div className="flex h-full w-full items-center justify-center border border-dashed border-indigo-300 bg-indigo-50/80">
                      <QrCode className="h-1/2 w-1/2 max-h-16 text-indigo-500" />
                    </div>
                  )}
                  {el.tipo === 'retangulo' && (
                    <div
                      className="h-full w-full"
                      style={{
                        background: el.preenchimento,
                        border: `${el.bordaLargura}px solid ${el.bordaCor}`,
                      }}
                    />
                  )}
                  {el.tipo === 'imagem' && el.url && (
                    <img src={el.url} alt="" className="h-full w-full object-contain" />
                  )}

                  {ativo && (
                    <>
                      <div
                        className={`${handleClass} -right-1.5 top-1/2 -translate-y-1/2 cursor-e-resize`}
                        onPointerDown={(e) => startDrag(e, el.id, 'e')}
                      />
                      <div
                        className={`${handleClass} -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize`}
                        onPointerDown={(e) => startDrag(e, el.id, 's')}
                      />
                      <div
                        className={`${handleClass} -bottom-1.5 -right-1.5 cursor-se-resize`}
                        onPointerDown={(e) => startDrag(e, el.id, 'se')}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-center text-[11px] text-zinc-400">
            {largura} × {altura} {unidade} · arraste para mover · handles para redimensionar · Del exclui
          </p>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inserir campo</p>
          <div className="flex flex-wrap gap-1.5">
            {PLACEHOLDERS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => inserirPlaceholder(p.value)}
                className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                title={p.value}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-indigo-600">Camadas</p>
          {layout.elementos.length === 0 ? (
            <p className="text-xs text-zinc-400">Nenhum elemento. Adicione texto ou QR.</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {[...layout.elementos].reverse().map((el) => (
                <li key={el.id}>
                  <button
                    type="button"
                    onClick={() => setSelecionado(el.id)}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                      selecionado === el.id
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {el.tipo === 'qrcode' ? <QrCode className="h-3.5 w-3.5 shrink-0" /> : <Type className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{rotuloElemento(el)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
          {!selecionadoEl ? (
            <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
              <MousePointer2 className="h-5 w-5 text-zinc-300" />
              <p className="text-xs font-medium text-zinc-500">Selecione um elemento</p>
              <p className="text-[11px] text-zinc-400">
                Clique no canvas ou na lista de camadas para editar propriedades.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                {selecionadoEl.tipo === 'texto'
                  ? 'Texto'
                  : selecionadoEl.tipo === 'qrcode'
                    ? 'QR Code'
                    : selecionadoEl.tipo === 'retangulo'
                      ? 'Retângulo'
                      : 'Elemento'}
              </p>

              {selecionadoEl.tipo === 'texto' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-600">Conteúdo</Label>
                    <textarea
                      rows={4}
                      value={selecionadoEl.texto}
                      onChange={(e) => atualizar(selecionadoEl.id, { texto: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-600">Tamanho</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-zinc-200 px-2 text-sm"
                        value={selecionadoEl.fonteTamanho}
                        onChange={(e) =>
                          atualizar(selecionadoEl.id, { fonteTamanho: Number(e.target.value) })
                        }
                      >
                        {!TAMANHOS.includes(selecionadoEl.fonteTamanho) && (
                          <option value={selecionadoEl.fonteTamanho}>{selecionadoEl.fonteTamanho}</option>
                        )}
                        {TAMANHOS.map((t) => (
                          <option key={t} value={t}>
                            {t}px
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-600">Peso</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-zinc-200 px-2 text-sm"
                        value={selecionadoEl.fontePeso}
                        onChange={(e) => atualizar(selecionadoEl.id, { fontePeso: e.target.value })}
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Negrito</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-600">Alinhamento</Label>
                    <div className="flex gap-1">
                      {(
                        [
                          ['left', AlignLeft],
                          ['center', AlignCenter],
                          ['right', AlignRight],
                        ] as const
                      ).map(([value, Icon]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            atualizar(selecionadoEl.id, {
                              alinhamento: value,
                            } as Partial<ElementoTextoIngresso>)
                          }
                          className={`flex h-9 flex-1 items-center justify-center rounded-lg border transition ${
                            selecionadoEl.alinhamento === value
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                              : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-600">Cor</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selecionadoEl.cor}
                        onChange={(e) => atualizar(selecionadoEl.id, { cor: e.target.value })}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1"
                      />
                      <Input
                        value={selecionadoEl.cor}
                        onChange={(e) => atualizar(selecionadoEl.id, { cor: e.target.value })}
                        className="h-9 rounded-lg font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </>
              )}

              {selecionadoEl.tipo === 'retangulo' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-600">Preenchimento</Label>
                    <input
                      type="color"
                      value={selecionadoEl.preenchimento === 'transparent' ? '#ffffff' : selecionadoEl.preenchimento}
                      onChange={(e) => atualizar(selecionadoEl.id, { preenchimento: e.target.value })}
                      className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200 p-1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-600">Borda</Label>
                    <input
                      type="color"
                      value={selecionadoEl.bordaCor}
                      onChange={(e) => atualizar(selecionadoEl.id, { bordaCor: e.target.value })}
                      className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200 p-1"
                    />
                  </div>
                </div>
              )}

              {selecionadoEl.tipo === 'qrcode' && (
                <p className="rounded-xl bg-indigo-50 px-3 py-2 text-[11px] leading-relaxed text-indigo-700">
                  O QR é gerado automaticamente em cada ingresso com o código único de identificação.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3">
                {(
                  [
                    ['x', 'X %'],
                    ['y', 'Y %'],
                    ['w', 'Larg. %'],
                    ['h', 'Alt. %'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">{label}</Label>
                    <Input
                      type="number"
                      step={0.5}
                      value={Number(selecionadoEl[key].toFixed(1))}
                      onChange={(e) =>
                        atualizar(selecionadoEl.id, {
                          [key]: clamp(Number(e.target.value), 0, 100),
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
