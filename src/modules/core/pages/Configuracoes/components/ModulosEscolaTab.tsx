import React from 'react'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/shared/components/ui/switch'
import type { ModuloEscola } from '../../../types'
import { useModulosEscola } from '../hooks/useModulosEscola'

const SELO = 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0'

const Situacao: React.FC<{ modulo: ModuloEscola }> = ({ modulo }) => {
  if (!modulo.contratado) return <span className={`${SELO} bg-zinc-100 text-zinc-500`}>Não incluso no plano</span>
  if (!modulo.desativavel) return <span className={`${SELO} bg-emerald-50 text-emerald-700`}>Sempre ativo</span>
  return null
}

export const ModulosEscolaTab: React.FC = () => {
  const { modulos, isLoading, alterando, alternar } = useModulosEscola()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando módulos...</span>
      </div>
    )
  }

  const opcionais = modulos.filter((m) => m.desativavel)
  const demais = modulos.filter((m) => !m.desativavel)

  const linha = (modulo: ModuloEscola) => {
    const podeAlternar = modulo.desativavel && modulo.contratado
    return (
      <div key={modulo.key} className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900">{modulo.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{modulo.descricao}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Situacao modulo={modulo} />
          {podeAlternar && (
            <>
              {alterando === modulo.key && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
              <Switch
                checked={modulo.ativo}
                disabled={alterando !== null}
                onCheckedChange={(ativo) => alternar(modulo, ativo)}
                aria-label={`${modulo.ativo ? 'Desativar' : 'Ativar'} ${modulo.label}`}
                className="data-[state=checked]:bg-indigo-600"
              />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <section className="space-y-1">
        <h2 className="text-base font-bold text-zinc-900">Recursos opcionais</h2>
        <p className="text-sm text-zinc-500">
          Escolha com quais recursos a escola trabalha. Desativar apenas oculta o recurso para professores e secretaria;
          nenhum dado é apagado e tudo volta ao reativar.
        </p>
        <div className="divide-y divide-zinc-100">{opcionais.map(linha)}</div>
      </section>

      <section className="space-y-1">
        <h2 className="text-base font-bold text-zinc-900">Módulos do plano</h2>
        <p className="text-sm text-zinc-500">Definidos pela assinatura da escola.</p>
        <div className="divide-y divide-zinc-100">{demais.map(linha)}</div>
      </section>
    </div>
  )
}
