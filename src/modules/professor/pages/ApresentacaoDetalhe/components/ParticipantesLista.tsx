import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Shirt, UserRound, Users } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { linkFichaAluno } from '../../../lib/formatters'
import type { ParticipanteApresentacao } from '../../../types'

export const ParticipantesLista: React.FC<{ participantes: ParticipanteApresentacao[] }> = ({ participantes }) => {
  const meus = participantes.filter((p) => p.meu_aluno).length

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Participantes</h2>
              <p className="text-xs text-zinc-500">
                {participantes.length} {participantes.length === 1 ? 'aluno' : 'alunos'}
                {meus > 0 && ` · ${meus} ${meus === 1 ? 'é seu' : 'são seus'}`}
              </p>
            </div>
          </div>
        </div>

        {participantes.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">Nenhum aluno escalado ainda.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {participantes.map((participante) => {
              const nome = participante.nome ?? 'Aluno'

              return (
                <li key={participante.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                      participante.meu_aluno ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-400'
                    }`}
                  >
                    <UserRound className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {participante.meu_aluno ? (
                      <Link to={linkFichaAluno(participante.id_aluno)} className="block text-sm font-bold text-zinc-900 truncate hover:text-indigo-600">
                        {nome}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-zinc-700 truncate">{nome}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
                      {participante.meu_aluno && <span className="font-bold text-indigo-600">Seu aluno</span>}
                      <span className="inline-flex items-center gap-1">
                        <Shirt className="w-3 h-3" />
                        {participante.papel ? `${participante.papel} · ` : ''}
                        {participante.tamanho_figurino ? `Tam. ${participante.tamanho_figurino}` : 'Tamanho não informado'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        participante.recebeu_figurino ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {participante.recebeu_figurino ? 'Figurino entregue' : 'Figurino pendente'}
                    </span>
                    {participante.presenca_ensaio_geral && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Ensaio geral
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
