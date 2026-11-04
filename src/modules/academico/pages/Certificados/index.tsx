import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, FileText } from 'lucide-react'
import { EmitirCertificadosPanel } from './components/EmitirCertificadosPanel'
import { TemplatesCertificadosPanel } from './components/TemplatesCertificadosPanel'

type Aba = 'emitir' | 'templates'

function abaFromParam(valor: string | null): Aba {
  return valor === 'templates' ? 'templates' : 'emitir'
}

export const CertificadosPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
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
          Emita para matrículas completadas com frequência mínima e personalize os templates.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-100">
        <button
          type="button"
          onClick={() => trocarAba('emitir')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold transition-all hover:cursor-pointer ${
            aba === 'emitir'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Check className="h-4 w-4" />
          Emitir
        </button>
        <button
          type="button"
          onClick={() => trocarAba('templates')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold transition-all hover:cursor-pointer ${
            aba === 'templates'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <FileText className="h-4 w-4" />
          Templates
        </button>
      </div>

      {aba === 'templates' ? <TemplatesCertificadosPanel /> : <EmitirCertificadosPanel />}
    </div>
  )
}
