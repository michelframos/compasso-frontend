import React, { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import type { ContratoDoAluno } from '../../types'
import { useMeusContratos } from './hooks/useMeusContratos'

export const MeusContratosPage: React.FC = () => {
  const { contratos, isLoading, aguardandoDependente, aceitandoId, baixandoId, aceitar, baixar } = useMeusContratos()
  const [aberto, setAberto] = useState<ContratoDoAluno | null>(null)

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Contratos</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver os contratos dele.</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Contratos</h1>
        <p className="mt-1 text-sm text-zinc-500">Leia, baixe e aceite os documentos da escola.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : contratos.length === 0 ? (
        <NoData
          title="Nenhum contrato"
          description="Quando a escola gerar um contrato, ele aparece aqui para leitura e aceite."
          icon={<FileText className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="space-y-3">
          {contratos.map((contrato) => (
            <article key={contrato.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-zinc-900">{contrato.nome || 'Contrato'}</h2>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    contrato.aceito ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {contrato.aceito ? 'Aceito' : 'Pendente'}
                </span>
              </div>
              {contrato.aceito_em && (
                <p className="mt-1 text-xs text-zinc-500">Aceito em {contrato.aceito_em.replace('T', ' ').slice(0, 16)}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setAberto(contrato)}>
                  Ler
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={baixandoId === contrato.id}
                  onClick={() => void baixar(contrato.id)}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  {baixandoId === contrato.id ? 'Baixando...' : 'PDF'}
                </Button>
                {!contrato.aceito && (
                  <Button
                    type="button"
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={aceitandoId === contrato.id}
                    onClick={() => void aceitar(contrato.id)}
                  >
                    {aceitandoId === contrato.id ? 'Aceitando...' : 'Li e aceito'}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={aberto !== null} onOpenChange={(abertoDialog) => !abertoDialog && setAberto(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{aberto?.nome || 'Contrato'}</DialogTitle>
            <DialogDescription>Documento gerado pela escola.</DialogDescription>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none text-sm text-zinc-700"
            dangerouslySetInnerHTML={{ __html: aberto?.contrato_gerado || '<p>Este contrato não tem conteúdo.</p>' }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
