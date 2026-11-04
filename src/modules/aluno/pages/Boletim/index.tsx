import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookOpen, Loader2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import type { AvaliacaoDoBoletim, MatriculaBoletim, ObservacaoDoBoletim } from '../../types'
import { useBoletim } from './hooks/useBoletim'

const TIPOS_AVALIACAO: Record<string, string> = {
  pratica: 'Prática',
  teorica: 'Teórica',
  apresentacao: 'Apresentação',
  participacao: 'Participação',
  outra: 'Outra',
}

const TIPOS_OBSERVACAO: Record<string, string> = {
  comportamento: 'Comportamento',
  evolucao: 'Evolução',
  alerta: 'Alerta',
  geral: 'Geral',
}

const CONCEITOS: Record<string, string> = {
  excelente: 'Excelente',
  bom: 'Bom',
  regular: 'Regular',
  insuficiente: 'Insuficiente',
}

function dataCurta(valor: string | null) {
  if (!valor) return null
  return format(new Date(`${valor}T00:00:00`), "d 'de' MMM", { locale: ptBR })
}

function Avaliacao({ item }: { item: AvaliacaoDoBoletim }) {
  const nota = item.nota !== null ? item.nota.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : null
  const conceito = item.conceito ? CONCEITOS[item.conceito] ?? item.conceito : null

  return (
    <li className="space-y-1 border-b border-zinc-100 py-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{TIPOS_AVALIACAO[item.tipo] ?? item.tipo}</p>
          <p className="text-xs text-zinc-500">
            {[dataCurta(item.data), item.professor].filter(Boolean).join(' · ')}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold text-indigo-600">
          {[nota, conceito].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      {item.comentario && <p className="text-sm text-zinc-600">{item.comentario}</p>}
    </li>
  )
}

function Observacao({ item }: { item: ObservacaoDoBoletim }) {
  return (
    <li className="space-y-1 border-b border-zinc-100 py-3 last:border-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
        {TIPOS_OBSERVACAO[item.tipo] ?? item.tipo}
      </p>
      <p className="text-sm text-zinc-800">{item.texto}</p>
      <p className="text-xs text-zinc-500">
        {[dataCurta(item.data), item.professor].filter(Boolean).join(' · ')}
      </p>
    </li>
  )
}

function MatriculaCard({ grupo }: { grupo: MatriculaBoletim }) {
  const vazia = grupo.avaliacoes.length === 0 && grupo.observacoes.length === 0

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
      <div>
        <h2 className="text-base font-bold text-zinc-900">{grupo.nome}</h2>
        {grupo.curso && grupo.curso !== grupo.nome && <p className="mt-0.5 text-sm text-zinc-500">{grupo.curso}</p>}
        {grupo.nivel && (
          <p className="mt-2 text-sm text-zinc-700">
            Nível atual: <span className="font-bold text-indigo-600">{grupo.nivel.nome}</span>
          </p>
        )}
      </div>

      {vazia ? (
        <p className="text-sm text-zinc-500">Ainda não há avaliações nem feedback nesta matrícula.</p>
      ) : (
        <>
          {grupo.avaliacoes.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Avaliações</h3>
              <ul>
                {grupo.avaliacoes.map((item) => (
                  <Avaliacao key={item.id} item={item} />
                ))}
              </ul>
            </div>
          )}
          {grupo.observacoes.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Feedback do professor</h3>
              <ul>
                {grupo.observacoes.map((item) => (
                  <Observacao key={item.id} item={item} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export const BoletimPage: React.FC = () => {
  const [idMatricula, setIdMatricula] = useState<number | null>(null)
  const { boletim, isLoading, aguardandoDependente } = useBoletim(null)

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Boletim</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver o boletim dele.</p>
      </section>
    )
  }

  const matriculas = boletim?.matriculas ?? []
  const selecionada = idMatricula === null ? null : matriculas.find((item) => item.id_matricula === idMatricula) ?? null
  const visiveis = selecionada ? [selecionada] : matriculas
  const comFiltro = matriculas.filter((item) => item.id_matricula !== null)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Boletim</h1>
        <p className="mt-1 text-sm text-zinc-500">Nível, avaliações e o feedback que o professor liberou.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : matriculas.length === 0 ? (
        <NoData
          title="Nenhuma matrícula"
          description="O boletim aparece aqui quando houver uma turma."
          icon={<BookOpen className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <>
          {comFiltro.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setIdMatricula(null)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  idMatricula === null ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                }`}
              >
                Todas
              </button>
              {comFiltro.map((grupo) => (
                <button
                  key={grupo.id_matricula ?? grupo.nome}
                  type="button"
                  onClick={() => setIdMatricula(grupo.id_matricula)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    idMatricula === grupo.id_matricula
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                  }`}
                >
                  {grupo.nome}
                </button>
              ))}
            </div>
          )}
          {visiveis.map((grupo) => (
            <MatriculaCard key={grupo.id_matricula ?? grupo.nome} grupo={grupo} />
          ))}
        </>
      )}
    </div>
  )
}
