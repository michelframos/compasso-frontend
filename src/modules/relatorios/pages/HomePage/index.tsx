import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/modules/relatorios/components/Dashboard/StatCard';
import { RevenueChart } from '@/modules/relatorios/components/Dashboard/RevenueChart';
import { TodaySchedule } from '@/modules/relatorios/components/Dashboard/TodaySchedule';
import { UpcomingBirthdays } from '@/modules/relatorios/components/Dashboard/UpcomingBirthdays';
import { InadimplenciaChart } from '@/modules/relatorios/components/Dashboard/InadimplenciaChart';
import { FluxoRecebimentoChart } from '@/modules/relatorios/components/Dashboard/FluxoRecebimentoChart';
import { ConversionFunnel } from '@/modules/relatorios/components/Dashboard/ConversionFunnel';
import { DistributionChart } from '@/modules/relatorios/components/Dashboard/DistributionChart';
import { OccupancyHeatmap } from '@/modules/relatorios/components/Dashboard/OccupancyHeatmap';
import { Plus, AlertTriangle, TrendingUp, Wallet, LayoutDashboard, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useHomePage } from './hooks/useHomePage';
import { currentMonthKey } from '@/modules/relatorios/components/Dashboard/hooks/useDashboardData';
import { RecentPayments } from './components/RecentPayments';
import { OverdueAccounts } from './components/OverdueAccounts';
import { Badge } from '@/shared/components/ui/badge';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

const SectionError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between gap-3">
    <p className="text-sm text-rose-700 font-medium">{message}</p>
    <Button variant="outline" size="sm" className="rounded-full h-8 gap-1.5 shrink-0" onClick={onRetry}>
      <RefreshCw className="w-3.5 h-3.5" />
      Tentar de novo
    </Button>
  </div>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const hasRelatorios = useHasModulo('relatorios');
  const hasFinanceiro = useHasModulo('financeiro');
  const {
    user,
    mes,
    setMes,
    iconMap,
    resumo,
    financeiro,
    operacional,
    refetchFinanceiro,
    refetchResumo,
    refetchOperacional,
  } = useHomePage();

  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
  const alunosAusentes = operacional.data?.alunosAusentes ?? [];

  const canNavigateHref = (href?: string) => {
    if (!href) return false;
    if (href.startsWith('/financeiro') || href.startsWith('/contratos')) return hasFinanceiro;
    if (href.startsWith('/relatorios')) return hasRelatorios;
    return true;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            Olá, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-zinc-500 mt-1 text-base">Veja o que está acontecendo hoje.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 bg-white rounded-xl border border-zinc-200 shadow-sm text-xs font-bold text-zinc-600 flex items-center gap-2 capitalize">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            {dataHoje} - Hoje
          </div>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value || mes)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label="Mês de referência"
          />
          <Button
            onClick={() => navigate('/matriculas/novo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Matrícula
          </Button>
        </div>
      </div>

      {alunosAusentes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => hasRelatorios && navigate('/relatorios/academico/absenteismo')}
            disabled={!hasRelatorios}
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Atenção: Alunos com faltas consecutivas</h4>
              <p className="text-xs text-amber-700">{alunosAusentes.length} alunos faltaram nas últimas 2 aulas. Considere uma ação de retenção.</p>
            </div>
          </button>
          <div className="flex -space-x-2 overflow-hidden items-center">
            {alunosAusentes.slice(0, 5).map((aluno) => (
              <Badge
                key={aluno.id}
                variant="outline"
                className="bg-white text-amber-600 border-amber-200 cursor-pointer hover:bg-amber-100"
                onClick={() => navigate(`/alunos/${aluno.id}`)}
              >
                {aluno.name.split(' ')[0]}
              </Badge>
            ))}
            {alunosAusentes.length > 5 && (
              <span className="text-xs font-bold text-amber-600 ml-3 flex items-center">+{alunosAusentes.length - 5}</span>
            )}
          </div>
        </div>
      )}

      {resumo.error && <SectionError message={resumo.error} onRetry={refetchResumo} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {resumo.isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[110px] rounded-2xl" />)
          : (resumo.data?.stats ?? []).map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={iconMap[stat.icon] || LayoutDashboard}
                trend={stat.trend}
                variant={stat.variant}
                onClick={canNavigateHref(stat.href) ? () => navigate(stat.href!) : undefined}
              />
            ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-black text-zinc-900">Saúde do Negócio</h2>
        </div>
        {financeiro.error && <SectionError message={financeiro.error} onRetry={refetchFinanceiro} />}
        {financeiro.isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Skeleton className="h-[350px] lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-[350px] rounded-2xl" />
            <Skeleton className="h-[350px] rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <RevenueChart data={financeiro.data?.revenueData ?? []} />
              </div>
              <div>
                <InadimplenciaChart data={financeiro.data?.inadimplenciaData ?? []} />
              </div>
              <div>
                <FluxoRecebimentoChart data={financeiro.data?.fluxoRecebimentoData ?? []} />
              </div>
            </div>
            <OverdueAccounts items={financeiro.data?.inadimplenciaItens ?? []} onPaymentSuccess={refetchFinanceiro} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 text-indigo-600" />
            <h2 className="text-xl font-black text-zinc-900">Visão Operacional</h2>
          </div>
          {operacional.error && <SectionError message={operacional.error} onRetry={refetchOperacional} />}
          {operacional.isLoading ? (
            <Skeleton className="h-[280px] rounded-2xl" />
          ) : (
            <>
              <TodaySchedule agenda={operacional.data?.agendaHoje ?? []} />
              <OccupancyHeatmap data={operacional.data?.ocupacaoHorarios ?? null} />
              <UpcomingBirthdays
                birthdays={operacional.data?.aniversariantes ?? []}
                highlightToday={mes === currentMonthKey()}
              />
              {financeiro.isLoading ? (
                <Skeleton className="h-[220px] rounded-2xl" />
              ) : (
                <RecentPayments payments={financeiro.data?.recentPayments ?? []} />
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 text-indigo-600" />
            <h2 className="text-xl font-black text-zinc-900">Inteligência</h2>
          </div>
          {operacional.isLoading ? (
            <>
              <Skeleton className="h-[220px] rounded-2xl" />
              <Skeleton className="h-[220px] rounded-2xl" />
            </>
          ) : (
            <>
              <ConversionFunnel data={operacional.data?.conversaoData ?? null} />
              <DistributionChart data={operacional.data?.distributionData ?? []} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
