import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { useInstituicoes } from './hooks/useInstituicoes'
import type { PlatformInstituicao } from '../../../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  a: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700' },
  i: { label: 'Inativo', className: 'bg-zinc-100 text-zinc-600' },
  s: { label: 'Suspenso', className: 'bg-rose-100 text-rose-700' },
}

const formatTrialDate = (value: string | null) => {
  if (!value) return '—'
  try {
    return format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return value
  }
}

export function PlatformInstituicoesPage() {
  const navigate = useNavigate()
  const {
    instituicoes,
    planos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    planoFilter,
    setPlanoFilter,
    trialFilter,
    setTrialFilter,
    handlePageChange,
    removeInstituicao,
  } = useInstituicoes()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    try {
      await removeInstituicao(deletingId)
      toast.success('Escola excluída com sucesso!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao excluir escola'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Escolas <span className="text-indigo-600">Assinantes</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Gerencie escolas, planos e períodos de trial.</p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Buscar escolas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="a">Ativo</option>
              <option value="i">Inativo</option>
              <option value="s">Suspenso</option>
            </select>
            <select
              value={planoFilter}
              onChange={(e) => setPlanoFilter(e.target.value)}
              className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="">Todos os planos</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            <select
              value={trialFilter}
              onChange={(e) => setTrialFilter(e.target.value as 'all' | 'trial' | 'expirado')}
              className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="all">Trial: todos</option>
              <option value="trial">Em trial</option>
              <option value="expirado">Trial expirado</option>
            </select>
          </div>
          <Button
            onClick={() => navigate('/platform/instituicoes/novo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 self-end"
          >
            <Plus className="w-4 h-4" />
            Nova Escola
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : instituicoes.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="w-10 h-10 text-zinc-300 mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">Nenhuma escola encontrada</h3>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Escola</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Plano</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Trial até</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {instituicoes.map((item: PlatformInstituicao) => {
                    const status = STATUS_BADGE[item.status] ?? STATUS_BADGE.a
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-zinc-900">{item.nome_fantasia}</p>
                          <p className="text-xs text-zinc-500">{item.slug}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-700">{item.plano?.nome ?? '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-700">{formatTrialDate(item.trial_ends_at)}</span>
                            {!item.trial_usa_padrao && item.trial_ends_at && (
                              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">Customizado</Badge>
                            )}
                            {item.trial_expirado && (
                              <Badge variant="secondary" className="text-[10px] bg-rose-100 text-rose-700">Expirado</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={status.className}>{status.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate(`/platform/instituicoes/${item.id}`)} title="Ver detalhes">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate(`/platform/instituicoes/${item.id}/editar`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500" onClick={() => setDeletingId(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {pagination && (
              <PaginationCustom
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={<>Excluir <span className="text-rose-500">Escola</span></>}
        description="Esta ação não pode ser desfeita. A escola será removida do sistema."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default PlatformInstituicoesPage
