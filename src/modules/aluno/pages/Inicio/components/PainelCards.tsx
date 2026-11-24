import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, CalendarDays, ChevronRight, Mic2, Wallet } from 'lucide-react'
import type { AvisoPainel, MensalidadePainel, PainelAluno, ProximaAula } from '../../../types'

const DIAS: Record<string, string> = {
  domingo: 'domingo',
  segunda: 'segunda-feira',
  terca: 'terça-feira',
  quarta: 'quarta-feira',
  quinta: 'quinta-feira',
  sexta: 'sexta-feira',
  sabado: 'sábado',
}

const SITUACAO: Record<MensalidadePainel['situacao'], string> = {
  atrasada: 'Atrasada',
  vence_hoje: 'Vence hoje',
  a_vencer: 'A vencer',
}

function dataLocal(iso: string) {
  return new Date(`${iso}T00:00:00`)
}

function quando(aula: ProximaAula) {
  const data = format(dataLocal(aula.data), "EEEE, d 'de' MMMM", { locale: ptBR })
  const horas = `${aula.hora_inicio}–${aula.hora_termino}`
  if (aula.origem === 'horario' && aula.dia_semana) {
    return `Toda ${DIAS[aula.dia_semana] ?? aula.dia_semana}. Próxima em ${data}, ${horas}.`
  }
  return `${data}, ${horas}`
}

function reais(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-4 text-center text-sm text-zinc-400">
      {children}
    </p>
  )
}

