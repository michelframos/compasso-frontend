import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Edit, EyeOff, MessageSquareQuote, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { useDepoimentos } from './hooks/useDepoimentos'
import type { Depoimento } from '../../types'

export function PlatformDepoimentosPage() {
  const navigate = useNavigate()
  const {
    depoimentos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    aprovadoFilter,
    setAprovadoFilter,
    handlePageChange,
    removeDepoimento,
    aprovar,
    ocultar,
  } = useDepoimentos()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    try {
      await removeDepoimento(deletingId)
      toast.success('Depoimento excluído com sucesso!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao excluir depoimento.'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleAprovar = async (id: number) => {
    try {
      setBusyId(id)
      await aprovar(id)
      toast.success('Depoimento aprovado. Já aparece no site.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao aprovar depoimento.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleOcultar = async (id: number) => {
    try {
      setBusyId(id)
      await ocultar(id)
      toast.success('Depoimento ocultado do site.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao ocultar depoimento.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Depoimentos do <span className="text-indigo-600">site</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">
            Cadastre e aprove depoimentos. Só os aprovados aparecem na landing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Buscar depoimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-full"
            />
          </div>
          <select
            value={aprovadoFilter}
            onChange={(e) => setAprovadoFilter(e.target.value as 'all' | 'true' | 'false')}
            className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="all">Todos</option>
            <option value="false">Pendentes</option>
            <option value="true">Aprovados</option>
          </select>
          <Button
            onClick={() => navigate('/platform/depoimentos/novo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo depoimento
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
      ) : depoimentos.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquareQuote className="w-10 h-10 text-zinc-300 mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">Nenhum depoimento encontrado</h3>
            <p className="text-zinc-500 text-sm mt-1">Cadastre o primeiro depoimento para o site.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Autor</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Depoimento</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Ordem</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {depoimentos.map((item: Depoimento) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900">{item.nome}</p>
                        <p className="text-xs text-zinc-500">
                          {item.cargo} — {item.escola}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 max-w-xs">
                        <p className="line-clamp-2">{item.conteudo}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700">{item.ordem}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={item.aprovado ? 'default' : 'secondary'}
                          className={item.aprovado ? 'bg-emerald-100 text-emerald-700' : ''}
                        >
                          {item.aprovado ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {item.aprovado ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              title="Ocultar do site"
                              disabled={busyId === item.id}
                              onClick={() => handleOcultar(item.id)}
                            >
                              <EyeOff className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-emerald-600"
                              title="Aprovar e publicar no site"
                              disabled={busyId === item.id}
                              onClick={() => handleAprovar(item.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => navigate(`/platform/depoimentos/${item.id}/editar`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-rose-500"
                            onClick={() => setDeletingId(item.id)}
                          >
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
        title={<>Excluir <span className="text-rose-500">Depoimento</span></>}
        description="O depoimento sai do site imediatamente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default PlatformDepoimentosPage
