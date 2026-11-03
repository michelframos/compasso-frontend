import React, { useState } from 'react'
import { Award, Edit, FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { urlArquivoPublico } from '@/shared/lib/storageUrl'
import type { TemplateCertificado } from '../../../api/templatesCertificados'
import { useTemplatesCertificados } from '../hooks/useTemplatesCertificados'
import { TemplateCertificadoForm } from './TemplateCertificadoForm'

export const TemplatesCertificadosPanel: React.FC = () => {
  const { templates, isLoading, salvando, salvar, excluir } = useTemplatesCertificados()
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<TemplateCertificado | null>(null)
  const [excluindoId, setExcluindoId] = useState<number | null>(null)

  const abrirNovo = () => {
    setEditando(null)
    setAberto(true)
  }

  const abrirEdicao = (template: TemplateCertificado) => {
    setEditando(template)
    setAberto(true)
  }

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
          onClick={abrirNovo}
          className="rounded-full h-9 px-4 gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold"
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
            <Card key={template.id} className="border-zinc-200 shadow-none overflow-hidden">
              <CardContent className="p-0">
                {urlArquivoPublico(template.fundo_url ?? template.fundo_path) ? (
                  <img
                    src={urlArquivoPublico(template.fundo_url ?? template.fundo_path) ?? undefined}
                    alt=""
                    className="h-28 w-full object-cover border-b border-zinc-100"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-zinc-50 border-b border-zinc-100 text-zinc-300">
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
                      onClick={() => abrirEdicao(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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

      <Dialog
        open={aberto}
        onOpenChange={(open) => {
          setAberto(open)
          if (!open) setEditando(null)
        }}
      >
        <DialogContent className="flex h-[min(920px,94vh)] w-[min(1180px,96vw)] max-w-none flex-col overflow-hidden rounded-[28px] border-none bg-white p-0 text-zinc-900 shadow-2xl">
          <DialogHeader className="shrink-0 border-b border-indigo-100 bg-indigo-50/50 px-6 py-4 sm:px-8">
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-zinc-900 sm:text-xl">
              {editando ? (
                <>
                  <Edit className="h-5 w-5 text-indigo-600" />
                  Editar <span className="text-indigo-600">template</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Novo <span className="text-indigo-600">template</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              {editando?.nome
                ? `“${editando.nome}” · arraste elementos sobre o A4 paisagem`
                : 'Monte o certificado visualmente sobre o A4 paisagem'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {aberto ? (
              <TemplateCertificadoForm
                key={editando?.id ?? 'novo'}
                template={editando}
                salvando={salvando}
                onCancel={() => {
                  setAberto(false)
                  setEditando(null)
                }}
                onSave={async (payload, fundo, removerFundo) => {
                  const salvo = await salvar(payload, editando?.id, fundo, removerFundo)
                  if (salvo) {
                    setEditando(null)
                    setAberto(false)
                  }
                }}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

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
