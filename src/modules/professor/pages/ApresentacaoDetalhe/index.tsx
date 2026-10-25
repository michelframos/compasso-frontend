import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, CalendarClock, CalendarDays, Hash, Loader2, MapPin, Plus, Timer } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { EnsaioFormDialog } from '../../components/ensaios/EnsaioFormDialog'
import { EnsaioItem } from '../../components/ensaios/EnsaioItem'
import { ESPETACULO_STATUS } from '../../constants'
import { dataLocal, hora, nomeTurma } from '../../lib/formatters'
import { ParticipantesLista } from './components/ParticipantesLista'
import { useApresentacaoDetalhe } from './hooks/useApresentacaoDetalhe'

export const ApresentacaoDetalhePage: React.FC = () => {
  const {
    apresentacao,
    ensaios,
    hoje,
    isLoading,
    naoEncontrada,
    podeAgendar,
    formAberto,
    emEdicao,
    isSaving,
    novo,
    editar,
    fecharForm,
    salvar,
    paraExcluir,
    isDeleting,
    pedirExclusao,
    cancelarExclusao,
    confirmarExclusao,
  } = useApresentacaoDetalhe()

  const voltar = (
    <Link
      to="/professor/apresentacoes"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600"
    >
      <ArrowLeft className="w-4 h-4" />
      Minhas apresentações
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando apresentação...</span>
      </div>
    )
  }

  if (naoEncontrada || !apresentacao) {
    return (
      <div className="space-y-4">
        {voltar}
        <p className="text-sm text-zinc-500">Apresentação não encontrada ou sem acesso.</p>
      </div>
    )
  }

  const { espetaculo, turma } = apresentacao
  const status = espetaculo ? ESPETACULO_STATUS[espetaculo.status] ?? ESPETACULO_STATUS.planejamento : null
  const proximos = ensaios.filter((e) => e.data >= hoje)
  const realizados = ensaios.filter((e) => e.data < hoje).reverse()

  const detalhes = [
    espetaculo && { icon: CalendarDays, texto: format(dataLocal(espetaculo.data_evento), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }) },
    espetaculo?.local && { icon: MapPin, texto: espetaculo.local },
    apresentacao.ordem_entrada !== null && { icon: Hash, texto: `${apresentacao.ordem_entrada}ª entrada` },
    apresentacao.duracao_estimada && { icon: Timer, texto: `Duração estimada de ${hora(apresentacao.duracao_estimada)}` },
  ].filter((item): item is { icon: typeof CalendarDays; texto: string } => Boolean(item))

  return (
    <div className="space-y-5 pb-6">
      <div className="space-y-3">
        {voltar}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">{espetaculo?.titulo ?? 'Espetáculo'}</p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{apresentacao.titulo_musica || 'Apresentação'}</h1>
            <p className="text-zinc-500 mt-1 text-[14px]">
              {turma ? `${nomeTurma(turma)}${turma.descricao ? ` · ${turma.descricao}` : ''}` : 'Sem turma vinculada'}
              {turma?.minha && <span className="font-semibold text-indigo-600"> · sua turma</span>}
            </p>
          </div>
          {status && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status.className}`}>
              {status.label}
            </span>
          )}
        </div>
        {detalhes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {detalhes.map(({ icon: Icon, texto }) => (
              <span
                key={texto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-100 shadow-sm text-xs font-semibold text-zinc-600 first-letter:uppercase"
              >
                <Icon className="w-3.5 h-3.5 text-zinc-400" />
                {texto}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Ensaios</h2>
                  <p className="text-xs text-zinc-500">
                    {proximos.length === 0 ? 'Nenhum ensaio futuro' : `${proximos.length} ${proximos.length === 1 ? 'agendado' : 'agendados'}`}
                  </p>
                </div>
              </div>
              {podeAgendar && (
                <button
                  type="button"
                  onClick={novo}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors hover:cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agendar
                </button>
              )}
            </div>

            {proximos.length === 0 && realizados.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">
                {podeAgendar ? 'Agende o primeiro ensaio desta apresentação.' : 'Nenhum ensaio registrado.'}
              </p>
            ) : (
              <div className="space-y-2">
                {proximos.map((ensaio) => (
                  <EnsaioItem key={ensaio.id} ensaio={ensaio} onEditar={editar} onExcluir={pedirExclusao} />
                ))}
                {realizados.length > 0 && (
                  <>
                    <p className="pt-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">Já realizados</p>
                    {realizados.map((ensaio) => (
                      <EnsaioItem key={ensaio.id} ensaio={ensaio} passado />
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <ParticipantesLista participantes={apresentacao.participantes ?? []} />
      </div>

      <EnsaioFormDialog
        aberto={formAberto}
        ensaio={emEdicao}
        dataLimite={espetaculo?.data_evento ?? null}
        isSaving={isSaving}
        onFechar={fecharForm}
        onSalvar={salvar}
      />

      <ConfirmDeleteDialog
        open={paraExcluir !== null}
        onOpenChange={(open) => !open && cancelarExclusao()}
        description={
          <>
            O ensaio de{' '}
            <strong className="text-zinc-700">
              {paraExcluir && format(dataLocal(paraExcluir.data), "d 'de' MMMM", { locale: ptBR })} às {paraExcluir?.hora_inicio}
            </strong>{' '}
            será removido da agenda. Esta ação não pode ser desfeita.
          </>
        }
        isLoading={isDeleting}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
