import React, { useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, Loader2, ScanLine, Ticket, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { utilizarIngresso, validarIngresso } from '../api/ingressos'
import type { Ingresso } from '../types'
import { PageHeader, StatusBadge } from '../components/ui'

type Resultado = {
  ok: boolean
  motivo?: string | null
  message?: string
  ingresso?: Ingresso | null
}

export const ValidacaoPage: React.FC = () => {
  const [numero, setNumero] = useState('')
  const [codigoQr, setCodigoQr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [cameraErro, setCameraErro] = useState<string | null>(null)
  const [autoUtilizar, setAutoUtilizar] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastScanRef = useRef<string>('')

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
        setCameraErro('Este navegador não lê QR pela câmera. Use o número ou cole o código.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
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
          if (!videoRef.current || videoRef.current.readyState < 2) return
          try {
            const codes = await detector.detect(videoRef.current)
            const raw = codes[0]?.rawValue as string | undefined
            if (!raw || raw === lastScanRef.current) return
            lastScanRef.current = raw
            setCodigoQr(raw)
            setNumero('')
            void executar(autoUtilizar ? 'utilizar' : 'validar', { codigo_qr: raw })
          } catch {
            // frame
          }
        }, 700)
      } catch {
        setCameraErro('Não foi possível acessar a câmera. Verifique as permissões.')
      }
    }

    void iniciar()

    return () => {
      cancelled = true
      if (timer) window.clearInterval(timer)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraAtiva, autoUtilizar])

  const executar = async (
    acao: 'validar' | 'utilizar',
    override?: { numero?: string; codigo_qr?: string },
  ) => {
    const payload = {
      numero: (override?.numero ?? numero).trim() || undefined,
      codigo_qr: (override?.codigo_qr ?? codigoQr).trim() || undefined,
    }
    if (!payload.numero && !payload.codigo_qr) {
      setResultado({ ok: false, motivo: 'Informe o número do ingresso ou o código QR.' })
      return
    }

    setLoading(true)
    setResultado(null)
    try {
      const res =
        acao === 'validar'
          ? await validarIngresso(payload)
          : await utilizarIngresso(payload)
      setResultado({
        ok: res.ok,
        motivo: res.motivo,
        message: 'message' in res ? res.message : undefined,
        ingresso: res.data,
      })
      if (res.ok && acao === 'utilizar') {
        setNumero('')
        setCodigoQr('')
        window.setTimeout(() => {
          lastScanRef.current = ''
        }, 2500)
      } else if (!res.ok) {
        window.setTimeout(() => {
          lastScanRef.current = ''
        }, 1500)
      }
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: Resultado & { data?: Ingresso | null; message?: string } } })
        ?.response?.data
      if (axiosData && typeof axiosData.ok === 'boolean') {
        setResultado({
          ok: axiosData.ok,
          motivo: axiosData.motivo ?? axiosData.message,
          ingresso: axiosData.data ?? null,
        })
      } else {
        setResultado({ ok: false, motivo: getErrorMessage(err, 'Falha na operação.') })
      }
      window.setTimeout(() => {
        lastScanRef.current = ''
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Validação de"
        highlight="Ingressos"
        description="Confira ou registre a entrada pelo número ou QR Code."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-900">Câmera</p>
                <p className="text-xs text-zinc-500">Escaneie o QR do ingresso</p>
              </div>
              <Button
                type="button"
                variant={cameraAtiva ? 'default' : 'outline'}
                onClick={() => setCameraAtiva((v) => !v)}
                className={`h-9 rounded-full px-4 text-xs font-bold ${
                  cameraAtiva ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                }`}
              >
                <Camera className="mr-1.5 h-4 w-4" />
                {cameraAtiva ? 'Desligar' : 'Ligar câmera'}
              </Button>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900">
              {cameraAtiva ? (
                <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-zinc-400">
                  <ScanLine className="h-8 w-8" />
                  Ligue a câmera para escanear, ou use o formulário ao lado.
                </div>
              )}
              {cameraErro && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/85 p-4 text-center text-sm text-zinc-200">
                  {cameraErro}
                </div>
              )}
              {cameraAtiva && !cameraErro && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-36 w-36 rounded-2xl border-2 border-white/70 shadow-[0_0_0_999px_rgba(0,0,0,0.25)]" />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={autoUtilizar}
                onChange={(e) => setAutoUtilizar(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
              />
              Ao escanear, registrar utilização automaticamente
            </label>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-bold text-zinc-900">Entrada manual</p>
              <p className="text-xs text-zinc-500">Digite o número ou cole o código do QR</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número do ingresso</Label>
              <Input
                id="numero"
                value={numero}
                onChange={(e) => {
                  setNumero(e.target.value)
                  if (e.target.value) setCodigoQr('')
                }}
                placeholder="Ex.: 42"
                className="h-11 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void executar('utilizar')
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr">Código QR</Label>
              <Input
                id="qr"
                value={codigoQr}
                onChange={(e) => {
                  setCodigoQr(e.target.value)
                  if (e.target.value) setNumero('')
                }}
                placeholder="Cole o token do QR"
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => executar('validar')}
                className="h-10 flex-1 rounded-full font-bold"
              >
                Só verificar
              </Button>
              <Button
                disabled={loading}
                onClick={() => executar('utilizar')}
                className="h-10 flex-1 rounded-full bg-indigo-600 font-bold hover:bg-indigo-700"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
                Utilizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {resultado && (
        <div
          className={`flex gap-4 rounded-2xl border p-5 shadow-sm ${
            resultado.ok
              ? 'border-emerald-100 bg-emerald-50'
              : 'border-rose-100 bg-rose-50'
          }`}
        >
          {resultado.ok ? (
            <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="h-7 w-7 shrink-0 text-rose-600" />
          )}
          <div className="min-w-0 space-y-2">
            <p className={`text-base font-bold ${resultado.ok ? 'text-emerald-900' : 'text-rose-900'}`}>
              {resultado.ok
                ? resultado.message || 'Processo realizado com sucesso.'
                : 'Não foi possível concluir'}
            </p>
            {!resultado.ok && resultado.motivo ? (
              <p className="text-sm text-rose-700">{resultado.motivo}</p>
            ) : null}
            {resultado.ingresso ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="rounded-full bg-white/80 px-2.5 py-1 font-mono text-xs font-bold text-zinc-700">
                  Nº {resultado.ingresso.numero}
                </span>
                <StatusBadge value={resultado.ingresso.status_rotulo || resultado.ingresso.status} />
                <StatusBadge value={resultado.ingresso.status_pagamento} />
                {resultado.ingresso.espetaculo ? (
                  <span className="text-xs text-zinc-600">{resultado.ingresso.espetaculo.titulo}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
