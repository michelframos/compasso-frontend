import React, { useEffect, useState } from 'react'
import { BarChart3, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/shared/lib/axios'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { relatorioIngressos } from '../api/ingressos'
import type { RelatorioIngressos } from '../types'
import { EmptyState, formatMoney, LoadingBlock, PageHeader, StatChip } from '../components/ui'

export const RelatoriosPage: React.FC = () => {
  const [espetaculos, setEspetaculos] = useState<{ id: number; titulo: string }[]>([])
  const [idEspetaculo, setIdEspetaculo] = useState<number | ''>('')
  const [relatorio, setRelatorio] = useState<RelatorioIngressos | null>(null)
  const [loadingLista, setLoadingLista] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get('/espetaculos')
        const lista = data.data ?? data
        setEspetaculos(lista)
        if (lista[0]) setIdEspetaculo(lista[0].id)
      } catch (err) {
        toast.error(getErrorMessage(err, 'Erro ao carregar espetáculos.'))
      } finally {
        setLoadingLista(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!idEspetaculo) return
    void (async () => {
      setLoading(true)
      try {
        const res = await relatorioIngressos(Number(idEspetaculo))
        setRelatorio(res.data)
      } catch (err) {
        toast.error(getErrorMessage(err, 'Erro ao carregar relatório.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [idEspetaculo])

  if (loadingLista) return <LoadingBlock />

  if (espetaculos.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Relatórios de"
          highlight="Bilheteria"
          description="Acompanhe geração, vendas e receita por espetáculo."
        />
        <EmptyState
          icon={BarChart3}
          title="Sem espetáculos para reportar"
          description="Cadastre um espetáculo e gere ingressos para ver os números aqui."
        />
      </div>
    )
  }

  const taxaConversao =
    relatorio && relatorio.gerados > 0
      ? Math.round(((relatorio.vendidos + relatorio.cortesias) / relatorio.gerados) * 100)
      : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios de"
        highlight="Bilheteria"
        description="Acompanhe geração, vendas e receita por espetáculo."
        actions={
          <div className="w-full space-y-1.5 md:w-80">
            <Label className="text-xs text-zinc-500">Espetáculo</Label>
            <select
              className="flex h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium"
              value={idEspetaculo}
              onChange={(e) => setIdEspetaculo(e.target.value ? Number(e.target.value) : '')}
            >
              {espetaculos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.titulo}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Atualizando relatório...
        </div>
      ) : relatorio ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatChip label="Gerados" value={relatorio.gerados} />
            <StatChip label="Disponíveis" value={relatorio.disponiveis} />
            <StatChip label="Vendidos" value={relatorio.vendidos} tone="indigo" />
            <StatChip label="Utilizados" value={relatorio.utilizados} tone="emerald" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <StatChip label="Cortesias" value={relatorio.cortesias} tone="violet" />
            <StatChip label="Cupons usados" value={relatorio.cupons_usados} tone="amber" />
            <StatChip
              label="Receita paga"
              value={formatMoney(relatorio.receita_bruta)}
              tone="emerald"
            />
          </div>

          <Card className="border-none bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-900">Taxa de ocupação</p>
                <p className="text-xs text-zinc-500">
                  Vendidos + cortesias em relação aos ingressos gerados.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-100 sm:w-56">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${Math.min(100, taxaConversao)}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-indigo-700">{taxaConversao}%</span>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
