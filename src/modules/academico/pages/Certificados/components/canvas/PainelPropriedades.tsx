import React, { useEffect, useState } from 'react'
import { ImagePlus, MousePointer2 } from 'lucide-react'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import {
  FONTES_TEXTO,
  PESOS_FONTE,
  TAMANHOS_FONTE,
  type ElementoLayout,
  type FonteFamiliaTexto,
  type FontePesoTexto,
} from '../../../../types/layoutCertificado'

interface PainelPropriedadesProps {
  elemento: ElementoLayout | null
  onChange: (patch: Partial<ElementoLayout>) => void
}

const TITULOS: Record<ElementoLayout['tipo'], string> = {
  texto: 'Texto',
  imagem: 'Imagem',
  retangulo: 'Retângulo',
  linha: 'Linha',
}

function clampFonteTamanho(valor: number): number {
  if (!Number.isFinite(valor)) return 16
  return Math.min(96, Math.max(8, Math.round(valor)))
}

export const PainelPropriedades: React.FC<PainelPropriedadesProps> = ({ elemento, onChange }) => {
  const tamanhoAtual = elemento?.tipo === 'texto' ? elemento.fonteTamanho : null
  const [tamanhoDraft, setTamanhoDraft] = useState(
    tamanhoAtual != null ? String(tamanhoAtual) : '16',
  )

  useEffect(() => {
    if (tamanhoAtual != null) {
      setTamanhoDraft(String(tamanhoAtual))
    }
  }, [elemento?.id, tamanhoAtual])

  if (!elemento) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/70 px-4 py-8 text-center">
        <MousePointer2 className="h-5 w-5 text-zinc-300" />
        <p className="text-xs font-medium text-zinc-500">Selecione um elemento no canvas</p>
        <p className="text-[11px] text-zinc-400">
          Arraste para mover · duplo clique para editar texto · Del para excluir
        </p>
      </div>
    )
  }

  const aplicarTamanho = (bruto: string) => {
    const parseado = Number(bruto.replace(',', '.'))
    const tamanho = clampFonteTamanho(parseado)
    setTamanhoDraft(String(tamanho))
    onChange({ fonteTamanho: tamanho } as Partial<ElementoLayout>)
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
        {TITULOS[elemento.tipo]}
      </p>

      {elemento.tipo === 'texto' && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Conteúdo</Label>
            <textarea
              value={elemento.texto}
              onChange={(e) => onChange({ texto: e.target.value } as Partial<ElementoLayout>)}
              rows={5}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-indigo-600"
              style={{ fontFamily: FONTES_TEXTO.find((f) => f.value === (elemento.fonteFamilia ?? 'sans'))?.css }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Fonte</Label>
            <Select
              value={elemento.fonteFamilia ?? 'sans'}
              onValueChange={(v) => onChange({ fonteFamilia: v as FonteFamiliaTexto } as Partial<ElementoLayout>)}
            >
              <SelectTrigger className="h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {(['Sistema', 'Google'] as const).map((grupo) => (
                  <div key={grupo}>
                    <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {grupo}
                    </p>
                    {FONTES_TEXTO.filter((f) => f.grupo === grupo).map((fonte) => (
                      <SelectItem key={fonte.value} value={fonte.value} style={{ fontFamily: fonte.css }}>
                        {fonte.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Tamanho</Label>
              <Select
                value={TAMANHOS_FONTE.includes(elemento.fonteTamanho) ? String(elemento.fonteTamanho) : 'custom'}
                onValueChange={(v) => {
                  if (v === 'custom') return
                  aplicarTamanho(v)
                }}
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAMANHOS_FONTE.map((tam) => (
                    <SelectItem key={tam} value={String(tam)}>
                      {tam} px
                    </SelectItem>
                  ))}
                  {!TAMANHOS_FONTE.includes(elemento.fonteTamanho) && (
                    <SelectItem value="custom">{elemento.fonteTamanho} px</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Personalizado (px)</Label>
              <Input
                type="number"
                min={8}
                max={96}
                step={1}
                value={tamanhoDraft}
                onChange={(e) => {
                  const bruto = e.target.value
                  setTamanhoDraft(bruto)
                  if (bruto.trim() === '') return
                  const parseado = Number(bruto)
                  if (!Number.isFinite(parseado)) return
                  // Aplica enquanto digita só quando o valor já está no intervalo válido,
                  // sem forçar mínimo a cada tecla (ex.: digitar 25).
                  if (parseado >= 8 && parseado <= 96) {
                    onChange({ fonteTamanho: Math.round(parseado) } as Partial<ElementoLayout>)
                  }
                }}
                onBlur={() => aplicarTamanho(tamanhoDraft)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    aplicarTamanho(tamanhoDraft)
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="h-9 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Cor</Label>
              <Input
                type="color"
                value={elemento.cor}
                onChange={(e) => onChange({ cor: e.target.value } as Partial<ElementoLayout>)}
                className="h-9 rounded-lg p-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Peso</Label>
              <Select
                value={elemento.fontePeso || 'normal'}
                onValueChange={(v) =>
                  onChange({ fontePeso: v as FontePesoTexto } as Partial<ElementoLayout>)
                }
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PESOS_FONTE.map((peso) => (
                    <SelectItem key={peso.value} value={peso.value} style={{ fontWeight: peso.css }}>
                      {peso.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Alinhamento</Label>
            <Select
              value={elemento.alinhamento}
              onValueChange={(v) => onChange({ alinhamento: v } as Partial<ElementoLayout>)}
            >
              <SelectTrigger className="h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {elemento.tipo === 'imagem' && (
        <div className="flex items-start gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3 text-xs text-zinc-500">
          <ImagePlus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span>Use a barra de ferramentas para trocar a imagem. Arraste no canvas para posicionar.</span>
        </div>
      )}

      {elemento.tipo === 'retangulo' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Preenchimento</Label>
              <Input
                type="color"
                value={elemento.preenchimento === 'transparent' ? '#ffffff' : elemento.preenchimento}
                onChange={(e) => onChange({ preenchimento: e.target.value } as Partial<ElementoLayout>)}
                className="h-9 rounded-lg p-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Borda</Label>
              <Input
                type="color"
                value={elemento.bordaCor}
                onChange={(e) => onChange({ bordaCor: e.target.value } as Partial<ElementoLayout>)}
                className="h-9 rounded-lg p-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Espessura da borda</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={elemento.bordaLargura}
              onChange={(e) =>
                onChange({ bordaLargura: Number(e.target.value) || 0 } as Partial<ElementoLayout>)
              }
              className="h-9 rounded-lg"
            />
          </div>
        </>
      )}

      {elemento.tipo === 'linha' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Cor</Label>
            <Input
              type="color"
              value={elemento.bordaCor}
              onChange={(e) => onChange({ bordaCor: e.target.value } as Partial<ElementoLayout>)}
              className="h-9 rounded-lg p-1"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Espessura</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={elemento.bordaLargura}
              onChange={(e) =>
                onChange({ bordaLargura: Number(e.target.value) || 1 } as Partial<ElementoLayout>)
              }
              className="h-9 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
