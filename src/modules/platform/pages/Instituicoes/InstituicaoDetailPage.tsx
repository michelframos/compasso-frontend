import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Building2,
  ChevronLeft,
  Edit,
  LogIn,
  Mail,
  Search,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { getInstituicao } from '../../api/instituicoes'
import { useImpersonation } from '../../hooks/useImpersonation'
import { useInstituicaoUsuarios } from './hooks/useInstituicaoUsuarios'
import type { PlatformInstituicao } from '../../types'
import { getErrorMessage } from '@/shared/lib/utils'
import { toast } from 'sonner'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  a: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700' },
  i: { label: 'Inativo', className: 'bg-zinc-100 text-zinc-600' },
  s: { label: 'Suspenso', className: 'bg-rose-100 text-rose-700' },
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  try {
    return format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return value
  }
}

export function InstituicaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const instituicaoId = id && !isNaN(Number(id)) ? Number(id) : undefined

  const [instituicao, setInstituicao] = useState<PlatformInstituicao | null>(null)
  const [isLoadingInst, setIsLoadingInst] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const {
    usuarios,
    pagination,
    isLoading: isLoadingUsers,
    error: usersError,
    searchTerm,
    setSearchTerm,
    handlePageChange,
  } = useInstituicaoUsuarios(instituicaoId)

  const { enterAsUser, isStarting, isImpersonating } = useImpersonation()
  const [enteringUserId, setEnteringUserId] = useState<number | null>(null)

  useEffect(() => {
    if (!instituicaoId) return

    const load = async () => {
      try {
        setIsLoadingInst(true)
        setLoadError(null)
        const data = await getInstituicao(instituicaoId)
        setInstituicao(data)
      } catch (err: unknown) {
        setLoadError(getErrorMessage(err, 'Erro ao carregar escola'))
      } finally {
        setIsLoadingInst(false)
      }
    }

    load()
  }, [instituicaoId])

  const handleEnterAs = async (userId: number) => {
    if (!instituicaoId) return
    setEnteringUserId(userId)
    try {
      await enterAsUser(instituicaoId, userId)
    } finally {
      setEnteringUserId(null)
    }
  }

  if (!instituicaoId) {
    navigate('/platform/instituicoes', { replace: true })
    return null
  }

  if (isLoadingInst) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loadError || !instituicao) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/platform/instituicoes')} className="rounded-full">
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm">{loadError ?? 'Escola não encontrada'}</div>
      </div>
    )
  }

  const status = STATUS_BADGE[instituicao.status] ?? STATUS_BADGE.a

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/platform/instituicoes')} className="rounded-full shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{instituicao.nome_fantasia}</h1>
            <p className="text-zinc-500 text-sm mt-1">{instituicao.slug}</p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-full self-start">
          <Link to={`/platform/instituicoes/${instituicao.id}/editar`}>
            <Edit className="w-4 h-4 mr-2" />
            Editar escola
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-400 uppercase">Status</p>
            <Badge className={`mt-2 ${status.className}`}>{status.label}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-400 uppercase">Plano</p>
            <p className="text-sm font-semibold text-zinc-900 mt-2">{instituicao.plano?.nome ?? 'Sem plano'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-400 uppercase">Trial até</p>
            <p className="text-sm font-semibold text-zinc-900 mt-2">{formatDate(instituicao.trial_ends_at)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold text-zinc-400 uppercase">Assinatura</p>
            <p className="text-sm font-semibold text-zinc-900 mt-2 capitalize">{instituicao.assinatura_status.replace('_', ' ')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Usuários da escola</h2>
                <p className="text-sm text-zinc-500">Entre como um usuário para diagnosticar o painel da escola.</p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-full"
              />
            </div>
          </div>

          {usersError && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{usersError}</div>
          )}

          {isLoadingUsers ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="w-10 h-10 text-zinc-300 mb-3" />
              <p className="text-zinc-500 text-sm">Nenhum usuário ativo encontrado nesta escola.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Usuário</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase">Perfil</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {usuarios.map((usuario) => {
                      const isBlocked = usuario.is_super_admin
                      const isEntering = enteringUserId === usuario.id && (isStarting || isImpersonating)

                      return (
                        <tr key={usuario.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {usuario.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900">{usuario.nome}</p>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {usuario.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="capitalize">{usuario.role ?? '—'}</Badge>
                            {isBlocked && (
                              <Badge variant="secondary" className="ml-2 bg-zinc-200 text-zinc-600">Super-admin</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              disabled={isBlocked || isEntering}
                              onClick={() => {
                                if (isBlocked) {
                                  toast.error('Não é possível impersonar outro super-admin.')
                                  return
                                }
                                handleEnterAs(usuario.id)
                              }}
                              className="rounded-full bg-indigo-600 hover:bg-indigo-700"
                            >
                              <LogIn className="w-3.5 h-3.5 mr-1.5" />
                              {isEntering ? 'Entrando...' : 'Entrar como'}
                            </Button>
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
                  isLoading={isLoadingUsers}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InstituicaoDetailPage
