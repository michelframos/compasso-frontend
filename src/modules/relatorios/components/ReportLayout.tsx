import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Printer, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToPDF } from '@/shared/lib/exportUtils';

import { PrintHeader } from './PrintHeader';
import { PrintFooter } from './PrintFooter';

interface ReportLayoutProps {
  title: string;
  description?: string;
  filters?: React.ReactNode;
  printFilters?: string | React.ReactNode;
  cards?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onExportExcel?: () => void;
  isLoading?: boolean;
}

export const ReportLayout: React.FC<ReportLayoutProps> = ({
  title,
  description,
  filters,
  printFilters,
  cards,
  actions,
  children,
  onExportExcel,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 print:space-y-4 print:w-full">
      {/* Cabeçalho de Impressão Profissional (Visível apenas na impressão) */}
      <PrintHeader 
        title={title} 
        description={description} 
        printFilters={printFilters} 
      />

      {/* Cabeçalho do Relatório - Escondido na impressão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-zinc-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-10 w-10 hover:bg-white hover:text-indigo-600 shadow-sm border border-zinc-100 hover:cursor-pointer transition-all" 
                onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
          </div>
          {description && (
            <p className="text-zinc-500 text-sm ml-10">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-2">
          {actions}
          <Button 
            variant="outline" 
            className="rounded-full px-6 h-9 font-bold hover:cursor-pointer gap-2 transition-all active:scale-95 shadow-sm w-full lg:w-auto"
            onClick={exportToPDF}
            disabled={isLoading}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </Button>
          {onExportExcel && (
            <Button 
              variant="outline" 
              className="rounded-full px-6 h-9 font-bold hover:cursor-pointer gap-2 transition-all active:scale-95 shadow-sm w-full lg:w-auto"
              onClick={onExportExcel}
              disabled={isLoading}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>
          )}
        </div>
      </div>

      {/* Área de Filtros - Escondida na impressão */}
      {filters && (
        <Card className="no-print border-none shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            {filters}
          </CardContent>
        </Card>
      )}

      {/* Cards de KPI / Totalizadores */}
      {cards && (
        <div>
          {cards}
        </div>
      )}

      {/* Conteúdo Principal (Tabela/Gráfico) */}
      <Card className="border-none shadow-sm print:shadow-none print:w-full">
        <CardContent className="p-0 sm:p-6 print:p-0">
          {children}
        </CardContent>
      </Card>

      {/* Rodapé de Impressão */}
      <PrintFooter />
    </div>
  );
};
