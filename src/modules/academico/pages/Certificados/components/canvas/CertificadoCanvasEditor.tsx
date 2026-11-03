import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  BringToFront,
  Copy,
  ImagePlus,
  Loader2,
  Minus,
  SendToBack,
  Square,
  Trash2,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { urlArquivoPublico } from '@/shared/lib/storageUrl'
import { getErrorMessage } from '@/shared/lib/utils'
import { enviarElementoTemplateCertificado } from '../../../../api/templatesCertificados'
import { PainelPropriedades } from './PainelPropriedades'
import {
  clamp,
  cssFonteFamilia,
  cssFontePeso,
  GOOGLE_FONTS_PREVIEW_HREF,
  novoId,
  type ElementoImagem,
  type ElementoLayout,
  type LayoutCertificado,
} from '../../../../types/layoutCertificado'

const PLACEHOLDER_GROUPS = [
  {
    label: 'Aluno',
    placeholders: [
      { label: 'Nome Completo', value: '{{nome_aluno}}' },
      { label: 'CPF', value: '{{cpf_aluno}}' },
      { label: 'E-mail', value: '{{email_aluno}}' },
      { label: 'Telefone', value: '{{telefone_aluno}}' },
      { label: 'Data de Nascimento', value: '{{data_nascimento_aluno}}' },
      { label: 'Endereço', value: '{{endereco_aluno}}' },
      { label: 'Nome do Responsável', value: '{{nome_responsavel}}' },
      { label: 'CPF do Responsável', value: '{{cpf_responsavel}}' },
    ],
  },
  {
    label: 'Curso / Turma',
    placeholders: [
      { label: 'Nome do Curso', value: '{{nome_curso}}' },
      { label: 'Nome do Nível', value: '{{nome_nivel}}' },
      { label: 'Nome da Turma', value: '{{nome_turma}}' },
      { label: 'Descrição da Turma', value: '{{descricao_turma}}' },
      { label: 'Horários', value: '{{horarios_turma}}' },
      { label: 'Professor(a)', value: '{{nome_professor}}' },
      { label: 'Data da Matrícula', value: '{{data_matricula}}' },
    ],
  },
  {
    label: 'Escola / Documento',
    placeholders: [
      { label: 'Nome da Escola', value: '{{nome_escola}}' },
      { label: 'Carga Horária', value: '{{carga_horaria}}' },
      { label: 'Data de Emissão', value: '{{data_emissao}}' },
      { label: 'Código de Verificação', value: '{{codigo_verificacao}}' },
    ],
  },
]

type Handle = 'se' | 'move'

interface CertificadoCanvasEditorProps {
  layout: LayoutCertificado
  onChange: (layout: LayoutCertificado) => void
  fundoUrl?: string | null
  templateId?: number | null
  sideSlot?: React.ReactNode
}