function Badge({ tom, children }: { tom: 'rose' | 'amber' | 'indigo' | 'zinc'; children: ReactNode }) {
  const classes = {
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-800',
    indigo: 'bg-indigo-50 text-indigo-700',
    zinc: 'bg-zinc-100 text-zinc-600',
  }[tom]
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${classes}`}>{children}</span>
}

function CardLink({
  to,
  icon: Icon,
  titulo,
  destaque,
  children,
}: {
  to: string
  icon: typeof CalendarDays
  titulo: string
  destaque?: boolean
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={`group flex h-full flex-col rounded-2xl border p-4 transition-shadow hover:shadow-md ${
        destaque ? 'border-amber-200 bg-amber-50/60' : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 ${destaque ? 'text-amber-700' : 'text-indigo-600'}`}>
          <Icon className="h-4 w-4" />
          <h2 className="text-[11px] font-bold uppercase tracking-wide">{titulo}</h2>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-indigo-500" />
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </Link>
  )
}

export function PainelCards({ painel }: { painel: PainelAluno }) {
  const outras = painel.proximas_aulas.slice(painel.proxima_aula?.origem === 'aula' ? 1 : 0)
  const mensalidade = painel.financeiro.proxima_mensalidade
  const apresentacao = painel.apresentacao.proxima
  const financeiroUrgente = mensalidade?.situacao === 'atrasada' || painel.financeiro.atrasadas > 0

  return (
    <div className="space-y-4">
      <section
        className={`overflow-hidden rounded-2xl border ${
          painel.proxima_aula ? 'border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white' : 'border-zinc-200 bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <CalendarDays className="h-4 w-4" />
              <h2 className="text-[11px] font-bold uppercase tracking-wide">Próxima aula</h2>
            </div>

            {painel.proxima_aula ? (
              <>
                <p className="mt-3 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">{painel.proxima_aula.turma}</p>
                <p className="mt-1.5 text-sm capitalize text-zinc-600">{quando(painel.proxima_aula)}</p>
                <p className="mt-3 text-2xl font-black tabular-nums text-indigo-600">
                  {painel.proxima_aula.hora_inicio}
                  <span className="mx-1 text-base font-semibold text-zinc-400">–</span>
                  {painel.proxima_aula.hora_termino}
                </p>
              </>
            ) : (
              <div className="mt-3">
                <Empty>Nenhuma aula prevista.</Empty>
              </div>
            )}
          </div>

          <Link
            to="/aluno/agenda"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100 transition-colors hover:bg-indigo-600 hover:text-white"
          >
            Ver agenda
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {outras.length > 0 && (
          <ul className="space-y-2 border-t border-indigo-100/80 bg-white/70 px-4 py-3 sm:px-5">
            {outras.map((aula) => (
              <li key={`${aula.origem}-${aula.id}`} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold text-zinc-800">{aula.turma}</span>
                <span className="shrink-0 capitalize text-zinc-500">
                  {format(dataLocal(aula.data), "EEE d/MM", { locale: ptBR })} · {aula.hora_inicio}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {painel.financeiro.disponivel && (
          <CardLink to="/aluno/financeiro" icon={Wallet} titulo="Financeiro" destaque={financeiroUrgente}>
            {mensalidade ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-zinc-900">{mensalidade.descricao}</p>
                  <Badge
                    tom={
                      mensalidade.situacao === 'atrasada' ? 'rose' : mensalidade.situacao === 'vence_hoje' ? 'amber' : 'zinc'
                    }
                  >
                    {SITUACAO[mensalidade.situacao]}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-zinc-600">
                  {reais(mensalidade.valor)} · {format(dataLocal(mensalidade.data_vencimento), "d 'de' MMMM", { locale: ptBR })}
                </p>
              </>
            ) : (
              <Empty>Nenhuma mensalidade em aberto.</Empty>
            )}
            <p className="mt-3 text-xs text-zinc-500">
              {painel.financeiro.em_aberto} em aberto
              {painel.financeiro.atrasadas > 0
                ? ` · ${painel.financeiro.atrasadas} atrasada${painel.financeiro.atrasadas === 1 ? '' : 's'}`
                : ''}
              {painel.financeiro.valor_em_aberto > 0 ? ` · ${reais(painel.financeiro.valor_em_aberto)}` : ''}
            </p>
            {painel.financeiro.valor_atrasado > 0 && (
              <p className="mt-1 text-xs font-semibold text-rose-700">
                Atrasado: {reais(painel.financeiro.valor_atrasado)}
              </p>
            )}
          </CardLink>
        )}

        {painel.apresentacao.disponivel && (
          <CardLink to="/aluno/apresentacoes" icon={Mic2} titulo="Próxima apresentação">
            {apresentacao ? (
              <>
                <p className="text-base font-bold text-zinc-900">{apresentacao.titulo_musica}</p>
                <p className="mt-1.5 text-sm text-zinc-600">
                  {apresentacao.espetaculo} · {format(dataLocal(apresentacao.data_evento), "d 'de' MMMM", { locale: ptBR })}
                </p>
                {apresentacao.local && <p className="mt-1 text-sm text-zinc-500">{apresentacao.local}</p>}
              </>
            ) : (
              <Empty>Nenhuma apresentação marcada.</Empty>
            )}
          </CardLink>
        )}

        <CardLink
          to="/aluno/agenda"
          icon={Bell}
          titulo="Avisos"
          destaque={painel.avisos.some((a) => a.tipo === 'cancelada')}
        >
          {painel.avisos.length > 0 ? (
            <ul className="space-y-3">
              {painel.avisos.map((aviso) => (
                <Aviso key={`${aviso.tipo}-${aviso.data}-${aviso.mensagem}`} aviso={aviso} />
              ))}
            </ul>
          ) : (
            <Empty>Nenhum aviso recente.</Empty>
          )}
        </CardLink>
      </div>
    </div>
  )
}

function Aviso({ aviso }: { aviso: AvisoPainel }) {
  const tom = aviso.tipo === 'cancelada' ? 'rose' : 'amber'
  const rotulo = aviso.tipo === 'cancelada' ? 'Cancelada' : 'Remarcada'

  return (
    <li>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-zinc-900">{aviso.titulo}</p>
        <Badge tom={tom}>{rotulo}</Badge>
      </div>
      <p className="mt-0.5 text-sm text-zinc-600">{aviso.mensagem}</p>
      {aviso.data && (
        <p className="mt-1 text-[11px] capitalize text-zinc-400">
          {format(dataLocal(aviso.data), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      )}
    </li>
  )
}
