import type { ReactNode } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, CalendarDays, Mic2, Wallet } from 'lucide-react'
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

function Card({ icon: Icon, titulo, children }: { icon: typeof CalendarDays; titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        <Icon className="h-4 w-4" />
        <h2 className="text-[11px] font-bold uppercase tracking-wide">{titulo}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function PainelCards({ painel }: { painel: PainelAluno }) {
  const outras = painel.proximas_aulas.slice(painel.proxima_aula?.origem === 'aula' ? 1 : 0)
  const mensalidade = painel.financeiro.proxima_mensalidade
  const apresentacao = painel.apresentacao.proxima

  return (
    <div className="space-y-3">
      <Card icon={CalendarDays} titulo="Próxima aula">
        {painel.proxima_aula ? (
          <>
            <p className="text-base font-bold text-zinc-900">{painel.proxima_aula.turma}</p>
            <p className="mt-1 text-sm capitalize text-zinc-600">{quando(painel.proxima_aula)}</p>
            {outras.length > 0 && (
              <ul className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
                {outras.map((aula) => (
                  <li key={`${aula.origem}-${aula.id}`} className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-800">{aula.turma}</span>
                    <span className="mt-0.5 block capitalize">{quando(aula)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">Nenhuma aula prevista.</p>
        )}
      </Card>

      {painel.financeiro.disponivel && (
        <Card icon={Wallet} titulo="Financeiro">
          {mensalidade ? (
            <>
              <p className="text-base font-bold text-zinc-900">{mensalidade.descricao}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {reais(mensalidade.valor)} · {format(dataLocal(mensalidade.data_vencimento), "d 'de' MMMM", { locale: ptBR })}
              </p>
              <p className={`mt-2 text-sm font-semibold ${mensalidade.situacao === 'atrasada' ? 'text-amber-700' : 'text-zinc-700'}`}>
                {SITUACAO[mensalidade.situacao]}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Nenhuma mensalidade em aberto.</p>
          )}
          <p className="mt-3 text-xs text-zinc-500">
            {painel.financeiro.em_aberto} em aberto
            {painel.financeiro.atrasadas > 0 ? ` · ${painel.financeiro.atrasadas} atrasada${painel.financeiro.atrasadas === 1 ? '' : 's'}` : ''}
            {painel.financeiro.valor_em_aberto > 0 ? ` · ${reais(painel.financeiro.valor_em_aberto)}` : ''}
          </p>
        </Card>
      )}

      {painel.apresentacao.disponivel && (
        <Card icon={Mic2} titulo="Próxima apresentação">
          {apresentacao ? (
            <>
              <p className="text-base font-bold text-zinc-900">{apresentacao.titulo_musica}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {apresentacao.espetaculo} · {format(dataLocal(apresentacao.data_evento), "d 'de' MMMM", { locale: ptBR })}
              </p>
              {apresentacao.local && <p className="mt-1 text-sm text-zinc-500">{apresentacao.local}</p>}
            </>
          ) : (
            <p className="text-sm text-zinc-500">Nenhuma apresentação marcada.</p>
          )}
        </Card>
      )}

      <Card icon={Bell} titulo="Avisos">
        {painel.avisos.length > 0 ? (
          <ul className="space-y-3">
            {painel.avisos.map((aviso) => (
              <Aviso key={`${aviso.tipo}-${aviso.data}-${aviso.mensagem}`} aviso={aviso} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">Nenhum aviso recente.</p>
        )}
      </Card>
    </div>
  )
}

function Aviso({ aviso }: { aviso: AvisoPainel }) {
  return (
    <li>
      <p className="text-sm font-semibold text-zinc-900">{aviso.titulo}</p>
      <p className="mt-0.5 text-sm text-zinc-600">{aviso.mensagem}</p>
    </li>
  )
}
