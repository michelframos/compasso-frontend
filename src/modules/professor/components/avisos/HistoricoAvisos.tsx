import React from 'react'
import { Inbox, Loader2, Megaphone, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import type { AvisosApi } from '../../api/avisos'
import { AvisoCard } from './AvisoCard'
import { AvisoDetalheDialog } from './AvisoDetalheDialog'
import type { FontesAviso } from './fontes'
import { NovoAvisoDialog } from './NovoAvisoDialog'
import { useHistoricoAvisos, type FiltroOrigemAviso } from './useHistoricoAvisos'

const FILTROS: { valor: FiltroOrigemAviso; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'manual', label: 'Avisos' },
  { valor: 'aula_alterada', label: 'Aulas alteradas' },
]

interface HistoricoAvisosProps {
  api: AvisosApi
  fontes: FontesAviso
  descricao: string
  /** Na visão da secretaria, mostra quem enviou cada aviso. */
  mostrarAutor?: boolean
}

export const HistoricoAvisos: React.FC<HistoricoAvisosProps> = ({ api, fontes, descricao, mostrarAutor = false }) => {
  const { avisos, pagina, origem, setOrigem, busca, setBusca, isLoading, opcoes, irParaPagina, recarregar, emDetalhe, setEmDetalhe, criando, setCriando } =
    useHistoricoAvisos(api)
  const limite = opcoes?.limite

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            <span className="text-indigo-600">Avisos</span> a alunos e responsáveis
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">{descricao}</p>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-1">
          <Button
            type="button"
            onClick={() => setCriando(true)}
            disabled={limite?.restantes === 0}
            className="h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 px-5 hover:cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Novo aviso
          </Button>
          {limite && (
            <span className="text-[11px] text-zinc-500">
              {limite.enviados_hoje} de {limite.por_dia} avisos enviados hoje
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.valor}
              type="button"
              onClick={() => setOrigem(filtro.valor)}
              className={`px-4 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer ${
                origem === filtro.valor ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={mostrarAutor ? 'Buscar por título ou autor' : 'Buscar por título'}
            aria-label="Buscar avisos"
            className="h-9 rounded-full border-zinc-200 pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : avisos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200">
          <Inbox className="w-8 h-8 text-zinc-300 mb-3" />
          <p className="font-bold text-zinc-900">Nenhum aviso</p>
          <p className="text-sm text-zinc-500 max-w-xs mt-1">
            Use “Novo aviso” para mandar um recado por e-mail ou WhatsApp. Cancelamentos e remarcações de aula também aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {avisos.map((aviso) => (
            <AvisoCard key={aviso.id} aviso={aviso} mostrarAutor={mostrarAutor} onAbrir={setEmDetalhe} />
          ))}
        </div>
      )}

      {pagina.ultima > 1 && <PaginationCustom currentPage={pagina.atual} lastPage={pagina.ultima} onPageChange={irParaPagina} isLoading={isLoading} />}

      <NovoAvisoDialog aberto={criando} api={api} fontes={fontes} onFechar={() => setCriando(false)} onConcluido={recarregar} />
      <AvisoDetalheDialog aviso={emDetalhe} api={api} onFechar={() => setEmDetalhe(null)} />
    </div>
  )
}
