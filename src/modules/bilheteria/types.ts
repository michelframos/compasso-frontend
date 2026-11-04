export type StatusIngresso = 'disponivel' | 'vendido' | 'utilizado'
export type StatusPagamentoIngresso = 'aguardando_pagamento' | 'pago' | 'cancelado' | null
export type UnidadeTemplate = 'px' | 'cm'

export interface EspetaculoResumo {
  id: number
  titulo: string
  data_evento: string
  hora_evento?: string | null
  local?: string | null
}

export interface Ingresso {
  id: number
  id_espetaculo: number
  id_template_ingresso?: number | null
  numero: string
  codigo_qr: string
  valor: number
  status: StatusIngresso
  status_rotulo: string
  cortesia: boolean
  status_pagamento: StatusPagamentoIngresso
  id_conta?: number | null
  id_cupom?: number | null
  comprador_nome?: string | null
  comprador_documento?: string | null
  utilizado_em?: string | null
  espetaculo?: EspetaculoResumo
}

export interface CupomIngresso {
  id: number
  id_espetaculo?: number | null
  codigo: string
  tipo: 'percentual' | 'valor_fixo'
  valor: number
  ativo: boolean
  valido_de?: string | null
  valido_ate?: string | null
  uso_maximo?: number | null
  usos: number
  espetaculo?: { id: number; titulo: string } | null
}

export interface TemplateIngresso {
  id: number
  nome: string
  largura: number
  altura: number
  unidade: UnidadeTemplate
  largura_px: number
  altura_px: number
  conteudo: string
  layout: LayoutIngresso
  fundo_path?: string | null
  fundo_url?: string | null
}

export type TipoElementoIngresso = 'texto' | 'imagem' | 'retangulo' | 'linha' | 'qrcode'

export interface ElementoIngressoBase {
  id: string
  tipo: TipoElementoIngresso
  x: number
  y: number
  w: number
  h: number
}

export interface ElementoTextoIngresso extends ElementoIngressoBase {
  tipo: 'texto'
  texto: string
  fonteTamanho: number
  fontePeso: string
  alinhamento: 'left' | 'center' | 'right'
  cor: string
}

export interface ElementoImagemIngresso extends ElementoIngressoBase {
  tipo: 'imagem'
  src: string
  url?: string | null
}

export interface ElementoQrcodeIngresso extends ElementoIngressoBase {
  tipo: 'qrcode'
}

export interface ElementoRetanguloIngresso extends ElementoIngressoBase {
  tipo: 'retangulo'
  preenchimento: string
  bordaCor: string
  bordaLargura: number
}

export interface ElementoLinhaIngresso extends ElementoIngressoBase {
  tipo: 'linha'
  bordaCor: string
  bordaLargura: number
}

export type ElementoIngresso =
  | ElementoTextoIngresso
  | ElementoImagemIngresso
  | ElementoQrcodeIngresso
  | ElementoRetanguloIngresso
  | ElementoLinhaIngresso

export interface LayoutIngresso {
  version: 1
  elementos: ElementoIngresso[]
}

export interface RelatorioIngressos {
  id_espetaculo: number
  gerados: number
  disponiveis: number
  vendidos: number
  cortesias: number
  utilizados: number
  receita_bruta: number
  cupons_usados: number
}

export function novoIdElemento(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function layoutIngressoVazio(): LayoutIngresso {
  return { version: 1, elementos: [] }
}

export function layoutIngressoPadrao(): LayoutIngresso {
  return {
    version: 1,
    elementos: [
      {
        id: novoIdElemento(),
        tipo: 'texto',
        x: 8,
        y: 10,
        w: 84,
        h: 12,
        texto: '{{espetaculo}}',
        fonteTamanho: 18,
        fontePeso: 'bold',
        alinhamento: 'center',
        cor: '#18181b',
      },
      {
        id: novoIdElemento(),
        tipo: 'texto',
        x: 8,
        y: 28,
        w: 55,
        h: 40,
        texto: 'Nº {{numero}}\n{{data}} {{hora}}\n{{local}}\n{{valor}}',
        fonteTamanho: 12,
        fontePeso: 'normal',
        alinhamento: 'left',
        cor: '#3f3f46',
      },
      {
        id: novoIdElemento(),
        tipo: 'qrcode',
        x: 68,
        y: 30,
        w: 24,
        h: 40,
      },
    ],
  }
}

export function encodeLayoutIngresso(layout: LayoutIngresso): string {
  const elementos = layout.elementos.map((el) => {
    if (el.tipo !== 'imagem') return el
    const { url: _url, ...resto } = el
    return resto
  })
  return JSON.stringify({ version: 1, elementos })
}

export function parseLayoutIngresso(conteudo?: string | null, layout?: LayoutIngresso | null): LayoutIngresso {
  if (layout?.version === 1 && Array.isArray(layout.elementos)) {
    return { version: 1, elementos: layout.elementos }
  }
  if (!conteudo?.trim()) return layoutIngressoPadrao()
  try {
    const decoded = JSON.parse(conteudo) as LayoutIngresso
    if (decoded?.version === 1 && Array.isArray(decoded.elementos)) {
      return { version: 1, elementos: decoded.elementos }
    }
  } catch {
    // ignore
  }
  return layoutIngressoPadrao()
}

/** Converte cm → px (96 DPI) para preview. */
export function dimensoesPreviewPx(largura: number, altura: number, unidade: UnidadeTemplate): { w: number; h: number } {
  if (unidade === 'cm') {
    const fator = 96 / 2.54
    return { w: Math.round(largura * fator), h: Math.round(altura * fator) }
  }
  return { w: Math.round(largura), h: Math.round(altura) }
}
