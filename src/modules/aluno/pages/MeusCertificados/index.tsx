import React from 'react'
import { Award, Download, Loader2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { Button } from '@/shared/components/ui/button'
import { useMeusCertificados } from './hooks/useMeusCertificados'

function carga(valor: number | null) {
  if (valor === null) return '—'
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`
}

export const MeusCertificadosPage: React.FC = () => {
  const { certificados, isLoading, aguardandoDependente, baixandoId, baixar } = useMeusCertificados()

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Certificados</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver os certificados dele.</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Certificados</h1>
        <p className="mt-1 text-sm text-zinc-500">Baixe o PDF dos certificados emitidos pela escola.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : certificados.length === 0 ? (
        <NoData
          title="Nenhum certificado"
          description="Quando a escola emitir o certificado de conclusão, ele aparece aqui."
          icon={<Award className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="space-y-3">
          {certificados.map((certificado) => (
            <article key={certificado.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h2 className="text-base font-bold text-zinc-900">
                {certificado.curso ?? certificado.turma ?? 'Certificado de conclusão'}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {[
                  certificado.turma,
                  certificado.nivel ? `Nível ${certificado.nivel}` : null,
                  carga(certificado.carga_horaria),
                  certificado.emitido_em ? `emitido em ${certificado.emitido_em.replace('T', ' ').slice(0, 16)}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Código {certificado.codigo_verificacao}
              </p>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={baixandoId === certificado.id}
                  onClick={() => void baixar(certificado.id)}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  {baixandoId === certificado.id ? 'Baixando...' : 'PDF'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
