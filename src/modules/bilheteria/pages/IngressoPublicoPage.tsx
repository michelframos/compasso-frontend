import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { Loader2, Printer, Ticket } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { obterIngressoPublico } from '../api/ingressos'
import type { IngressoPublico } from '../types'
import { formatMoney } from '../components/ui'

function pxParaMm(px: number) {
  return Math.round(((px * 25.4) / 96) * 100) / 100
}

function IngressoFallback({ ingresso }: { ingresso: IngressoPublico }) {
  const meta = [ingresso.espetaculo?.data_evento, ingresso.espetaculo?.hora_evento]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <div className="flex min-w-0 flex-1 flex-col justify-between border-r border-dashed border-zinc-300 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {ingresso.escola ?? 'Ingresso'}
          </p>
          <h2 className="text-xl font-black leading-tight text-zinc-900 sm:text-2xl">
            {ingresso.espetaculo?.titulo ?? 'Ingresso'}
          </h2>
          {meta && <p className="text-sm font-medium text-zinc-600">{meta}</p>}
          {ingresso.espetaculo?.local && (
            <p className="text-xs leading-relaxed text-zinc-500">{ingresso.espetaculo.local}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Número</p>
            <p className="font-mono text-lg font-black text-zinc-900">Nº {ingresso.numero}</p>
            {ingresso.comprador_nome && (
              <p className="mt-1 text-xs text-zinc-500">Comprador: {ingresso.comprador_nome}</p>
            )}
          </div>
          {ingresso.valor != null && (
            <p className="text-sm font-bold text-emerald-700">{formatMoney(ingresso.valor)}</p>
          )}
        </div>
      </div>
      <div className="flex w-[38%] shrink-0 flex-col items-center justify-center gap-2 bg-zinc-50 px-4 py-5">
        <img
          src={ingresso.qr_data_uri}
          alt={`QR do ingresso ${ingresso.numero}`}
          className="h-28 w-28 rounded-lg border border-zinc-200 bg-white p-1.5 sm:h-32 sm:w-32"
        />
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Apresente na entrada
        </p>
      </div>
    </div>
  )
}

function IngressoCanvas({
  ingresso,
  style,
}: {
  ingresso: IngressoPublico
  style?: React.CSSProperties
}) {
  const { largura_px: w, altura_px: h, fundo_url: fundoUrl, html } = ingresso.layout
  const base: React.CSSProperties = {
    width: w,
    height: h,
    backgroundImage: fundoUrl ? `url(${fundoUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#fff',
    ...style,
  }

  if (html) {
    return <div className="relative" style={base} dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="relative" style={base}>
      <IngressoFallback ingresso={ingresso} />
    </div>
  )
}

function IngressoLayoutVisual({ ingresso }: { ingresso: IngressoPublico }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [larguraDisponivel, setLarguraDisponivel] = useState(0)
  const { largura_px: w, altura_px: h } = ingresso.layout
  const larguraMm = pxParaMm(w)
  const alturaMm = pxParaMm(h)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const atualizar = () => setLarguraDisponivel(el.clientWidth)
    atualizar()

    const observer = new ResizeObserver(atualizar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const escala = larguraDisponivel > 0 ? Math.min(1, larguraDisponivel / w) : 1

  return (
    <>
      <div ref={wrapRef} className="no-print mx-auto w-full" style={{ maxWidth: w }}>
        <div
          className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          style={{ width: w * escala, height: h * escala }}
        >
          <IngressoCanvas
            ingresso={ingresso}
            style={{ transform: `scale(${escala})`, transformOrigin: 'top left' }}
          />
        </div>
      </div>

      {createPortal(
        <div className="print-only" aria-hidden="true">
          <div
            className="ingresso-folha"
            style={{
              width: `${larguraMm}mm`,
              height: `${alturaMm}mm`,
            }}
          >
            <div className="ingresso-clip">
              <IngressoCanvas ingresso={ingresso} />
            </div>
          </div>

          <style>{`
            .print-only { display: none !important; }

            @media print {
              @page {
                size: ${larguraMm}mm ${alturaMm}mm;
                margin: 0 !important;
              }

              html, body {
                width: ${larguraMm}mm !important;
                height: ${alturaMm}mm !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              /* visibility:hidden ainda ocupa espaço e gera 2ª página — esconde de verdade */
              body > *:not(.print-only) {
                display: none !important;
              }

              .print-only {
                display: block !important;
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: ${larguraMm}mm !important;
                height: ${alturaMm}mm !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #fff !important;
                z-index: 99999 !important;
              }

              .ingresso-folha {
                box-sizing: border-box !important;
                width: ${larguraMm}mm !important;
                height: ${alturaMm}mm !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                border: 0.3mm solid #18181b !important;
                background: #fff !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              .ingresso-clip {
                position: relative !important;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
              }

              /* Canvas em absolute: transform/tamanho em px não empurra 2ª página */
              .ingresso-clip > div {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: ${w}px !important;
                height: ${h}px !important;
                transform: scale(${larguraMm / ((w * 25.4) / 96)}) !important;
                transform-origin: top left !important;
              }

              .ingresso-clip img {
                max-width: 100% !important;
                max-height: 100% !important;
              }
            }
          `}</style>
        </div>,
        document.body,
      )}
    </>
  )
}

export const IngressoPublicoPage: React.FC = () => {
  const { codigo } = useParams()
  const [ingresso, setIngresso] = useState<IngressoPublico | null>(null)
  const [erro, setErro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!codigo) return
    let ativo = true
    setLoading(true)
    setErro(false)

    obterIngressoPublico(codigo)
      .then((dados) => {
        if (!ativo) return
        setIngresso(dados)
      })
      .catch(() => {
        if (ativo) setErro(true)
      })
      .finally(() => {
        if (ativo) setLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [codigo])

  const meta = useMemo(() => {
    if (!ingresso?.espetaculo) return null
    return [ingresso.espetaculo.data_evento, ingresso.espetaculo.hora_evento, ingresso.espetaculo.local]
      .filter(Boolean)
      .join(' · ')
  }, [ingresso])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (erro || !ingresso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Ticket className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Ingresso não encontrado</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Este link é inválido ou o ingresso ainda não foi vendido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="no-print rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            {ingresso.escola ?? 'Ingresso'}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">
            {ingresso.espetaculo?.titulo ?? 'Ingresso'}
          </h1>
          {meta && <p className="mt-1 text-sm text-zinc-500">{meta}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
              Nº {ingresso.numero}
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600">
              {ingresso.status_rotulo}
            </span>
            {ingresso.valor != null && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                {formatMoney(ingresso.valor)}
              </span>
            )}
          </div>
          {ingresso.comprador_nome && (
            <p className="mt-3 text-sm text-zinc-600">Comprador: {ingresso.comprador_nome}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="h-9 rounded-full border-zinc-200 px-4 text-xs font-bold"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Imprimir / salvar PDF
            </Button>
            <p className="text-[11px] text-zinc-400">
              Em Margens, escolha <strong>Nenhum</strong> e desmarque cabeçalhos/rodapés.
            </p>
          </div>
        </div>

        <IngressoLayoutVisual ingresso={ingresso} />
      </div>
    </div>
  )
}

export default IngressoPublicoPage
