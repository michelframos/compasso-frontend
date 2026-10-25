import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { AcaoProfessorAula, ModoPermissaoAula } from '../../../types'
import { LIMITE_MAXIMO, LIMITE_MINIMO, useComunicacaoProfessor } from '../hooks/useComunicacaoProfessor'
import { usePermissoesProfessor } from '../hooks/usePermissoesProfessor'

const ACOES: { acao: AcaoProfessorAula; titulo: string; descricao: string }[] = [
  { acao: 'criar', titulo: 'Criar aulas', descricao: 'Agendar aulas extras, de reforço ou individuais.' },
  { acao: 'editar', titulo: 'Alterar aulas', descricao: 'Remarcar (reposição), mudar horário ou passar a aula a um substituto.' },
  { acao: 'excluir', titulo: 'Cancelar aulas', descricao: 'Cancelar ou excluir aulas agendadas.' },
]

const MODOS: { modo: ModoPermissaoAula; label: string; ativo: string }[] = [
  { modo: 'livre', label: 'Livre', ativo: 'bg-emerald-600 text-white border-emerald-600' },
  { modo: 'aprovacao', label: 'Com aprovação', ativo: 'bg-amber-500 text-white border-amber-500' },
  { modo: 'bloqueado', label: 'Bloqueado', ativo: 'bg-rose-600 text-white border-rose-600' },
]

export const PermissoesProfessorTab: React.FC = () => {
  const { permissoes, isLoading, alterando, alterar } = usePermissoesProfessor()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando permissões...</span>
      </div>
    )
  }

  if (!permissoes) return null

  return (
    <div className="p-6 space-y-4">
      <section className="space-y-1">
        <h2 className="text-base font-bold text-zinc-900">O que os professores podem fazer com as aulas</h2>
        <p className="text-sm text-zinc-500">
          <strong className="text-zinc-700">Livre:</strong> o professor faz direto.{' '}
          <strong className="text-zinc-700">Com aprovação:</strong> vira uma solicitação na fila da secretaria.{' '}
          <strong className="text-zinc-700">Bloqueado:</strong> só a secretaria faz.
        </p>
      </section>

      <div className="divide-y divide-zinc-100">
        {ACOES.map(({ acao, titulo, descricao }) => (
          <div key={acao} className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900">{titulo}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{descricao}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0" role="radiogroup" aria-label={titulo}>
              {alterando === acao && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
              {MODOS.map(({ modo, label, ativo }) => {
                const selecionado = permissoes[acao] === modo
                return (
                  <button
                    key={modo}
                    type="button"
                    role="radio"
                    aria-checked={selecionado}
                    disabled={alterando !== null}
                    onClick={() => alterar(acao, modo)}
                    className={`px-3 h-8 rounded-full border text-xs font-bold transition-all hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      selecionado ? ativo : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <LimiteAvisosSecao />
    </div>
  )
}

const LimiteAvisosSecao: React.FC = () => {
  const { carregado, limite, setLimite, valido, alterado, salvando, salvar } = useComunicacaoProfessor()

  if (!carregado) return null

  return (
    <section className="border-t border-zinc-100 pt-6 space-y-3">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-zinc-900">Avisos a alunos e responsáveis</h2>
        <p className="text-sm text-zinc-500">
          Quantos avisos por e-mail ou WhatsApp cada professor pode enviar por dia. Os avisos automáticos de aulas canceladas ou remarcadas não contam.
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="limite-avisos" className="text-xs font-bold text-zinc-600 ml-1">Avisos por professor por dia</Label>
          <Input
            id="limite-avisos"
            type="number"
            min={LIMITE_MINIMO}
            max={LIMITE_MAXIMO}
            value={limite}
            disabled={salvando}
            onChange={(e) => setLimite(e.target.value)}
            className={`h-10 w-32 rounded-xl ${valido ? 'border-zinc-200' : 'border-rose-500'}`}
          />
        </div>
        <Button
          type="submit"
          disabled={!alterado || salvando}
          className="h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold px-5 hover:cursor-pointer"
        >
          {salvando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Salvar
        </Button>
        {!valido && <p className="w-full text-[11px] text-rose-500 ml-1">Informe um número de {LIMITE_MINIMO} a {LIMITE_MAXIMO}.</p>}
      </form>
    </section>
  )
}
