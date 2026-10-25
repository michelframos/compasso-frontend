import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import type { AlvoAviso } from './fontes'

interface AlunosChecklistProps {
  alunos: AlvoAviso[]
  selecionados: number[]
  onChange: (ids: number[]) => void
  disabled?: boolean
}

export const AlunosChecklist: React.FC<AlunosChecklistProps> = ({ alunos, selecionados, onChange, disabled }) => {
  const [busca, setBusca] = useState('')
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const visiveis = termo ? alunos.filter((a) => a.nome.toLocaleLowerCase('pt-BR').includes(termo)) : alunos
  const marcado = new Set(selecionados)

  const alternar = (id: number) => onChange(marcado.has(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id])

  if (alunos.length === 0) {
    return <p className="text-xs text-zinc-500 ml-1">Nenhum aluno com matrícula ativa.</p>
  }

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden">
      {alunos.length > 6 && (
        <div className="relative border-b border-zinc-100">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar aluno"
            aria-label="Buscar aluno"
            className="h-10 border-0 rounded-none pl-9 focus-visible:ring-0"
          />
        </div>
      )}
      <ul className="max-h-48 overflow-y-auto divide-y divide-zinc-100">
        {visiveis.map((aluno) => (
          <li key={aluno.id}>
            <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:cursor-pointer">
              <Checkbox checked={marcado.has(aluno.id)} onCheckedChange={() => alternar(aluno.id)} disabled={disabled} />
              {aluno.nome}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 text-[11px] font-bold text-zinc-500">
        <span>{selecionados.length} selecionado(s)</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(selecionados.length === alunos.length ? [] : alunos.map((a) => a.id))}
          className="text-indigo-600 hover:underline hover:cursor-pointer"
        >
          {selecionados.length === alunos.length ? 'Limpar' : 'Marcar todos'}
        </button>
      </div>
    </div>
  )
}
