import React from 'react'
import { Building2, Loader2, Music2 } from 'lucide-react'
import { useSelecionarInstituicao } from './hooks/useSelecionarInstituicao'
import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'

export const SelecionarInstituicaoPage: React.FC = () => {
  const { tenants, error, loadingSlug, handleSelect } = useSelecionarInstituicao()

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-100">
            <Music2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Selecione a instituição</h1>
          <p className="text-zinc-500 text-sm">
            Sua conta está vinculada a mais de uma escola. Escolha qual deseja acessar.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {tenants.map((instituicao) => (
            <Button
              key={instituicao.id}
              variant="outline"
              className="w-full h-auto py-4 px-5 flex items-center justify-between rounded-2xl border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
              onClick={() => handleSelect(instituicao)}
              disabled={loadingSlug !== null}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">{instituicao.nome_fantasia}</p>
                  {instituicao.razao_social && (
                    <p className="text-xs text-zinc-500 mt-0.5">{instituicao.razao_social}</p>
                  )}
                </div>
              </div>
              {loadingSlug === instituicao.slug && (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              )}
            </Button>
          ))}
        </div>

        <p className="text-center text-sm text-zinc-500">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
