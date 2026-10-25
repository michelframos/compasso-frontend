import React, { useState } from 'react'
import { AlertTriangle, ArrowRight, Check } from 'lucide-react'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { ModoDecisao } from '../hooks/useProgressoes'
import type { DecisaoProgressaoPayload, SugestaoProgressao } from '../types'

interface DecisaoProgressaoDialogProps {
  sugestao: SugestaoProgressao | null
  modo: ModoDecisao
  isSaving: boolean
  onFechar: () => void
  onConfirmar: (payload: DecisaoProgressaoPayload) => void
}

export const DecisaoProgressaoDialog: React.FC<DecisaoProgressaoDialogProps> = ({
  sugestao,
  modo,
  isSaving,
  onFechar,
  onConfirmar,
}) => {
  const [idTurmaDestino, setIdTurmaDestino] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const aprovando = modo === 'aprovada'
  const porTurma = sugestao?.matricula?.tipo === 'turma'
  const turmas = sugestao?.turmas_destino ?? []

  const confirmar = () => {
    if (!sugestao) return
    if (aprovando && porTurma && !idTurmaDestino) {
      setErro(turmas.length === 0 ? 'Crie uma turma no nível sugerido antes de aprovar.' : 'Escolha a turma de destino.')
      return
    }
    if (!aprovando && !motivo.trim()) {
      setErro('Informe o motivo da rejeição para o professor.')
      return
    }

    onConfirmar({
      decisao: modo,
      id_turma_destino: aprovando && porTurma ? idTurmaDestino : null,
      motivo_decisao: motivo.trim() || null,
    })
  }

  return (
    <CustomModalGlobal
      open={sugestao !== null}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={confirmar}
      isLoading={isSaving}
      firsChunkTitle={aprovando ? 'Aprovar' : 'Rejeitar'}
      secondChunkTitle="progressão"
      colorSecondChunkTitle={aprovando ? 'text-emerald-600' : 'text-rose-500'}
      titleDescription={sugestao?.aluno?.nome ?? ''}
      textConfirmButton={aprovando ? 'Aprovar' : 'Rejeitar'}
    >
      {sugestao && (
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-sm font-bold text-zinc-800">
            {sugestao.nivel_atual?.nome ?? 'Nível atual'}
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            {sugestao.nivel_sugerido?.nome}
          </div>

          {aprovando && !porTurma && (
            <p className="text-sm text-zinc-600">
              O nível da matrícula individual em <span className="font-semibold">{sugestao.matricula?.curso?.nome}</span> passará
              a ser <span className="font-semibold">{sugestao.nivel_sugerido?.nome}</span>.
            </p>
          )}

          {aprovando && porTurma && (
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium ml-1">Turma de destino *</Label>
              <p className="text-xs text-zinc-500 ml-1">
                O aluno será transferido da turma {sugestao.matricula?.turma?.descricao ?? `#${sugestao.matricula?.turma?.id}`} e a
                transferência fica registrada no histórico da matrícula.
              </p>
              {turmas.length === 0 ? (
                <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Não há turmas abertas de {sugestao.matricula?.curso?.nome} no nível {sugestao.nivel_sugerido?.nome}.
                </div>
              ) : (
                <div className="space-y-2">
                  {turmas.map((turma) => {
                    const lotada = turma.alunos_vigentes >= turma.maximo_alunos
                    const ativa = idTurmaDestino === turma.id
                    return (
                      <button
                        key={turma.id}
                        type="button"
                        disabled={lotada || isSaving}
                        onClick={() => {
                          setIdTurmaDestino(turma.id)
                          setErro(null)
                        }}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                          ativa ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">
                            {turma.descricao || `${turma.curso ?? ''} · ${turma.nivel ?? ''}`}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Prof. {turma.professor ?? '—'} · {turma.alunos_vigentes}/{turma.maximo_alunos} alunos
                            {lotada && ' · lotada'}
                          </p>
                        </div>
                        {ativa && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="motivo-decisao" className="text-zinc-700 font-medium ml-1">
              {aprovando ? 'Observação (opcional)' : 'Motivo da rejeição *'}
            </Label>
            <Textarea
              id="motivo-decisao"
              rows={4}
              maxLength={2000}
              value={motivo}
              disabled={isSaving}
              onChange={(e) => {
                setMotivo(e.target.value)
                setErro(null)
              }}
              placeholder={aprovando ? 'Ex: Aprovado após conversa com a família.' : 'Ex: Aguardar o fim do semestre.'}
              className="rounded-xl border-zinc-200 focus-visible:ring-indigo-600 resize-none"
            />
          </div>

          {erro && <p className="text-[12px] text-rose-500 ml-1">{erro}</p>}
        </div>
      )}
    </CustomModalGlobal>
  )
}
