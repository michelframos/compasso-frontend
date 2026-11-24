import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutTemplate, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { excluirTemplateIngresso, listarTemplatesIngresso } from '../api/templates'
import type { TemplateIngresso } from '../types'
import { EmptyState, LoadingBlock, PageHeader } from '../components/ui'

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateIngresso[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await listarTemplatesIngresso()
      setTemplates(res.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao listar templates.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregar()
  }, [])

  const handleExcluir = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Excluir este template?')) return
    try {
      await excluirTemplateIngresso(id)
      toast.success('Template excluído.')
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao excluir.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates de"
        highlight="Ingresso"
        description="Monte o layout visual e defina as dimensões em cm ou pixels."
        actions={
          <Button asChild className="h-9 rounded-full bg-indigo-600 px-5 font-bold hover:bg-indigo-700">
            <Link to="/bilheteria/templates/novo">
              <Plus className="mr-1.5 h-4 w-4" />
              Novo template
            </Link>
          </Button>
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Nenhum template ainda"
          description="Crie um template para personalizar o visual dos ingressos gerados."
          action={
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700">
              <Link to="/bilheteria/templates/novo">Criar primeiro template</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <Link key={t.id} to={`/bilheteria/templates/${t.id}`} className="group block">
              <Card className="h-full overflow-hidden border-none bg-white shadow-sm transition group-hover:ring-2 group-hover:ring-indigo-100">
                <div
                  className="relative flex h-28 items-center justify-center bg-zinc-100"
                  style={{
                    backgroundImage: t.fundo_url ? `url(${t.fundo_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!t.fundo_url && (
                    <LayoutTemplate className="h-8 w-8 text-zinc-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900 group-hover:text-indigo-700">
                      {t.nome}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {t.largura} × {t.altura} {t.unidade}
                      {t.largura_px ? ` · ${t.largura_px}×${t.altura_px}px` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleExcluir(t.id, e)}
                    className="h-8 w-8 shrink-0 rounded-full p-0 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
