import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import type { AbsenteismoData } from '../hooks/useAbsenteismo';
import { cn } from '@/shared/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AbsenteismoTableProps {
  data: AbsenteismoData[];
  isLoading: boolean;
}

export const AbsenteismoTable: React.FC<AbsenteismoTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-zinc-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-zinc-400 font-medium animate-pulse text-sm">Carregando dados...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200">
        <p className="text-zinc-400 font-medium">Nenhum dado encontrado para o período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-zinc-50/50">
          <TableRow className="hover:bg-transparent border-zinc-100">
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider">Aluno</TableHead>
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider text-center">Total Aulas</TableHead>
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider text-center text-emerald-600">Presenças</TableHead>
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider text-center text-red-600">Faltas</TableHead>
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider text-center text-amber-600">Justificadas</TableHead>
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider text-center">% Absenteísmo</TableHead>
            <TableHead className="font-bold text-zinc-600 text-[11px] uppercase tracking-wider text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="hover:bg-zinc-50/50 border-zinc-50 transition-colors">
              <TableCell className="font-bold text-zinc-900 py-4">{row.nome_aluno}</TableCell>
              <TableCell className="text-center font-medium text-zinc-500">{row.total_aulas}</TableCell>
              <TableCell className="text-center font-bold text-emerald-600">{row.total_presencas}</TableCell>
              <TableCell className={cn(
                "text-center font-bold",
                row.total_faltas > 0 ? "text-red-600" : "text-zinc-300"
              )}>
                {row.total_faltas}
              </TableCell>
              <TableCell className="text-center font-medium text-amber-600">{row.total_justificadas}</TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "px-2 py-1 rounded-lg font-black text-[11px]",
                  row.taxa_absenteismo > 20 ? "bg-red-50 text-red-600" : 
                  row.taxa_absenteismo > 10 ? "bg-amber-50 text-amber-600" : 
                  "bg-emerald-50 text-emerald-600"
                )}>
                  {row.taxa_absenteismo}%
                </span>
              </TableCell>
              <TableCell className="text-right">
                {row.em_risco ? (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white border-none gap-1 font-bold h-7 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    Risco de Evasão
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none gap-1 font-bold h-7 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Regular
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
