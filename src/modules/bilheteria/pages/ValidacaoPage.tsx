import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Keyboard,
  Loader2,
  ScanLine,
  Ticket,
  XCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getErrorMessage } from '@/shared/lib/utils'
import { utilizarIngresso, validarIngresso } from '../api/ingressos'
import type { Ingresso } from '../types'
import { StatusBadge } from '../components/ui'

type Resultado = {
  ok: boolean
  motivo?: string | null
  message?: string
  ingresso?: Ingresso | null
  acao: 'validar' | 'utilizar'
}

function feedbackTactil(ok: boolean) {
  try {
    navigator.vibrate?.(ok ? [35] : [70, 40, 70])
  } catch {
    // ignore
  }
}

function ResultadoBanner({
  resultado,
  onClose,
}: {
  resultado: Resultado
  onClose: () => void
}) {
  return (
    <div
      role="status"
      className={`rounded-3xl border p-4 shadow-xl backdrop-blur-md sm:p-5 ${
        resultado.ok
          ? 'border-emerald-200/80 bg-emerald-50/95'
          : 'border-rose-200/80 bg-rose-50/95'
      }`}
    >
      <div className="flex items-start gap-3">
        {resultado.ok ? (
          <CheckCircle2 className="mt-0.5 h-9 w-9 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-9 w-9 shrink-0 text-rose-600" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={`text-lg font-black leading-tight sm:text-xl ${
              resultado.ok ? 'text-emerald-950' : 'text-rose-950'
            }`}
          >
            {resultado.ok
              ? resultado.acao === 'utilizar'
                ? 'Entrada liberada'
                : 'Ingresso válido'
              : 'Entrada bloqueada'}
          </p>
          <p
            className={`mt-1 text-sm font-medium ${
              resultado.ok ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            {resultado.ok
              ? resultado.message ||
                (resultado.ingresso ? `Nº ${resultado.ingresso.numero}` : 'Tudo certo.')
              : resultado.motivo || 'Não foi possível validar.'}
          </p>
          {resultado.ingresso ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 font-mono text-xs font-bold text-zinc-800">
                Nº {resultado.ingresso.numero}
              </span>
              <StatusBadge value={resultado.ingresso.status_rotulo || resultado.ingresso.status} />
              {resultado.ingresso.espetaculo?.titulo ? (
                <span className="truncate text-xs font-medium text-zinc-600">
                  {resultado.ingresso.espetaculo.titulo}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-1 text-xs font-bold text-zinc-500 hover:bg-white/70"
          aria-label="Fechar resultado"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

export const ValidacaoPage: React.FC = () => {
  const [numero, setNumero] = useState('')
  const [codigoQr, setCodigoQr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [cameraErro, setCameraErro] = useState<string | null>(null)
  const [autoUtilizar, setAutoUtilizar] = useState(true)
  const [manualAberto, setManualAberto] = useState(false)
  const [entradasSessao, setEntradasSessao] = useState(0)
  const [recusasSessao, setRecusasSessao] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastScanRef = useRef<string>('')
  const autoUtilizarRef = useRef(autoUtilizar)
  const loadingRef = useRef(loading)
  const executarRef = useRef<(
    acao: 'validar' | 'utilizar',
    override?: { numero?: string; codigo_qr?: string },
  ) => Promise<void>>(async () => undefined)
  const numeroInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    autoUtilizarRef.current = autoUtilizar
  }, [autoUtilizar])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  const executar = useCallback(
    async (
      acao: 'validar' | 'utilizar',
      override?: { numero?: string; codigo_qr?: string },
    ) => {
      const payload = {
        numero: (override?.numero ?? numero).trim() || undefined,
        codigo_qr: (override?.codigo_qr ?? codigoQr).trim() || undefined,
      }
      if (!payload.numero && !payload.codigo_qr) {
        setResultado({
          ok: false,
          motivo: 'Informe o número do ingresso ou escaneie o QR.',
          acao,
        })
        feedbackTactil(false)
        return
      }

      setLoading(true)
      setResultado(null)
      try {
        const res =
          acao === 'validar'
            ? await validarIngresso(payload)
            : await utilizarIngresso(payload)

        const novo: Resultado = {
          ok: res.ok,
          motivo: res.motivo,
          message: 'message' in res ? res.message : undefined,
          ingresso: res.data,
          acao,
        }
        setResultado(novo)
        feedbackTactil(res.ok)

        if (res.ok) {
          if (acao === 'utilizar') {
            setEntradasSessao((n) => n + 1)
            setNumero('')
            setCodigoQr('')
          }
          window.setTimeout(() => {
            lastScanRef.current = ''
          }, 2200)
          window.setTimeout(() => {
            setResultado((atual) => (atual === novo ? null : atual))
          }, 2800)
        } else {
          setRecusasSessao((n) => n + 1)
          window.setTimeout(() => {
            lastScanRef.current = ''
          }, 1400)
        }
      } catch (err: unknown) {
        const axiosData = (
          err as {
            response?: {
              data?: Resultado & { data?: Ingresso | null; message?: string }
            }
          }
        )?.response?.data

        const novo: Resultado = axiosData && typeof axiosData.ok === 'boolean'
          ? {
              ok: axiosData.ok,
              motivo: axiosData.motivo ?? axiosData.message,
              ingresso: axiosData.data ?? null,
              acao,
            }
          : {
              ok: false,
              motivo: getErrorMessage(err, 'Falha na operação.'),
              acao,
            }

        setResultado(novo)
        feedbackTactil(false)
        setRecusasSessao((n) => n + 1)
        window.setTimeout(() => {
          lastScanRef.current = ''
        }, 1400)
      } finally {
        setLoading(false)
      }
    },
    [codigoQr, numero],
  )

  useEffect(() => {
    executarRef.current = executar
  }, [executar])

  useEffect(() => {
    if (!cameraAtiva) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      return
    }

    let cancelled = false
    let timer: number | undefined

    const iniciar = async () => {
      setCameraErro(null)
      if (!('BarcodeDetector' in window)) {
        setCameraErro('Este navegador não lê QR pela câmera. Use o número do ingresso.')
        setManualAberto(true)
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        // @ts-expect-error BarcodeDetector experimental
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        timer = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || loadingRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            const raw = codes[0]?.rawValue as string | undefined
            if (!raw || raw === lastScanRef.current) return
            lastScanRef.current = raw
            setCodigoQr(raw)
            setNumero('')
            void executarRef.current(autoUtilizarRef.current ? 'utilizar' : 'validar', {
              codigo_qr: raw,
            })
          } catch {
            // frame sem código
          }
        }, 550)
      } catch {
        setCameraErro('Sem acesso à câmera. Libere a permissão ou digite o número.')
        setManualAberto(true)
      }
    }

    void iniciar()

    return () => {
      cancelled = true
      if (timer) window.clearInterval(timer)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [cameraAtiva])

  const abrirManual = () => {
    setManualAberto(true)
    window.setTimeout(() => numeroInputRef.current?.focus(), 80)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-lg flex-col gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-2xl">
      {/* Cabeçalho compacto */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Validação de <span className="text-indigo-600">Ingressos</span>
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">Aponte a câmera para o QR na entrada</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="rounded-2xl bg-emerald-50 px-2.5 py-1.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Ok</p>
            <p className="text-base font-black tabular-nums text-emerald-800">{entradasSessao}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-2.5 py-1.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500">Recusas</p>
            <p className="text-base font-black tabular-nums text-rose-700">{recusasSessao}</p>
          </div>
        </div>
      </div>

      {/* Modo de scan */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1">
        <button
          type="button"
          onClick={() => setAutoUtilizar(true)}
          className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
            autoUtilizar
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Registrar entrada
        </button>
        <button
          type="button"
          onClick={() => setAutoUtilizar(false)}
          className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
            !autoUtilizar
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Só consultar
        </button>
      </div>

      {/* Câmera — protagonista no mobile */}
      <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-950 shadow-lg shadow-zinc-200/60">
        <div className="relative aspect-[3/4] max-h-[min(62dvh,560px)] w-full sm:aspect-video sm:max-h-none">
          {cameraAtiva ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-white">
                <ScanLine className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Pronto para escanear</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Use a câmera traseira ou digite o número do ingresso
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setCameraAtiva(true)}
                className="h-12 rounded-full bg-indigo-600 px-6 text-sm font-bold hover:bg-indigo-700"
              >
                <Camera className="mr-2 h-5 w-5" />
                Abrir câmera
              </Button>
            </div>
          )}

          {cameraAtiva && !cameraErro && (
            <>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-[42%] w-[68%] max-w-[260px] rounded-3xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.35)] sm:h-40 sm:w-40">
                  <span className="absolute -left-0.5 -top-0.5 h-5 w-5 rounded-tl-2xl border-l-[3px] border-t-[3px] border-indigo-400" />
                  <span className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-tr-2xl border-r-[3px] border-t-[3px] border-indigo-400" />
                  <span className="absolute -bottom-0.5 -left-0.5 h-5 w-5 rounded-bl-2xl border-b-[3px] border-l-[3px] border-indigo-400" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-br-2xl border-b-[3px] border-r-[3px] border-indigo-400" />
                </div>
              </div>
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
                <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
                  {autoUtilizar ? 'Modo entrada' : 'Modo consulta'}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCameraAtiva(false)}
                  className="h-9 rounded-full bg-white/90 px-3 text-xs font-bold text-zinc-800 hover:bg-white"
                >
                  Fechar câmera
                </Button>
              </div>
              {loading && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando…
                  </span>
                </div>
              )}
            </>
          )}

          {cameraErro && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 px-6 text-center">
              <XCircle className="h-8 w-8 text-rose-400" />
              <p className="text-sm font-medium text-zinc-100">{cameraErro}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCameraAtiva(false)
                  setCameraErro(null)
                  abrirManual()
                }}
                className="h-10 rounded-full border-zinc-600 bg-transparent text-xs font-bold text-white hover:bg-white/10"
              >
                Digitar número
              </Button>
            </div>
          )}

          {resultado && cameraAtiva && (
            <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
              <ResultadoBanner resultado={resultado} onClose={() => setResultado(null)} />
            </div>
          )}
        </div>
      </div>

      {resultado && !cameraAtiva && (
        <ResultadoBanner resultado={resultado} onClose={() => setResultado(null)} />
      )}

      {/* Entrada manual — secundária, grande para o polegar */}
      <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => (manualAberto ? setManualAberto(false) : abrirManual())}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-800">
            <Keyboard className="h-4 w-4 text-indigo-600" />
            Digitar número do ingresso
          </span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 transition ${manualAberto ? 'rotate-180' : ''}`}
          />
        </button>

        {manualAberto && (
          <div className="space-y-3 border-t border-zinc-100 px-4 pb-4 pt-3">
            <Input
              ref={numeroInputRef}
              id="numero"
              inputMode="numeric"
              autoComplete="off"
              value={numero}
              onChange={(e) => {
                setNumero(e.target.value)
                if (e.target.value) setCodigoQr('')
              }}
              placeholder="Ex.: 42"
              className="h-14 rounded-2xl border-zinc-200 bg-zinc-50 text-center text-2xl font-black tracking-wide focus-visible:bg-white focus-visible:ring-indigo-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void executar(autoUtilizar ? 'utilizar' : 'validar')
              }}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                disabled={loading}
                onClick={() => void executar('utilizar')}
                className="h-12 rounded-full bg-indigo-600 text-sm font-bold hover:bg-indigo-700"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ticket className="mr-2 h-4 w-4" />
                )}
                Registrar entrada
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => void executar('validar')}
                className="h-12 rounded-full border-zinc-200 text-sm font-bold"
              >
                Só verificar
              </Button>
            </div>
            <p className="text-center text-[11px] text-zinc-400">
              Dica: leitores USB de QR funcionam colando o código neste campo e pressionando Enter.
            </p>
            <Input
              id="qr"
              value={codigoQr}
              onChange={(e) => {
                setCodigoQr(e.target.value)
                if (e.target.value) setNumero('')
              }}
              placeholder="Ou cole o código QR aqui"
              className="h-11 rounded-xl font-mono text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void executar(autoUtilizar ? 'utilizar' : 'validar')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidacaoPage
