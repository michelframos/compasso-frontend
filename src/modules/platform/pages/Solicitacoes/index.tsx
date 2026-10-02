import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ClipboardList, Search, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { useSolicitacoes } from './hooks/useSolicitacoes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-amber-100 text-amber-800' },
  aprovada: { label: 'Aprovada', className: 'bg-emerald-100 text-emerald-700' },
  rejeitada: { label: 'Rejeitada', className: 'bg-rose-100 text-rose-700' },
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR })
  } catch {
    return value
  }
}

function formatPrice(value?: number) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PlatformSolicitacoesPage() {
  const {
    solicitacoes,
    pagination,
    isLoading,
    error,
    statusFilter,
    searchTerm,
    actionId,
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    aprovar,
    rejeitar,
  } = useSolicitacoes()

  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const confirmReject = async () => {
    if (!rejectingId) return
    await rejeitar(rejectingId, rejectNote || undefined)
    setRejectingId(null)
    setRejectNote('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Solicitações de <span className="text-indigo-600">Assinatura</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">
            Aprove ou rejeite pedidos de ativação de plano feitos pelas escolas.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Buscar escola..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'pendente', label: 'Pendentes' },
            { value: 'aprovada', label: 'Aprovadas' },
            { value: 'rejeitada', label: 'Rejeitadas' },
            { value: '', label: 'Todas' },
          ].map((opt) => (
            <Button
              key={opt.label}
              type="button"
              variant={statusFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              className={
                statusFilter === opt.value
                  ? 'rounded-full bg-indigo-600 hover:bg-indigo-700'
                  : 'rounded-full'
              }
              onClick={() => handleStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-zinc-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Nenhuma solicitação encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Escola</th>
                    <th className="px-5 py-3">Plano</th>
                    <th className="px-5 py-3">Solicitante</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((item) => {
                    const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.pendente
                    const busy = actionId === item.id

                    return (
                      <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                        <td className="px-5 py-4">
                          <Link
                            to={`/platform/instituicoes/${item.instituicao?.id}`}
                            className="text-sm font-bold text-zinc-900 hover:text-indigo-600"
                          >
                            {item.instituicao?.nome_fantasia ?? '—'}
                          </Link>
                          <p className="text-xs text-zinc-400">{item.instituicao?.slug}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-zinc-800">{item.plano?.nome}</p>
                          <p className="text-xs text-zinc-400">{formatPrice(item.plano?.preco)}/mês</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-zinc-800">{item.usuario?.nome}</p>
                          <p className="text-xs text-zinc-400">{item.usuario?.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge className={badge.className}>{badge.label}</Badge>
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          {item.status === 'pendente' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => aprovar(item.id)}
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => {
                                  setRejectingId(item.id)
                                  setRejectNote('')
                                }}
                                className="rounded-full h-8 text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400 text-right">
                              {item.aprovado_por
                                ? `por ${item.aprovado_por.nome}`
                                : '—'}
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.last_page > 1 && (
        <PaginationCustom
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={handlePageChange}
        />
      )}

      {rejectingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">Rejeitar solicitação</h3>
            <p className="text-sm text-zinc-500">
              Opcionalmente, informe o motivo da rejeição.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Motivo (opcional)"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setRejectingId(null)}
              >
                Cancelar
              </Button>
              <Button
                className="rounded-full bg-rose-600 hover:bg-rose-700 text-white"
                onClick={confirmReject}
                disabled={actionId === rejectingId}
              >
                Confirmar rejeição
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlatformSolicitacoesPage
