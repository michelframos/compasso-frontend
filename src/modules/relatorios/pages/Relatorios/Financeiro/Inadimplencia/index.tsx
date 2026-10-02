import React, { useState } from 'react';
import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';
import { InadimplenciaCards } from './components/InadimplenciaCards';
import { InadimplenciaTable } from './components/InadimplenciaTable';
import { ConfirmNotifyDialog } from './components/ConfirmNotifyDialog';
import { useInadimplencia, type InadimplenciaData } from './hooks/useInadimplencia';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { exportToExcel } from '@/shared/lib/exportUtils';
import { format } from 'date-fns';
import { PagamentoModal } from '@/modules/financeiro';

import { Search, Loader2 } from 'lucide-react';

const InadimplenciaPage: React.FC = () => {
  const { data, summary, isLoading, handleNotify, refresh, notifyDialog } = useInadimplencia();
  const { data_inicio, data_fim, setDataInicio, setDataFim } = useReportStore();
  const [contaIdBaixa, setContaIdBaixa] = useState<number | null>(null);

  const handleExportExcel = () => {
    const exportData = data.map((item) => ({
      Aluno: item.aluno?.usuario?.nome || 'N/A',
      Responsável: item.aluno?.responsaveis?.[0]?.usuario?.nome || 'N/A',
      Contato: item.aluno?.responsaveis?.[0]?.usuario?.whatsapp || item.aluno?.responsaveis?.[0]?.usuario?.email || 'N/A',
      Descrição: item.descricao,
      Vencimento: format(new Date(item.data_vencimento), 'dd/MM/yyyy'),
      Valor: item.valor,
    }));

    exportToExcel(exportData, `Relatorio_Inadimplencia_${format(new Date(), 'yyyyMMdd')}`);
  };

  const handleBaixar = (item: InadimplenciaData) => {
    setContaIdBaixa(item.id);
  };

  const filters = (
    <div className="flex flex-col md:flex-row items-end gap-3">
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Vencimento Início</label>
        <Input
          type="date"
          value={data_inicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="h-9 w-full md:w-[180px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"
        />
      </div>
      <div className="space-y-2 w-full md:w-auto">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Vencimento Fim</label>
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
    <>
      <ReportLayout
        title="Relatório de Inadimplência"
        description="Listagem de mensalidades e contas a receber vencidas e não pagas."
        filters={filters}
        printFilters={`Período de Vencimento: ${data_inicio ? format(new Date(data_inicio), 'dd/MM/yyyy') : 'Início'} até ${data_fim ? format(new Date(data_fim), 'dd/MM/yyyy') : 'Fim'}`}
        cards={<InadimplenciaCards summary={summary} isLoading={isLoading} />}
        onExportExcel={handleExportExcel}
        isLoading={isLoading}
      >
        <InadimplenciaTable
          data={data}
          onNotify={handleNotify}
          onBaixar={handleBaixar}
          isLoading={isLoading}
        />
      </ReportLayout>

      <ConfirmNotifyDialog
        open={notifyDialog.open}
        canal={notifyDialog.canal}
        preview={notifyDialog.preview}
        isLoadingPreview={notifyDialog.isLoadingPreview}
        isSending={notifyDialog.isSending}
        onOpenChange={notifyDialog.onOpenChange}
        onConfirm={notifyDialog.onConfirm}
      />

      <PagamentoModal
        open={contaIdBaixa != null}
        onOpenChange={(open) => {
          if (!open) setContaIdBaixa(null);
        }}
        contaId={contaIdBaixa}
        onSuccess={refresh}
      />
    </>
  );
};

export default InadimplenciaPage;
