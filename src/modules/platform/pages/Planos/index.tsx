import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Edit, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { usePlanos } from './hooks/usePlanos'
import type { PlanoAssinatura } from '../../../types'

const formatCurrency = (value: string | number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function PlatformPlanosPage() {
  const navigate = useNavigate()
  const {
    planos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    ativoFilter,
    setAtivoFilter,
    handlePageChange,
    removePlano,
  } = usePlanos()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    try {
      await removePlano(deletingId)
      toast.success('Plano excluído com sucesso!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao excluir plano. Verifique se há escolas vinculadas.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Planos de <span className="text-indigo-600">Assinatura</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Gerencie os planos disponíveis para as escolas.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Buscar planos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-full"
            />
          </div>
          <select
            value={ativoFilter}
            onChange={(e) => setAtivoFilter(e.target.value as 'all' | 'true' | 'false')}
            className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="all">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
          <Button
            onClick={() => navigate('/platform/planos/novo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Plano
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
      ) : planos.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="w-10 h-10 text-zinc-300 mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">Nenhum plano encontrado</h3>
            <p className="text-zinc-500 text-sm mt-1">Cadastre o primeiro plano de assinatura.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Plano</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Preço/mês</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Limite alunos</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {planos.map((plano: PlanoAssinatura) => (
                    <tr key={plano.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900">{plano.nome}</p>
                        <p className="text-xs text-zinc-500">{plano.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700">{formatCurrency(plano.preco_mensal)}</td>
                      <td className="px-6 py-4 text-sm text-zinc-700">{plano.limite_alunos ?? '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={plano.ativo ? 'default' : 'secondary'} className={plano.ativo ? 'bg-emerald-100 text-emerald-700' : ''}>
                          {plano.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate(`/platform/planos/${plano.id}/editar`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500" onClick={() => setDeletingId(plano.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        title={<>Excluir <span className="text-rose-500">Plano</span></>}
        description="Escolas vinculadas impedem a exclusão. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default PlatformPlanosPage
