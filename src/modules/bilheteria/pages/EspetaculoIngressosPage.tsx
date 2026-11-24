import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Download, Gift, Loader2, Search, ShoppingCart, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/shared/lib/axios'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  baixarPdfIngresso,
  gerarIngressos,
  listarIngressos,
  marcarCortesia,
  urlPublicaIngresso,
  venderIngresso,
} from '../api/ingressos'
import type { Ingresso } from '../types'
import {
  EmptyState,
  formatMoney,
  LoadingBlock,
  PageHeader,
  StatChip,
  StatusBadge,
} from '../components/ui'

type FiltroStatus = 'todos' | 'disponivel' | 'vendido' | 'utilizado'

export const EspetaculoIngressosPage: React.FC = () => {
  const { id } = useParams()
  const idEspetaculo = Number(id)
  const [titulo, setTitulo] = useState('')
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState('10')
  const [valor, setValor] = useState('')
  const [gerando, setGerando] = useState(false)
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')
  const [busca, setBusca] = useState('')
  const [vendaAlvo, setVendaAlvo] = useState<Ingresso | null>(null)
  const [comprador, setComprador] = useState('')
  const [cupom, setCupom] = useState('')
  const [vendendo, setVendendo] = useState(false)
  const [cortesiaId, setCortesiaId] = useState<number | null>(null)
  const [baixandoPdfId, setBaixandoPdfId] = useState<number | null>(null)

  const copiarLink = async (ingresso: Ingresso) => {
    const url = ingresso.url_publica
      ? `${window.location.origin}${ingresso.url_publica}`
      : urlPublicaIngresso(ingresso.codigo_qr)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link do ingresso copiado.')
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  const baixarPdf = async (ingresso: Ingresso) => {
    setBaixandoPdfId(ingresso.id)
    try {
      const blob = await baixarPdfIngresso(ingresso.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ingresso_${ingresso.numero}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao baixar PDF.'))
    } finally {
      setBaixandoPdfId(null)
    }
  }

  const carregar = useCallback(async () => {
    if (!idEspetaculo) return
    setLoading(true)
    try {
      const [espRes, ingRes] = await Promise.all([
        api.get(`/espetaculos/${idEspetaculo}`),
        listarIngressos({ id_espetaculo: idEspetaculo, per_page: 200 }),
      ])
      const esp = espRes.data.data || espRes.data
      setTitulo(esp.titulo)
      if (esp.valor_ingresso_padrao != null) setValor(String(esp.valor_ingresso_padrao))
      setIngressos(ingRes.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar ingressos.'))
    } finally {
      setLoading(false)
    }
  }, [idEspetaculo])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const resumo = useMemo(() => {
    const disponiveis = ingressos.filter((i) => i.status === 'disponivel').length
    const vendidos = ingressos.filter((i) => i.status === 'vendido' && !i.cortesia).length
    const cortesias = ingressos.filter((i) => i.cortesia).length
    const utilizados = ingressos.filter((i) => i.status === 'utilizado').length
    return { disponiveis, vendidos, cortesias, utilizados, total: ingressos.length }
  }, [ingressos])

  const filtrados = useMemo(() => {
    return ingressos.filter((ing) => {
      if (filtro !== 'todos' && ing.status !== filtro) return false
      const q = busca.trim().toLowerCase()
      if (!q) return true
      return (
        ing.numero.toLowerCase().includes(q) ||
        (ing.comprador_nome ?? '').toLowerCase().includes(q) ||
        (ing.status_rotulo ?? '').toLowerCase().includes(q)
      )
    })
  }, [ingressos, filtro, busca])

  const handleGerar = async () => {
    const qtd = Number(quantidade)
    if (!qtd || qtd < 1) {
      toast.error('Informe uma quantidade válida.')
      return
    }
    setGerando(true)
    try {
      await gerarIngressos(idEspetaculo, {
        quantidade: qtd,
        valor: valor !== '' ? Number(valor) : undefined,
      })
      toast.success(`${qtd} ingresso(s) gerado(s).`)
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao gerar ingressos.'))
    } finally {
      setGerando(false)
    }
  }

  const abrirVenda = (ingresso: Ingresso) => {
    setVendaAlvo(ingresso)
    setComprador('')
    setCupom('')
  }

  const confirmarVenda = async () => {
    if (!vendaAlvo) return
    setVendendo(true)
    try {
      const vendido = await venderIngresso(vendaAlvo.id, {
        comprador_nome: comprador.trim() || undefined,
        cupom: cupom.trim() || undefined,
      })
      toast.success(`Ingresso ${vendaAlvo.numero} vendido. Aguardando pagamento.`, {
        action: {
          label: 'Copiar link',
          onClick: () => {
            void copiarLink(vendido.data)
          },
        },
      })
      setVendaAlvo(null)
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao vender.'))
    } finally {
      setVendendo(false)
    }
  }

  const handleCortesia = async (ingresso: Ingresso) => {
    setCortesiaId(ingresso.id)
    try {
      const atualizado = await marcarCortesia(ingresso.id)
      toast.success(`Ingresso ${ingresso.numero} marcado como cortesia.`, {
        action: {
          label: 'Copiar link',
          onClick: () => {
            void copiarLink(atualizado.data)
          },
        },
      })
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao marcar cortesia.'))
    } finally {
      setCortesiaId(null)
    }
  }

  const filtros: { id: FiltroStatus; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'disponivel', label: 'Disponíveis' },
    { id: 'vendido', label: 'Vendidos' },
    { id: 'utilizado', label: 'Utilizados' },
  ]

  if (loading) return <LoadingBlock />

  return (
    <div className="space-y-6">
      <PageHeader
        title={titulo || 'Espetáculo'}
        description="Gere lotes, venda ingressos e acompanhe status e pagamento."
        actions={
          <Button asChild variant="ghost" className="h-9 rounded-full px-3 font-bold text-zinc-500">
            <Link to="/bilheteria">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatChip label="Total" value={resumo.total} />
        <StatChip label="Disponíveis" value={resumo.disponiveis} tone="default" />
        <StatChip label="Vendidos" value={resumo.vendidos} tone="indigo" />
        <StatChip label="Cortesias" value={resumo.cortesias} tone="violet" />
        <StatChip label="Utilizados" value={resumo.utilizados} tone="emerald" />
      </div>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-900">Gerar lote</p>
            <p className="text-xs text-zinc-500">Cria ingressos disponíveis com QR próprio.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs text-zinc-500">Quantidade</Label>
              <Input
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value.replace(/\D/g, ''))}
                className="h-10 w-28 rounded-xl"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500">Valor unitário</Label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="h-10 w-32 rounded-xl"
              />
            </div>
            <Button
              onClick={handleGerar}
              disabled={gerando}
              className="h-10 rounded-full bg-indigo-600 px-5 font-bold hover:bg-indigo-700"
            >
              {gerando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
              Gerar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filtro === f.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                  : 'bg-white text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nº ou comprador..."
            className="h-9 rounded-full border-zinc-200 bg-white pl-9 text-sm"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={ingressos.length === 0 ? 'Nenhum ingresso gerado' : 'Nenhum ingresso neste filtro'}
          description={
            ingressos.length === 0
              ? 'Use o formulário acima para gerar o primeiro lote.'
              : 'Ajuste o filtro ou a busca para ver outros ingressos.'
          }
        />
      ) : (
        <Card className="overflow-hidden border-none bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-3">Nº</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Pagamento</th>
                    <th className="px-5 py-3">Valor</th>
                    <th className="px-5 py-3">Comprador</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((ing) => (
                    <tr key={ing.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                      <td className="px-5 py-3 font-mono font-semibold text-zinc-900">{ing.numero}</td>
                      <td className="px-5 py-3">
                        <StatusBadge value={ing.status_rotulo || ing.status} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge value={ing.status_pagamento} />
                      </td>
                      <td className="px-5 py-3 font-medium text-zinc-700">{formatMoney(ing.valor)}</td>
                      <td className="px-5 py-3 text-zinc-500">{ing.comprador_nome || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={baixandoPdfId === ing.id}
                            onClick={() => void baixarPdf(ing)}
                            className="h-8 rounded-full px-3 text-xs font-bold"
                          >
                            {baixandoPdfId === ing.id ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="mr-1 h-3.5 w-3.5" />
                            )}
                            PDF
                          </Button>
                          {ing.status === 'disponivel' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => abrirVenda(ing)}
                                className="h-8 rounded-full bg-indigo-600 px-3 text-xs font-bold hover:bg-indigo-700"
                              >
                                <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                                Vender
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={cortesiaId === ing.id}
                                onClick={() => void handleCortesia(ing)}
                                className="h-8 rounded-full px-3 text-xs font-bold"
                              >
                                {cortesiaId === ing.id ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Gift className="mr-1 h-3.5 w-3.5" />
                                )}
                                Cortesia
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void copiarLink(ing)}
                              className="h-8 rounded-full px-3 text-xs font-bold"
                            >
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Link
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <CustomModalGlobal
        open={!!vendaAlvo}
        close={(open: boolean) => !open && setVendaAlvo(null)}
        onClose={() => setVendaAlvo(null)}
        onConfirm={() => void confirmarVenda()}
        isLoading={vendendo}
        firsChunkTitle="Vender"
        secondChunkTitle={`ingresso ${vendaAlvo?.numero ?? ''}`}
        colorSecondChunkTitle="text-indigo-600"
        titleDescription="Informe os dados opcionais da venda. Uma conta a receber será criada no Financeiro."
        textConfirmButton="Confirmar venda"
        loadingText="Confirmando..."
        contentClassName="sm:max-w-md"
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600">
            Valor atual:{' '}
            <strong className="font-bold text-zinc-900">{formatMoney(vendaAlvo?.valor ?? 0)}</strong>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comprador" className="ml-1 font-medium text-zinc-700">
              Nome do comprador
            </Label>
            <Input
              id="comprador"
              value={comprador}
              onChange={(e) => setComprador(e.target.value)}
              placeholder="Opcional"
              className="h-11 rounded-xl border-zinc-200 bg-zinc-50 focus-visible:bg-white focus-visible:ring-indigo-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cupom" className="ml-1 font-medium text-zinc-700">
              Cupom de desconto
            </Label>
            <Input
              id="cupom"
              value={cupom}
              onChange={(e) => setCupom(e.target.value.toUpperCase())}
              placeholder="Opcional"
              className="h-11 rounded-xl border-zinc-200 bg-zinc-50 uppercase focus-visible:bg-white focus-visible:ring-indigo-600 placeholder:normal-case"
            />
          </div>
        </div>
      </CustomModalGlobal>
    </div>
  )
}
