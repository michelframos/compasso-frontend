import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { MessageSquare, Mail, User, Banknote } from 'lucide-react';
import type { InadimplenciaData } from '../hooks/useInadimplencia';
import type { ContaNotificacaoCanal } from '@/modules/notificacoes/api/notificacoes';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InadimplenciaTableProps {
  data: InadimplenciaData[];
  onNotify: (item: InadimplenciaData, canal: ContaNotificacaoCanal) => void;
  onBaixar: (item: InadimplenciaData) => void;
  isLoading?: boolean;
}

export const InadimplenciaTable: React.FC<InadimplenciaTableProps> = ({
  data,
  onNotify,
  onBaixar,
  isLoading,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-zinc-500 animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
        <div className="p-3 bg-zinc-100 rounded-full">
          <User className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">Nenhum registro encontrado</h3>
        <p className="text-sm text-zinc-500 max-w-xs">Não há inadimplências para o período selecionado ou os filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border-none">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/50 border-[#e5e7eb]">
            <TableHead className="font-bold py-4">Aluno</TableHead>
            <TableHead className="font-bold py-4">Responsável</TableHead>
            <TableHead className="font-bold py-4">Descrição</TableHead>
            <TableHead className="font-bold py-4">Vencimento</TableHead>
            <TableHead className="font-bold py-4 text-right">Valor</TableHead>
            <TableHead className="font-bold py-4 text-center no-print">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-zinc-50/50 transition-colors border-[#e5e7eb]">
              <TableCell className="font-medium">{item.aluno?.usuario?.nome || 'Cliente/Aluno Não Vinculado'}</TableCell>
              <TableCell className="text-zinc-600">
                {item.aluno?.responsaveis?.[0]?.usuario?.nome || '-'}
                <div className="text-[10px] text-zinc-400">
                  {item.aluno?.responsaveis?.[0]?.usuario?.whatsapp || item.aluno?.responsaveis?.[0]?.usuario?.email || ''}
                </div>
              </TableCell>
              <TableCell>{item.descricao}</TableCell>
              <TableCell>
                {format(parseISO(item.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right font-bold text-rose-600">
                {formatCurrency(item.valor)}
              </TableCell>
              <TableCell className="text-center no-print">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 hover:cursor-pointer transition-all active:scale-95"
                    title="Dar baixa"
                    aria-label={`Dar baixa na conta de ${item.aluno?.usuario?.nome || 'aluno'}`}
                    onClick={() => onBaixar(item)}
                  >
                    <Banknote className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:cursor-pointer transition-all active:scale-95"
                    title="WhatsApp"
                    onClick={() => onNotify(item, 'whatsapp')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:cursor-pointer transition-all active:scale-95"
                    title="Email"
                    onClick={() => onNotify(item, 'email')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