export const CertificadoCanvasEditor: React.FC<CertificadoCanvasEditorProps> = ({
  layout,
  onChange,
  fundoUrl,
  templateId,
  sideSlot,
}) => {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [editandoTextoId, setEditandoTextoId] = useState<string | null>(null)
  const [selectKey, setSelectKey] = useState(0)
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)
  const textoEditRef = useRef<HTMLTextAreaElement>(null)
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const dragRef = useRef<{
    id: string
    handle: Handle
    startX: number
    startY: number
    orig: ElementoLayout
  } | null>(null)
  const inputImagemRef = useRef<HTMLInputElement>(null)

  const selecionado = layout.elementos.find((e) => e.id === selecionadoId) ?? null

  useEffect(() => {
    const id = 'certificado-google-fonts-preview'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = GOOGLE_FONTS_PREVIEW_HREF
    document.head.appendChild(link)
  }, [])

  const atualizarElemento = useCallback(
    (id: string, patch: Partial<ElementoLayout>) => {
      const atual = layoutRef.current
      onChange({
        ...atual,
        elementos: atual.elementos.map((el) => (el.id === id ? ({ ...el, ...patch } as ElementoLayout) : el)),
      })
    },
    [onChange],
  )

  const setElementos = useCallback(
    (elementos: ElementoLayout[]) => onChange({ ...layoutRef.current, elementos }),
    [onChange],
  )

  const adicionar = (elemento: ElementoLayout) => {
    setElementos([...layoutRef.current.elementos, elemento])
    setSelecionadoId(elemento.id)
  }

  const adicionarTexto = (texto = 'Novo texto') => {
    adicionar({
      id: novoId(),
      tipo: 'texto',
      x: 15,
      y: 40,
      w: 70,
      h: 12,
      texto,
      fonteFamilia: 'sans',
      fonteTamanho: 20,
      fontePeso: 'normal',
      alinhamento: 'center',
      cor: '#18181b',
    })
  }

  const adicionarRetangulo = () => {
    adicionar({
      id: novoId(),
      tipo: 'retangulo',
      x: 10,
      y: 70,
      w: 80,
      h: 4,
      preenchimento: 'transparent',
      bordaCor: '#312e81',
      bordaLargura: 2,
    })
  }

  const adicionarLinha = () => {
    adicionar({
      id: novoId(),
      tipo: 'linha',
      x: 20,
      y: 80,
      w: 60,
      h: 0,
      bordaCor: '#71717a',
      bordaLargura: 1,
    })
  }

  const handleImagemEscolhida = async (file: File | null) => {
    if (!file) return
    if (!templateId) {
      toast.error('Salve o template primeiro e abra a edição para adicionar imagens.')
      return
    }

    const previewLocal = URL.createObjectURL(file)
    setEnviandoImagem(true)

    try {
      const enviado = await enviarElementoTemplateCertificado(templateId, file)
      const el: ElementoImagem = {
        id: novoId(),
        tipo: 'imagem',
        x: 5,
        y: 5,
        w: 15,
        h: 18,
        src: enviado.src,
        url: previewLocal || urlArquivoPublico(enviado.url) || urlArquivoPublico(enviado.src),
      }
      adicionar(el)
    } catch (erro) {
      URL.revokeObjectURL(previewLocal)
      toast.error(getErrorMessage(erro, 'Não foi possível enviar a imagem.'))
    } finally {
      setEnviandoImagem(false)
    }
  }

  const removerSelecionado = useCallback(() => {
    const id = selecionadoId
    if (!id) return
    setElementos(layoutRef.current.elementos.filter((e) => e.id !== id))
    setSelecionadoId(null)
    setEditandoTextoId(null)
  }, [selecionadoId, setElementos])

  const duplicarSelecionado = () => {
    if (!selecionado) return
    const copia = {
      ...selecionado,
      id: novoId(),
      x: clamp(selecionado.x + 3, 0, 95),
      y: clamp(selecionado.y + 3, 0, 95),
    } as ElementoLayout
    adicionar(copia)
  }

  const trazerFrente = () => {
    if (!selecionadoId) return
    const sem = layoutRef.current.elementos.filter((e) => e.id !== selecionadoId)
    const el = layoutRef.current.elementos.find((e) => e.id === selecionadoId)
    if (!el) return
    setElementos([...sem, el])
  }

  const enviarTras = () => {
    if (!selecionadoId) return
    const sem = layoutRef.current.elementos.filter((e) => e.id !== selecionadoId)
    const el = layoutRef.current.elementos.find((e) => e.id === selecionadoId)
    if (!el) return
    setElementos([el, ...sem])
  }

  const inserirPlaceholder = (token: string) => {
    if (selecionado?.tipo === 'texto') {
      atualizarElemento(selecionado.id, { texto: `${selecionado.texto}${token}` })
      return
    }
    adicionarTexto(token)
  }

  useEffect(() => {
    if (!editandoTextoId) return
    const timer = window.setTimeout(() => {
      const campo = textoEditRef.current
      if (!campo) return
      campo.focus()
      campo.select()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [editandoTextoId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editandoTextoId) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setEditandoTextoId(null)
        }
        return
      }
      if (!selecionadoId) return
      const alvo = e.target as HTMLElement | null
      if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable)) {
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removerSelecionado()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editandoTextoId, removerSelecionado, selecionadoId])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current
      const area = areaRef.current
      if (!drag || !area) return

      const rect = area.getBoundingClientRect()
      const dx = ((e.clientX - drag.startX) / rect.width) * 100
      const dy = ((e.clientY - drag.startY) / rect.height) * 100
      const orig = drag.orig

      if (drag.handle === 'move') {
        atualizarElemento(drag.id, {
          x: clamp(orig.x + dx, 0, 100 - Math.max(orig.w, 1)),
          y: clamp(orig.y + dy, 0, 100 - (orig.tipo === 'linha' ? 0 : Math.max(orig.h, 1))),
        })
        return
      }

      if (orig.tipo === 'linha') {
        atualizarElemento(drag.id, {
          w: clamp(orig.w + dx, 2, 100 - orig.x),
        })
        return
      }

      atualizarElemento(drag.id, {
        w: clamp(orig.w + dx, 2, 100 - orig.x),
        h: clamp(orig.h + dy, 2, 100 - orig.y),
      })
    }

    const onUp = () => {
      dragRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [atualizarElemento])

  const iniciarDrag = (e: React.PointerEvent, id: string, handle: Handle) => {
    if (editandoTextoId === id) return
    e.stopPropagation()
    e.preventDefault()
    const el = layoutRef.current.elementos.find((item) => item.id === id)
    if (!el) return
    if (editandoTextoId && editandoTextoId !== id) {
      setEditandoTextoId(null)
    }
    setSelecionadoId(id)
    dragRef.current = {
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...el },
    }
  }

  const iniciarEdicaoTexto = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = null
    setSelecionadoId(id)
    setEditandoTextoId(id)
  }

  const encerrarEdicaoTexto = () => {
    setEditandoTextoId(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
      <aside className="order-2 flex max-h-[40vh] w-full shrink-0 flex-col overflow-hidden lg:order-1 lg:max-h-none lg:h-full lg:min-h-0 lg:w-[280px] xl:w-[300px]">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
          {sideSlot}

          <div className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Marcações</p>
            <div className="space-y-2">
              {PLACEHOLDER_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-0.5 text-[10px] font-semibold text-zinc-400">{group.label}</p>
                  <Select
                    key={`${group.label}-${selectKey}`}
                    onValueChange={(value) => {
                      inserirPlaceholder(value)
                      setSelectKey((k) => k + 1)
                    }}
                  >
                    <SelectTrigger className="h-8 rounded-lg border-zinc-200 bg-zinc-50 text-xs">
                      <SelectValue placeholder="Inserir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {group.placeholders.map((ph) => (
                        <SelectItem key={ph.value} value={ph.value} className="text-xs">
                          {ph.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-400">
              Com um texto selecionado, a marcação entra nele. Sem seleção, cria uma nova caixa.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
            <PainelPropriedades
              elemento={selecionado}
              onChange={(patch) => {
                if (!selecionado) return
                atualizarElemento(selecionado.id, patch)
              }}
            />
          </div>
        </div>
      </aside>

      <div className="order-1 flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden lg:order-2">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-full border-zinc-200 bg-white px-3 text-xs font-bold gap-1.5"
            onClick={() => adicionarTexto()}
          >
            <Type className="h-3.5 w-3.5" />
            Texto
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-full border-zinc-200 bg-white px-3 text-xs font-bold gap-1.5"
            disabled={enviandoImagem}
            onClick={() => inputImagemRef.current?.click()}
          >
            {enviandoImagem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            Imagem
          </Button>
          <input
            ref={inputImagemRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              void handleImagemEscolhida(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-full border-zinc-200 bg-white px-3 text-xs font-bold gap-1.5"
            onClick={adicionarRetangulo}
          >
            <Square className="h-3.5 w-3.5" />
            Retângulo
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-full border-zinc-200 bg-white px-3 text-xs font-bold gap-1.5"
            onClick={adicionarLinha}
          >
            <Minus className="h-3.5 w-3.5" />
            Linha
          </Button>

          <div className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" />

          <div className="flex items-center gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={!selecionado} onClick={duplicarSelecionado} title="Duplicar">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={!selecionado} onClick={trazerFrente} title="Trazer para frente">
              <BringToFront className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={!selecionado} onClick={enviarTras} title="Enviar para trás">
              <SendToBack className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500" disabled={!selecionado} onClick={removerSelecionado} title="Excluir">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="ml-auto hidden text-[11px] text-zinc-400 xl:block">
            {layout.elementos.length} elemento{layout.elementos.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto rounded-2xl border border-zinc-200 bg-[radial-gradient(circle_at_1px_1px,#e4e4e7_1px,transparent_0)] [background-size:16px_16px] p-3 sm:p-4">
          <div
            ref={areaRef}
            className="relative mx-auto w-full max-w-[860px] aspect-[297/210] bg-white shadow-[0_12px_40px_rgba(24,24,27,0.12)] overflow-hidden select-none ring-1 ring-zinc-200/80"
            style={{
              backgroundImage: fundoUrl ? `url(${fundoUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onPointerDown={() => {
              setSelecionadoId(null)
              setEditandoTextoId(null)
            }}
          >
            {!fundoUrl && layout.elementos.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-zinc-400 shadow-sm">
                  Adicione texto, imagem ou formas para começar
                </p>
              </div>
            )}

            {layout.elementos.map((el) => {
              const ativo = el.id === selecionadoId
              const editando = el.tipo === 'texto' && editandoTextoId === el.id
              const baseStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                height: el.tipo === 'linha' ? 0 : `${el.h}%`,
                outline: ativo || editando ? '2px solid #4f46e5' : undefined,
                outlineOffset: 1,
                cursor: editando ? 'text' : 'move',
                boxSizing: 'border-box',
                zIndex: ativo || editando ? 20 : undefined,
              }

              return (
                <div
                  key={el.id}
                  style={baseStyle}
                  onPointerDown={(e) => iniciarDrag(e, el.id, 'move')}
                  onDoubleClick={(e) => {
                    if (el.tipo === 'texto') iniciarEdicaoTexto(e, el.id)
                  }}
                >
                  {el.tipo === 'texto' &&
                    (editando ? (
                      <textarea
                        ref={textoEditRef}
                        value={el.texto}
                        onChange={(e) =>
                          atualizarElemento(el.id, { texto: e.target.value } as Partial<ElementoLayout>)
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        onBlur={encerrarEdicaoTexto}
                        className="h-full w-full resize-none overflow-auto border-0 bg-white/90 p-0 outline-none"
                        style={{
                          fontFamily: cssFonteFamilia(el.fonteFamilia),
                          fontSize: el.fonteTamanho,
                          fontWeight: cssFontePeso(el.fontePeso),
                          textAlign: el.alinhamento,
                          color: el.cor,
                          lineHeight: 1.3,
                        }}
                      />
                    ) : el.texto.includes('<') && el.texto.includes('>') ? (
                      <div
                        className="h-full w-full overflow-hidden"
                        style={{
                          fontFamily: cssFonteFamilia(el.fonteFamilia),
                          fontSize: el.fonteTamanho,
                          fontWeight: cssFontePeso(el.fontePeso),
                          textAlign: el.alinhamento,
                          color: el.cor,
                          lineHeight: 1.3,
                        }}
                        dangerouslySetInnerHTML={{ __html: el.texto }}
                      />
                    ) : (
                      <div
                        className="h-full w-full overflow-hidden whitespace-pre-wrap"
                        style={{
                          fontFamily: cssFonteFamilia(el.fonteFamilia),
                          fontSize: el.fonteTamanho,
                          fontWeight: cssFontePeso(el.fontePeso),
                          textAlign: el.alinhamento,
                          color: el.cor,
                          lineHeight: 1.3,
                        }}
                      >
                        {el.texto}
                      </div>
                    ))}
                  {el.tipo === 'imagem' && (
                    <img
                      src={urlArquivoPublico(el.url) || urlArquivoPublico(el.src) || undefined}
                      alt=""
                      className="h-full w-full object-contain pointer-events-none bg-zinc-100/80"
                      draggable={false}
                    />
                  )}
                  {el.tipo === 'retangulo' && (
                    <div
                      className="h-full w-full"
                      style={{
                        background: el.preenchimento,
                        border: `${el.bordaLargura}px solid ${el.bordaCor}`,
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                  {el.tipo === 'linha' && (
                    <div
                      style={{
                        width: '100%',
                        borderTop: `${el.bordaLargura}px solid ${el.bordaCor}`,
                      }}
                    />
                  )}
                  {ativo && !editando && el.tipo !== 'linha' && (
                    <span
                      className="absolute bottom-0 right-0 h-3 w-3 translate-x-1/2 translate-y-1/2 rounded-sm bg-indigo-600 cursor-se-resize"
                      onPointerDown={(e) => iniciarDrag(e, el.id, 'se')}
                    />
                  )}
                  {ativo && !editando && el.tipo === 'linha' && (
                    <span
                      className="absolute right-0 top-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600 cursor-ew-resize"
                      onPointerDown={(e) => iniciarDrag(e, el.id, 'se')}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
