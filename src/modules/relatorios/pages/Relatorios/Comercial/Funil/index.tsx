import React from 'react';
import { useFunilVendas } from './hooks/useFunilVendas';
import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';
import { FunilCards } from './components/FunilCards';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  Search, 
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { exportToExcel } from '@/shared/lib/exportUtils';
import { format } from 'date-fns';

const FunilVendasPage: React.FC = () => {
  const { summary, isLoading, refresh } = useFunilVendas();
  const { data_inicio, data_fim, setDataInicio, setDataFim } = useReportStore();

  const handleExportExcel = () => {
    if (!summary) return;
    
    const exportData = [
      { Métrica: "Novos Leads", Valor: summary.novos_leads },
      { Métrica: "Matrículas Realizadas", Valor: summary.matriculas_realizadas },
      { Métrica: "Taxa de Conversão", Valor: `${summary.taxa_conversao}%` },
      ...summary.leads_por_status.map(item => ({
        Métrica: `Status: ${item.label}`,
        Valor: item.value
      }))
    ];

    exportToExcel(exportData, `Relatorio_Funil_Vendas_${format(new Date(), 'yyyyMMdd')}`);
  };

  const filters = (
    <div className="flex flex-col md:flex-row items-end gap-3">
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Início</label>
        <Input
          type="date"
          value={data_inicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="h-9 w-full md:w-[180px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"
        />
      </div>
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Fim</label>
        <Input
          type="date"
          value={data_fim}
          onChange={(e) => setDataFim(e.target.value)}
          className="h-9 w-full md:w-[180px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"
        />
      </div>
      <Button 
        onClick={refresh} 
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 gap-2 w-full md:w-auto mt-4 md:mt-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isLoading ? 'Gerando...' : 'Gerar Relatório'}
      </Button>
    </div>
  );

  return (
    <ReportLayout
      title="Funil de Vendas"
      description="Acompanhe a conversão de leads em matrículas no período."
      filters={filters}
      printFilters={`Período: ${data_inicio ? format(new Date(data_inicio), 'dd/MM/yyyy') : 'Início'} até ${data_fim ? format(new Date(data_fim), 'dd/MM/yyyy') : 'Fim'}`}
      cards={<FunilCards summary={summary} isLoading={isLoading} />}
      onExportExcel={handleExportExcel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 px-1">Distribuição por Status</h3>
            <div className="space-y-3">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
              ) : (
                summary?.leads_por_status.map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        item.status === 'matriculado' ? 'bg-emerald-500' : 
                        item.status === 'perdido' ? 'bg-rose-500' :
                        item.status === 'contatado' ? 'bg-blue-500' : 'bg-zinc-400'
                      }`} />
                      <span className="text-sm font-bold text-zinc-700 capitalize">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-zinc-900">{item.value}</span>
                  </div>
                ))
              )}
            </div>
        </div>

        <Card className="border-none shadow-none bg-indigo-600 text-white rounded-3xl overflow-hidden min-h-[300px]">
          <CardContent className="p-8 flex flex-col justify-center h-full">
            <TrendingUp className="w-10 h-10 mb-4 text-indigo-200" />
            <h3 className="text-xl font-bold mb-2">Análise de Conversão</h3>
            <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
              Sua taxa de conversão atual é de <strong>{summary?.taxa_conversao}%</strong>. 
              Isso significa que para cada 10 novos leads, aproximadamente {Math.round((summary?.taxa_conversao ?? 0) / 10)} resultam em matrícula ativa no sistema.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-500/30 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-xs font-bold text-indigo-200 uppercase mb-1">Total Leads</p>
                <p className="text-2xl font-black">{summary?.novos_leads}</p>
              </div>
              <div className="bg-indigo-500/30 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-xs font-bold text-indigo-200 uppercase mb-1">Convertidos</p>
                <p className="text-2xl font-black">{summary?.matriculas_realizadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportLayout>
  );
};

export default FunilVendasPage;
