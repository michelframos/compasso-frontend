import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Copy, Edit, FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { urlArquivoPublico } from '@/shared/lib/storageUrl'
import { useTemplatesCertificados } from '../hooks/useTemplatesCertificados'

export const TemplatesCertificadosPanel: React.FC = () => {
  const navigate = useNavigate()
  const { templates, isLoading, duplicandoId, excluir, duplicar } = useTemplatesCertificados()
  const [excluindoId, setExcluindoId] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Templates de certificado</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Monte o layout visual com textos, imagens e formas sobre um fundo opcional. Associe o template no cadastro do curso.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/certificados/templates/novo')}
          className="h-9 gap-2 rounded-full bg-indigo-600 px-4 font-bold hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Novo template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-2 border-dashed border-zinc-200 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-zinc-900">Nenhum template ainda</p>
            <p className="mt-1 max-w-sm text-xs text-zinc-500">
              Crie um template para personalizar o certificado dos cursos da escola.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden border-zinc-200 shadow-none">
              <CardContent className="p-0">
                {urlArquivoPublico(template.fundo_url ?? template.fundo_path) ? (
                  <img
                    src={urlArquivoPublico(template.fundo_url ?? template.fundo_path) ?? undefined}
                    alt=""
                    className="h-28 w-full border-b border-zinc-100 object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center border-b border-zinc-100 bg-zinc-50 text-zinc-300">
                    <FileText className="h-8 w-8" />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{template.nome}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-400">
                      {template.fundo_url ? 'Com fundo' : 'Sem fundo'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      title="Editar"
                      onClick={() => navigate(`/certificados/templates/${template.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      title="Duplicar"
                      disabled={duplicandoId === template.id}
                      onClick={() => void duplicar(template.id)}
                    >
                      {duplicandoId === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Remover"
                      onClick={() => setExcluindoId(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={excluindoId !== null}
        onOpenChange={(open) => !open && setExcluindoId(null)}
        onConfirm={async () => {
          if (!excluindoId) return
          const ok = await excluir(excluindoId)
          if (ok) setExcluindoId(null)
        }}
        title="Remover template?"
        description="Cursos que usam este template ficarão sem associação. Certificados já emitidos não são alterados."
      />
    </div>
  )
}
