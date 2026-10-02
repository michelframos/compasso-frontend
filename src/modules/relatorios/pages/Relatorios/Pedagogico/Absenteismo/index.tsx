import React, { useState, useEffect } from 'react';
import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';
import { AbsenteismoCards } from './components/AbsenteismoCards';
import { AbsenteismoTable } from './components/AbsenteismoTable';
import { useAbsenteismo } from './hooks/useAbsenteismo';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { exportToExcel } from '@/shared/lib/exportUtils';
import { format } from 'date-fns';
import api from '@/shared/lib/axios';
import { Search, Loader2, Calendar } from 'lucide-react';

interface Turma {
  id: number;
  descricao?: string;
  curso?: {
    nome: string;
  };
}

const AbsenteismoPage: React.FC = () => {
  const { data, summary, isLoading, refresh } = useAbsenteismo();
  const { 
    data_inicio, 
    data_fim, 
    id_turma, 
    limite_faltas,
    setDataInicio, 
    setDataFim, 
    setIdTurma,
    setLimiteFaltas
  } = useReportStore();
  const [turmas, setTurmas] = useState<Turma[]>([]);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await api.get('/turmas');
        // O Laravel Resource retorna em response.data.data se for Coleção/Paginação
        const turmasData = response.data.data || response.data;
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
      }
    };
    fetchTurmas();
  }, []);

  const handleExportExcel = () => {
    const exportData = data.map((item) => ({
      Aluno: item.nome_aluno,
      Aulas: item.total_aulas,
      Presenças: item.total_presencas,
      Faltas: item.total_faltas,
      Justificadas: item.total_justificadas,
      'Taxa Absenteísmo': `${item.taxa_absenteismo}%`,
      Status: item.em_risco ? 'Risco de Evasão' : 'Regular',
    }));

    exportToExcel(exportData, `Relatorio_Absenteismo_${format(new Date(), 'yyyyMMdd')}`);
  };

  const filters = (
    <div className="flex flex-col md:flex-row items-end gap-3">
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Início
        </label>
        <Input
          type="date"
          value={data_inicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="h-9 w-full md:w-[160px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium"
        />
      </div>
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Fim
        </label>
        <Input
          type="date"
          value={data_fim}
          onChange={(e) => setDataFim(e.target.value)}
          className="h-9 w-full md:w-[160px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium"
        />
      </div>
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Turma (Opcional)</label>
        <Select value={id_turma} onValueChange={setIdTurma}>
          <SelectTrigger className="h-9 w-full md:w-[220px] rounded-xl bg-zinc-50 border-zinc-200 text-sm font-medium">
            <SelectValue placeholder="Todas as turmas" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
            <SelectItem value="all">Todas as turmas</SelectItem>
            {turmas.map((turma) => (
              <SelectItem key={turma.id} value={turma.id.toString()}>
                {turma.descricao || turma.curso?.nome || `Turma #${turma.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
          Limite Faltas
        </label>
        <Input
          type="number"
          min={1}
          max={10}
          value={limite_faltas}
          onChange={(e) => setLimiteFaltas(Number(e.target.value))}
          className="h-9 w-full md:w-[100px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium"
        />
      </div>
      <Button 
        onClick={refresh} 
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 gap-2 w-full md:w-auto mt-4 md:mt-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isLoading ? 'Analisando...' : 'Pesquisar'}
      </Button>
    </div>
  );

  return (
    <ReportLayout
      title="Frequência e Absenteísmo"
      description="Análise detalhada de presença e identificação de risco de evasão por aluno."
      filters={filters}
      printFilters={[
        `Período: ${data_inicio ? format(new Date(data_inicio), 'dd/MM/yyyy') : 'Início'} até ${data_fim ? format(new Date(data_fim), 'dd/MM/yyyy') : 'Fim'}`,
        id_turma !== 'all' && `Turma: ${turmas.find(t => t.id.toString() === id_turma)?.descricao || id_turma}`,
        `Limite de Faltas: ${limite_faltas}`
      ].filter(Boolean).join(' | ')}
      cards={<AbsenteismoCards summary={summary} isLoading={isLoading} />}
      onExportExcel={handleExportExcel}
      isLoading={isLoading}
    >
      <AbsenteismoTable 
        data={data} 
        isLoading={isLoading} 
      />
    </ReportLayout>
  );
};

export default AbsenteismoPage;
