import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, CalendarClock, CalendarDays, CalendarRange, ChevronRight, ClipboardCheck, GraduationCap, Loader2, Megaphone, Mic2, Users, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import { ContadorCard } from '../../components/ContadorCard'
import { SolicitarAlteracaoDialog } from '../../components/solicitacoes/SolicitarAlteracaoDialog'
import { SecaoAulas } from './components/SecaoAulas'
import { useInicio } from './hooks/useInicio'

const ATALHOS = [
  { to: '/professor/turmas', icon: GraduationCap, titulo: 'Minhas turmas', descricao: 'Alunos, horários, aulas e materiais.' },
  { to: '/professor/alunos', icon: Users, titulo: 'Meus alunos', descricao: 'Turmas e aulas individuais.' },
  { to: '/professor/frequencia', icon: ClipboardCheck, titulo: 'Frequência', descricao: 'Presença e alunos em risco.' },
  { to: '/professor/apresentacoes', icon: Mic2, titulo: 'Apresentações', descricao: 'Espetáculos e agenda de ensaios.', modulo: 'espetaculos' },
  { to: '/professor/ganhos', icon: Wallet, titulo: 'Meus ganhos', descricao: 'Extrato do mês: fixo, aulas e comissão.' },
  { to: '/professor/solicitacoes', icon: CalendarClock, titulo: 'Solicitações', descricao: 'Cancelar, repor, substituto e disponibilidade.' },
  { to: '/professor/avisos', icon: Megaphone, titulo: 'Avisos', descricao: 'Recados por e-mail ou WhatsApp a alunos e responsáveis.' },
  { to: '/agenda', icon: CalendarDays, titulo: 'Agenda', descricao: 'Calendário completo das suas aulas.' },
]

function detalheAlunosAtivos(turmas: number, alunos: number): string {
  if (turmas === 0) return alunos > 0 ? 'Aulas individuais' : 'Nenhuma turma ativa'
  return `${turmas} ${turmas === 1 ? 'turma ativa' : 'turmas ativas'}`
}

export const InicioPage: React.FC = () => {
  const { professor, painel, proximasAulas, isLoading, abrirChamada, emAlteracao, abrirAlteracao, fecharAlteracao, recarregarPainel } =
    useInicio()
  const usaEspetaculos = useHasModulo('espetaculos')
  const atalhos = ATALHOS.filter((atalho) => !atalho.modulo || usaEspetaculos)

  const hoje = painel ? new Date(`${painel.data_referencia}T00:00:00`) : new Date()
  const contadores = painel?.contadores
  const pendentesOcultas = contadores ? contadores.chamadas_pendentes - (painel?.chamadas_pendentes.length ?? 0) : 0

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Olá{professor ? ',' : ''} <span className="text-indigo-600">{professor?.nome?.split(' ')[0] ?? 'professor(a)'}</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-[14px] first-letter:uppercase">
          {format(hoje, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : (
        <>
          {contadores && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ContadorCard icon={CalendarDays} titulo="Aulas hoje" valor={contadores.aulas_hoje} />
              <ContadorCard icon={CalendarRange} titulo="Na semana" valor={contadores.aulas_semana} />
              <ContadorCard
                icon={AlertTriangle}
                titulo="Chamadas pendentes"
                valor={contadores.chamadas_pendentes}
                destaque={contadores.chamadas_pendentes > 0}
              />
              <ContadorCard
                icon={Users}
                titulo="Alunos ativos"
                valor={contadores.alunos_ativos}
                detalhe={detalheAlunosAtivos(contadores.turmas_ativas, contadores.alunos_ativos)}
              />
            </div>
          )}

          {painel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <SecaoAulas
                  titulo="Aulas de hoje"
                  aulas={painel.aulas_hoje}
                  vazio="Nenhuma aula para hoje."
                  onChamada={abrirChamada}
                  onAlterar={abrirAlteracao}
                />
                {painel.chamadas_pendentes.length > 0 && (
                  <SecaoAulas
                    titulo="Chamadas pendentes"
                    aulas={painel.chamadas_pendentes}
                    vazio=""
                    mostrarData
                    textoChamada="Fazer chamada"
                    rodape={pendentesOcultas > 0 ? `Mostrando as ${painel.chamadas_pendentes.length} mais recentes de ${contadores?.chamadas_pendentes}.` : undefined}
                    onChamada={abrirChamada}
                  />
                )}
              </div>
              <SecaoAulas
                titulo="Próximas aulas da semana"
                aulas={proximasAulas}
                vazio="Nenhuma outra aula até o fim da semana."
                mostrarData
                onAlterar={abrirAlteracao}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {atalhos.map(({ to, icon: Icon, titulo, descricao }) => (
              <Link key={to} to={to}>
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">{titulo}</p>
                      <p className="text-sm text-zinc-500">{descricao}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      <SolicitarAlteracaoDialog aula={emAlteracao} onFechar={fecharAlteracao} onConcluido={recarregarPainel} />
    </div>
  )
}
