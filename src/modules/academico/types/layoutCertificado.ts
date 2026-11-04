export type TipoElementoLayout = 'texto' | 'imagem' | 'retangulo' | 'linha'

/** Fontes nativas DomPDF + Google Fonts embutidas no PDF. */
export type FonteFamiliaTexto =
  | 'sans'
  | 'helvetica'
  | 'inter'
  | 'roboto'
  | 'montserrat'
  | 'serif'
  | 'times'
  | 'playfair'
  | 'lora'
  | 'mono'
  | 'courier'
  | 'great_vibes'

export const FONTES_TEXTO: { value: FonteFamiliaTexto; label: string; css: string; grupo: string }[] = [
  { value: 'sans', label: 'DejaVu Sans (padrão)', css: '"DejaVu Sans", Arial, sans-serif', grupo: 'Sistema' },
  { value: 'helvetica', label: 'Helvetica', css: 'Helvetica, Arial, sans-serif', grupo: 'Sistema' },
  { value: 'inter', label: 'Inter', css: 'Inter, sans-serif', grupo: 'Google' },
  { value: 'roboto', label: 'Roboto', css: 'Roboto, sans-serif', grupo: 'Google' },
  { value: 'montserrat', label: 'Montserrat', css: 'Montserrat, sans-serif', grupo: 'Google' },
  { value: 'serif', label: 'DejaVu Serif', css: '"DejaVu Serif", Georgia, serif', grupo: 'Sistema' },
  { value: 'times', label: 'Times', css: '"Times-Roman", "Times New Roman", Times, serif', grupo: 'Sistema' },
  { value: 'playfair', label: 'Playfair Display', css: '"Playfair Display", serif', grupo: 'Google' },
  { value: 'lora', label: 'Lora', css: 'Lora, serif', grupo: 'Google' },
  { value: 'mono', label: 'DejaVu Mono', css: '"DejaVu Sans Mono", Consolas, monospace', grupo: 'Sistema' },
  { value: 'courier', label: 'Courier', css: 'Courier, "Courier New", monospace', grupo: 'Sistema' },
  { value: 'great_vibes', label: 'Great Vibes', css: '"Great Vibes", cursive', grupo: 'Google' },
]

/** URL do Google Fonts para o preview do canvas (PDF usa TTF embutido). */
export const GOOGLE_FONTS_PREVIEW_HREF =
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@200;300;400;700;800&family=Lora:wght@400;500;600;700&family=Montserrat:wght@200;300;400;700;800&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@100;300;400;700;900&display=swap'

export type FontePesoTexto = 'extralight' | 'light' | 'normal' | 'bold' | 'extrabold'

export const PESOS_FONTE: { value: FontePesoTexto; label: string; css: number }[] = [
  { value: 'extralight', label: 'Extra fina', css: 200 },
  { value: 'light', label: 'Fina', css: 300 },
  { value: 'normal', label: 'Normal', css: 400 },
  { value: 'bold', label: 'Negrito', css: 700 },
  { value: 'extrabold', label: 'Negrito extra', css: 800 },
]

export const TAMANHOS_FONTE = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64, 72]

export function cssFonteFamilia(fonte?: string | null): string {
  return FONTES_TEXTO.find((f) => f.value === fonte)?.css ?? FONTES_TEXTO[0].css
}

export function cssFontePeso(peso?: string | null): number {
  return PESOS_FONTE.find((p) => p.value === peso)?.css ?? 400
}

export interface ElementoLayoutBase {
  id: string
  tipo: TipoElementoLayout
  x: number
  y: number
  w: number
  h: number
}

export interface ElementoTexto extends ElementoLayoutBase {
  tipo: 'texto'
  texto: string
  fonteFamilia: FonteFamiliaTexto
  fonteTamanho: number
  fontePeso: FontePesoTexto
  alinhamento: 'left' | 'center' | 'right'
  cor: string
}

export interface ElementoImagem extends ElementoLayoutBase {
  tipo: 'imagem'
  src: string
  url?: string | null
}

export interface ElementoRetangulo extends ElementoLayoutBase {
  tipo: 'retangulo'
  preenchimento: string
  bordaCor: string
  bordaLargura: number
}

export interface ElementoLinha extends ElementoLayoutBase {
  tipo: 'linha'
  bordaCor: string
  bordaLargura: number
}

export type ElementoLayout = ElementoTexto | ElementoImagem | ElementoRetangulo | ElementoLinha

export interface LayoutCertificado {
  version: 1
  elementos: ElementoLayout[]
}

export function layoutVazio(): LayoutCertificado {
  return { version: 1, elementos: [] }
}

export function layoutPadrao(): LayoutCertificado {
  return {
    version: 1,
    elementos: [
      {
        id: novoId(),
        tipo: 'texto',
        x: 10,
        y: 35,
        w: 80,
        h: 14,
        texto: 'Certificamos que {{nome_aluno}} concluiu o curso {{nome_curso}}.',
        fonteFamilia: 'sans',
        fonteTamanho: 22,
        fontePeso: 'bold',
        alinhamento: 'center',
        cor: '#18181b',
      },
    ],
  }
}

export function parseLayout(conteudo?: string | null, layout?: LayoutCertificado | null): LayoutCertificado {
  if (layout && layout.version === 1 && Array.isArray(layout.elementos)) {
    return { version: 1, elementos: layout.elementos }
  }

  if (!conteudo || !conteudo.trim()) {
    return layoutPadrao()
  }

  try {
    const decoded = JSON.parse(conteudo) as LayoutCertificado
    if (decoded?.version === 1 && Array.isArray(decoded.elementos)) {
      return { version: 1, elementos: decoded.elementos }
    }
  } catch {
    // HTML legado
  }

  return {
    version: 1,
    elementos: [
      {
        id: 'el_legado',
        tipo: 'texto',
        x: 8,
        y: 12,
        w: 84,
        h: 70,
        texto: conteudo,
        fonteFamilia: 'sans',
        fonteTamanho: 16,
        fontePeso: 'normal',
        alinhamento: 'left',
        cor: '#18181b',
      },
    ],
  }
}

export function encodeLayout(layout: LayoutCertificado): string {
  const elementos = layout.elementos.map((el) => {
    if (el.tipo !== 'imagem') return el
    const { url: _url, ...resto } = el
    return resto
  })
  return JSON.stringify({ version: 1, elementos })
}

export function novoId(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor))
}
