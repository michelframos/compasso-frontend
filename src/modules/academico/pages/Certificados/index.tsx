import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Award, Check, FileText } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useCertificados } from './hooks/useCertificados'
import { TemplatesCertificadosPanel } from './components/TemplatesCertificadosPanel'

function nomeAluno(aluno: { usuario?: { nome?: string } | null; nome?: string } | null | undefined) {
  return aluno?.usuario?.nome ?? aluno?.nome ?? 'Aluno'
}

function carga(valor: number | null) {
  if (valor === null) return '—'
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`
}

type Aba = 'emitir' | 'templates'

function abaFromParam(valor: string | null): Aba {
  return valor === 'templates' ? 'templates' : 'emitir'
}

export const CertificadosPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { certificados, elegiveis, isLoading, emitindoId, emitir } = useCertificados()
  const [aba, setAba] = useState<Aba>(() => abaFromParam(searchParams.get('aba')))

  useEffect(() => {
    setAba(abaFromParam(searchParams.get('aba')))
  }, [searchParams])

  const trocarAba = (proxima: Aba) => {
    setAba(proxima)
    if (proxima === 'templates') {
      setSearchParams({ aba: 'templates' }, { replace: true })
      return
    }
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Certificados de <span className="text-indigo-600">conclusão</span>
        </h1>
        <p className="mt-1 text-[14px] text-zinc-500">
          Emita para matrículas completadas com pelo menos 75% de presença e personalize os templates.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-100">
        <button
          type="button"
          onClick={() => trocarAba('emitir')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${
            aba === 'emitir'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Check className="w-4 h-4" />
          Emitir
        </button>
        <button
          type="button"
          onClick={() => trocarAba('templates')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${
            aba === 'templates'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          Templates
        </button>
      </div>

      {aba === 'templates' ? (
        <TemplatesCertificadosPanel />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-zinc-900">Prontas para emitir</h2>
            {elegiveis.length === 0 ? (
              <Card className="border-2 border-dashed border-zinc-200 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-zinc-900">Nenhuma matrícula elegível</p>
                  <p className="mt-1 max-w-sm text-xs text-zinc-500">
                    Só entram matrículas com status Completada e frequência mínima.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {elegiveis.map((matricula) => (
                  <Card key={matricula.id} className="border-zinc-200 shadow-none">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{nomeAluno(matricula.aluno)}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {matricula.turma?.curso?.nome ?? matricula.curso?.nome ?? 'Curso'}
                          {matricula.turma?.descricao ? ` · ${matricula.turma.descricao}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={emitindoId === matricula.id}
                        onClick={() => void emitir(matricula.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        {emitindoId === matricula.id ? 'Emitindo...' : 'Emitir'}
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-zinc-900">Já emitidos</h2>
            {certificados.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum certificado emitido ainda.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {certificados.map((certificado) => (
                  <Card key={certificado.id} className="border-zinc-200 shadow-none">
                    <CardContent className="space-y-1 p-4">
                      <p className="text-sm font-bold text-zinc-900">{certificado.aluno?.nome ?? 'Aluno'}</p>
                      <p className="text-xs text-zinc-500">
                        {[certificado.curso, certificado.turma, certificado.nivel, carga(certificado.carga_horaria)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        {certificado.codigo_verificacao}
                        {certificado.emitido_em ? ` · ${certificado.emitido_em}` : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
