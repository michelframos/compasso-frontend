import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { getErrorMessage } from '@/shared/lib/utils'
import { listProfessoresLivres, SOLICITACAO_TIPO, type DestinoCobranca, type ProfessorLivre, type SolicitacaoAula } from '@/modules/professor'
import type { DecisaoSolicitacaoPayload } from '../../../api/solicitacoesAulas'
import type { ModoDecisaoAula } from '../hooks/useSolicitacoesAulas'

interface DecisaoSolicitacaoDialogProps {
  solicitacao: SolicitacaoAula | null
  modo: ModoDecisaoAula
  isSaving: boolean
  onFechar: () => void
  onConfirmar: (payload: DecisaoSolicitacaoPayload) => void
}

const DIAS: Record<string, string> = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua', quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom',
}

const ROTULO = 'text-zinc-700 font-medium ml-1'
const opcaoClasse = (ativa: boolean) =>
  `w-full p-3 rounded-xl border text-left transition-all hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
    ativa ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
  }`

export const DecisaoSolicitacaoDialog: React.FC<DecisaoSolicitacaoDialogProps> = ({ solicitacao, modo, isSaving, onFechar, onConfirmar }) => {
  const [data, setData] = useState(solicitacao?.data_sugerida ?? '')
  const [inicio, setInicio] = useState(solicitacao?.hora_inicio_sugerida ?? '')
  const [termino, setTermino] = useState(solicitacao?.hora_termino_sugerida ?? '')
  const [substituto, setSubstituto] = useState(solicitacao?.substituto ? String(solicitacao.substituto.id) : '')
  const [destino, setDestino] = useState<DestinoCobranca | ''>(solicitacao?.destino_cobranca ?? '')
  const [motivo, setMotivo] = useState('')
  const [avisar, setAvisar] = useState(solicitacao?.avisar_alunos ?? true)
  const [erro, setErro] = useState<string | null>(null)
  const [professores, setProfessores] = useState<ProfessorLivre[] | null>(null)

  const aprovando = modo === 'aprovada'
  const tipo = solicitacao?.tipo
  const aula = solicitacao?.aula ?? null
  const analise = solicitacao?.analise
  const novoHorario = tipo === 'reposicao' || tipo === 'criacao'
  const pedeCobranca = !!analise?.tem_cobranca && (tipo === 'cancelamento' || tipo === 'reposicao')
  const alteraAula = tipo === 'cancelamento' || tipo === 'reposicao' || tipo === 'substituicao'

  useEffect(() => {
    if (!aprovando || tipo !== 'substituicao' || !aula) return
    let cancelled = false

    listProfessoresLivres({ data: aula.data, hora_inicio: aula.hora_inicio, hora_termino: aula.hora_termino, ignorar_aula: aula.id })
      .then((lista) => {
        if (!cancelled) setProfessores(lista.filter((p) => p.id !== aula.professor?.id))
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar os professores.'))
      })

    return () => {
      cancelled = true
    }
  }, [aprovando, tipo, aula])

  const confirmar = () => {
    if (!solicitacao) return

    if (!aprovando) {
      if (!motivo.trim()) {
        setErro('Informe o motivo da rejeição para o professor.')
        return
      }
      onConfirmar({ decisao: 'rejeitada', motivo_decisao: motivo.trim() })
      return
    }

    if (novoHorario && (!data || !inicio || !termino)) {
      setErro('Informe a data e o horário da aula.')
      return
    }
    if (novoHorario && termino <= inicio) {
      setErro('O término deve ser depois do início.')
      return
    }
    if (tipo === 'substituicao' && !substituto) {
      setErro('Escolha o professor substituto.')
      return
    }
    if (pedeCobranca && !destino) {
      setErro('Escolha o destino da cobrança.')
      return
    }

    onConfirmar({
      decisao: 'aprovada',
      motivo_decisao: motivo.trim() || null,
      ...(novoHorario && { data_sugerida: data, hora_inicio_sugerida: inicio, hora_termino_sugerida: termino }),
      ...(tipo === 'substituicao' && { id_professor_substituto: Number(substituto) }),
      ...(pedeCobranca && destino && { destino_cobranca: destino }),
      ...(alteraAula && { avisar_alunos: avisar }),
    })
  }

  const limparErro = () => setErro(null)

  return (
    <CustomModalGlobal
      open={solicitacao !== null}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={confirmar}
      isLoading={isSaving}
      firsChunkTitle={aprovando ? 'Aprovar' : 'Rejeitar'}
      secondChunkTitle={tipo ? SOLICITACAO_TIPO[tipo].toLowerCase() : ''}
      colorSecondChunkTitle={aprovando ? 'text-emerald-600' : 'text-rose-500'}
      titleDescription={solicitacao?.professor?.nome ? `Pedido de ${solicitacao.professor.nome}` : ''}
      textConfirmButton={aprovando ? 'Aprovar e aplicar' : 'Rejeitar'}
    >
      {solicitacao && (
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
          {aula && (
            <p className="text-sm text-zinc-600 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-semibold text-zinc-800">{aula.titulo}</span>
              {aula.aluno && ` — ${aula.aluno}`} · {format(new Date(`${aula.data}T00:00:00`), 'dd/MM')} · {aula.hora_inicio}–{aula.hora_termino}
              {aula.professor && ` · Prof. ${aula.professor.nome}`}
            </p>
          )}

          {aprovando && (analise?.avisos.length ?? 0) > 0 && (
            <ul className="space-y-1 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {analise!.avisos.map((aviso) => (
                <li key={aviso} className="flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {aviso}
                </li>
              ))}
            </ul>
          )}

          {aprovando && novoHorario && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="data-decisao" className={ROTULO}>{tipo === 'reposicao' ? 'Data da reposição' : 'Data da aula'} *</Label>
                <Input
                  id="data-decisao"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={data}
                  disabled={isSaving}
                  onChange={(e) => { setData(e.target.value); limparErro() }}
                  className="h-11 rounded-xl border-zinc-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inicio-decisao" className={ROTULO}>Início *</Label>
                  <Input id="inicio-decisao" type="time" value={inicio} disabled={isSaving} onChange={(e) => { setInicio(e.target.value); limparErro() }} className="h-11 rounded-xl border-zinc-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termino-decisao" className={ROTULO}>Término *</Label>
                  <Input id="termino-decisao" type="time" value={termino} disabled={isSaving} onChange={(e) => { setTermino(e.target.value); limparErro() }} className="h-11 rounded-xl border-zinc-200" />
                </div>
              </div>
            </div>
          )}

          {aprovando && tipo === 'substituicao' && (
            <div className="space-y-2">
              <Label className={ROTULO}>Professor substituto *</Label>
              <Select value={substituto} onValueChange={(v) => { setSubstituto(v); limparErro() }} disabled={isSaving || professores === null}>
                <SelectTrigger className="h-11 rounded-xl border-zinc-200">
                  <SelectValue placeholder={professores === null ? 'Carregando professores...' : 'Escolha o substituto'} />
                </SelectTrigger>
                <SelectContent>
                  {(professores ?? []).map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} disabled={p.conflito}>
                      {p.nome ?? `Professor #${p.id}`}
                      {p.conflito ? ' · já tem aula' : p.fora_disponibilidade ? ' · fora da disponibilidade' : ' · livre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {aprovando && analise && analise.disponibilidade.length > 0 && tipo !== 'substituicao' && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 ml-1">Disponibilidade do professor</p>
              <div className="flex flex-wrap gap-1.5">
                {analise.disponibilidade.map((j) => (
                  <span key={`${j.dia_semana}-${j.hora_inicio}`} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600">
                    {DIAS[j.dia_semana] ?? j.dia_semana} {j.hora_inicio}–{j.hora_termino}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aprovando && pedeCobranca && (
            <div className="space-y-2">
              <Label className={ROTULO}>Cobrança da aula *</Label>
              <button
                type="button"
                disabled={isSaving || (tipo === 'cancelamento' && !analise?.proxima_aula_cobranca)}
                onClick={() => { setDestino('proxima_aula'); limparErro() }}
                className={opcaoClasse(destino === 'proxima_aula')}
              >
                <p className="text-sm font-bold text-zinc-900">Vai para a próxima aula</p>
                <p className="text-[11px] text-zinc-500">
                  {tipo === 'reposicao' ? 'A cobrança passa para a aula de reposição.' : analise?.proxima_aula_cobranca ?? 'Não há próxima aula deste aluno sem cobrança.'}
                </p>
              </button>
              <button type="button" disabled={isSaving} onClick={() => { setDestino('cancelar'); limparErro() }} className={opcaoClasse(destino === 'cancelar')}>
                <p className="text-sm font-bold text-zinc-900">Cancelar a cobrança</p>
                <p className="text-[11px] text-zinc-500">Não é possível se ela já recebeu pagamento.</p>
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="motivo-decisao-aula" className={ROTULO}>{aprovando ? 'Observação (opcional)' : 'Motivo da rejeição *'}</Label>
            <Textarea
              id="motivo-decisao-aula"
              rows={3}
              maxLength={1000}
              value={motivo}
              disabled={isSaving}
              onChange={(e) => { setMotivo(e.target.value); limparErro() }}
              placeholder={aprovando ? 'Ex: Reposição combinada com a turma.' : 'Ex: Não há sala livre nesse horário.'}
              className="rounded-xl border-zinc-200 focus-visible:ring-indigo-600 resize-none"
            />
          </div>

          {aprovando && alteraAula && (
            <label className="flex items-start gap-2.5 ml-1 hover:cursor-pointer">
              <Checkbox checked={avisar} onCheckedChange={(v) => setAvisar(v === true)} disabled={isSaving} className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium text-zinc-700">Avisar os alunos</span>
                <span className="block text-[11px] text-zinc-500">Alunos e responsáveis recebem e-mail/WhatsApp com a mudança.</span>
              </span>
            </label>
          )}

          {erro && <p className="text-[12px] text-rose-500 ml-1">{erro}</p>}
        </div>
      )}
    </CustomModalGlobal>
  )
}
