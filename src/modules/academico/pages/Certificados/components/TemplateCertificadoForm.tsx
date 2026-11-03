import React, { useEffect, useState } from 'react'
import { Award, ImagePlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { urlArquivoPublico } from '@/shared/lib/storageUrl'
import type { TemplateCertificado } from '../../../api/templatesCertificados'
import { CertificadoCanvasEditor } from './canvas/CertificadoCanvasEditor'
import {
  encodeLayout,
  layoutPadrao,
  parseLayout,
  type LayoutCertificado,
} from '../../../types/layoutCertificado'

interface TemplateCertificadoFormProps {
  template?: TemplateCertificado | null
  salvando?: boolean
  onCancel: () => void
  onSave: (
    payload: { nome: string; conteudo: string },
    fundo?: File | null,
    removerFundo?: boolean,
  ) => Promise<unknown>
}

export const TemplateCertificadoForm: React.FC<TemplateCertificadoFormProps> = ({
  template,
  salvando,
  onCancel,
  onSave,
}) => {
  const [nome, setNome] = useState(template?.nome || '')
  const [layout, setLayout] = useState<LayoutCertificado>(() =>
    template ? parseLayout(template.conteudo, template.layout) : layoutPadrao(),
  )
  const [fundoArquivo, setFundoArquivo] = useState<File | null>(null)
  const [previewLocal, setPreviewLocal] = useState<string | null>(null)
  const [removerFundo, setRemoverFundo] = useState(false)

  useEffect(() => {
    setNome(template?.nome ?? '')
    setLayout(template ? parseLayout(template.conteudo, template.layout) : layoutPadrao())
    setFundoArquivo(null)
    setPreviewLocal(null)
    setRemoverFundo(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sincroniza pelo id do template
  }, [template?.id])

  useEffect(() => {
    if (!fundoArquivo) {
      setPreviewLocal(null)
      return
    }
    const url = URL.createObjectURL(fundoArquivo)
    setPreviewLocal(url)
    return () => URL.revokeObjectURL(url)
  }, [fundoArquivo])

  const previewUrl =
    previewLocal || (!removerFundo ? urlArquivoPublico(template?.fundo_url ?? template?.fundo_path) : null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSave(
      { nome: nome.trim(), conteudo: encodeLayout(layout) },
      fundoArquivo,
      removerFundo,
    )
  }

  const painelLateral = (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="nome-template" className="text-xs font-semibold text-zinc-600">
            Nome do template
          </Label>
          <Input
            id="nome-template"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Ex: Certificado Violão 2026"
            className="h-10 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs font-semibold text-zinc-600">Fundo A4 paisagem</Label>
            {previewUrl && (
              <button
                type="button"
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600"
                onClick={() => {
                  setFundoArquivo(null)
                  setRemoverFundo(true)
                }}
              >
                Remover
              </button>
            )}
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-[11px] leading-relaxed text-indigo-900">
            <p className="font-bold">Tamanho do certificado</p>
            <p className="mt-0.5">
              A4 paisagem · <span className="font-semibold tabular-nums">3508 × 2480 px</span> (300 DPI)
            </p>
            <p className="mt-0.5 text-indigo-700/80">
              Use uma imagem com essa proporção (297 × 210 mm). Mínimo aceitável: 1754 × 1240 px.
            </p>
          </div>

          {previewUrl ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <img src={previewUrl} alt="Fundo" className="h-24 w-full object-cover" />
              <label className="flex cursor-pointer items-center justify-center gap-1.5 border-t border-zinc-100 bg-zinc-50 py-2 text-[11px] font-bold text-zinc-600 hover:bg-zinc-100">
                <ImagePlus className="h-3 w-3" />
                Trocar fundo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    setFundoArquivo(e.target.files?.[0] ?? null)
                    setRemoverFundo(false)
                  }}
                />
              </label>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-5 text-center hover:border-indigo-300 hover:bg-indigo-50/40">
              <ImagePlus className="h-4 w-4 text-zinc-400" />
              <span className="text-[11px] font-bold text-zinc-600">Enviar fundo</span>
              <span className="text-[10px] text-zinc-400">JPG, PNG ou WEBP · 3508 × 2480 px</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  setFundoArquivo(e.target.files?.[0] ?? null)
                  setRemoverFundo(false)
                }}
              />
            </label>
          )}
        </div>

        {!template?.id && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            Salve o template uma vez para liberar o upload de imagens no canvas.
          </p>
        )}
      </div>
    </>
  )

  return (
    <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3 pt-4 sm:px-6">
        <CertificadoCanvasEditor
          layout={layout}
          onChange={setLayout}
          fundoUrl={previewUrl}
          templateId={template?.id}
          sideSlot={painelLateral}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 sm:px-6">
        <p className="hidden text-[11px] text-zinc-400 sm:block">
          Alterações só valem na emissão depois de salvar.
        </p>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-9 rounded-full px-5 font-bold hover:bg-zinc-100"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={salvando || !nome.trim()}
            className="h-9 rounded-full bg-indigo-600 px-5 font-bold hover:bg-indigo-700"
          >
            {salvando ? 'Salvando...' : template?.id ? 'Salvar alterações' : 'Criar template'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export const TemplateCertificadoEmptyIcon = Award
