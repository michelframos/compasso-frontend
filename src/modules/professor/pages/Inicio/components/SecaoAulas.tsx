import React from 'react'
import { AulaCard } from '../../../components/AulaCard'
import type { AulaDoProfessor } from '../../../types'

interface SecaoAulasProps {
  titulo: string
  aulas: AulaDoProfessor[]
  vazio: string
  mostrarData?: boolean
  textoChamada?: string
  rodape?: string
  onChamada?: (aula: AulaDoProfessor) => void
  onAlterar?: (aula: AulaDoProfessor) => void
}

export const SecaoAulas: React.FC<SecaoAulasProps> = ({
  titulo,
  aulas,
  vazio,
  mostrarData,
  textoChamada,
  rodape,
  onChamada,
  onAlterar,
}) => (
  <section className="space-y-3">
    <h2 className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">{titulo}</h2>
    {aulas.length === 0 ? (
      <p className="text-sm text-zinc-400 bg-white rounded-2xl border border-dashed border-zinc-200 p-4 text-center">{vazio}</p>
    ) : (
      <div className="space-y-2">
        {aulas.map((aula) => (
          <AulaCard
            key={aula.id}
            aula={aula}
            mostrarData={mostrarData}
            textoChamada={textoChamada}
            onChamada={onChamada}
            onAlterar={onAlterar}
          />
        ))}
      </div>
    )}
    {rodape && <p className="text-[11px] text-zinc-400">{rodape}</p>}
  </section>
)
