import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, MapPin, QrCode, Search, Ticket } from 'lucide-react'
import api from '@/shared/lib/axios'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { toast } from 'sonner'
import { EmptyState, formatDataBr, LoadingBlock, PageHeader, StatusBadge } from '../components/ui'

interface EspetaculoItem {
  id: number
  titulo: string
  data_evento: string
  hora_evento?: string | null
  local?: string | null
  status: string
}

export const BilheteriaHomePage: React.FC = () => {
  const [itens, setItens] = useState<EspetaculoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await api.get('/espetaculos')
        setItens(data.data ?? data)
      } catch (err) {
        toast.error(getErrorMessage(err, 'Erro ao carregar espetáculos.'))
      } finally {
        setLoading(false)
      }
    }
    void carregar()
  }, [])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return itens
    return itens.filter(
      (e) =>
        e.titulo.toLowerCase().includes(q) ||
        (e.local ?? '').toLowerCase().includes(q) ||
        e.data_evento.includes(q),
    )
  }, [itens, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de"
        highlight="Ingressos"
        description="Escolha um espetáculo para gerar, vender e acompanhar ingressos."
        actions={
          <>
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar espetáculo..."
                className="h-9 rounded-full border-zinc-200 bg-white pl-9 text-sm"
              />
            </div>
            <Button asChild variant="outline" className="h-9 rounded-full px-4 text-sm font-bold">
              <Link to="/bilheteria/validacao">
                <QrCode className="mr-1.5 h-4 w-4" />
                Validar ingresso
              </Link>
            </Button>
          </>
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={itens.length === 0 ? 'Nenhum espetáculo cadastrado' : 'Nenhum resultado'}
          description={
            itens.length === 0
              ? 'Cadastre um espetáculo para começar a gerar e vender ingressos.'
              : 'Tente outro termo de busca.'
          }
          action={
            itens.length === 0 ? (
              <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                <Link to="/espetaculos/novo">Cadastrar espetáculo</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden border-none bg-white shadow-sm">
          <CardContent className="p-0">
            <ul className="divide-y divide-zinc-100">
              {filtrados.map((esp) => (
                <li key={esp.id}>
                  <Link
                    to={`/bilheteria/espetaculos/${esp.id}`}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-indigo-50/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-zinc-900 group-hover:text-indigo-700">
                          {esp.titulo}
                        </p>
                        <StatusBadge value={esp.status} />
                      </div>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDataBr(esp.data_evento)}
                          {esp.hora_evento ? ` · ${esp.hora_evento}` : ''}
                        </span>
                        {esp.local ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {esp.local}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:text-indigo-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
