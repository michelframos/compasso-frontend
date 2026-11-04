import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Gift, Loader2, Search, ShoppingCart, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/shared/lib/axios'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  gerarIngressos,
  listarIngressos,
  marcarCortesia,
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
      await venderIngresso(vendaAlvo.id, {
        comprador_nome: comprador.trim() || undefined,
        cupom: cupom.trim() || undefined,
      })
      toast.success(`Ingresso ${vendaAlvo.numero} vendido. Aguardando pagamento.`)
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
      await marcarCortesia(ingresso.id)
      toast.success(`Ingresso ${ingresso.numero} marcado como cortesia.`)
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
                        {ing.status === 'disponivel' ? (
                          <div className="flex justify-end gap-2">
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
                              onClick={() => handleCortesia(ing)}
                              className="h-8 rounded-full px-3 text-xs font-bold"
                            >
                              {cortesiaId === ing.id ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Gift className="mr-1 h-3.5 w-3.5" />
                              )}
                              Cortesia
                            </Button>
                          </div>
                        ) : (
                          <span className="block text-right text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!vendaAlvo} onOpenChange={(open) => !open && setVendaAlvo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vender ingresso {vendaAlvo?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-zinc-500">
              Valor atual: <strong className="text-zinc-800">{formatMoney(vendaAlvo?.valor ?? 0)}</strong>
              . Uma conta a receber será criada no Financeiro.
            </p>
            <div className="space-y-2">
              <Label htmlFor="comprador">Nome do comprador</Label>
              <Input
                id="comprador"
                value={comprador}
                onChange={(e) => setComprador(e.target.value)}
                placeholder="Opcional"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cupom">Cupom de desconto</Label>
              <Input
                id="cupom"
                value={cupom}
                onChange={(e) => setCupom(e.target.value.toUpperCase())}
                placeholder="Opcional"
                className="rounded-xl uppercase"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setVendaAlvo(null)} className="rounded-full">
              Cancelar
            </Button>
            <Button
              onClick={confirmarVenda}
              disabled={vendendo}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700"
            >
              {vendendo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
