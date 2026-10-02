import React, { useState } from 'react';
import { useAniversariantes } from './hooks/useAniversariantes';
import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';
import { 
  Cake, 
  Phone, 
  MessageSquare, 
  Search, 
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { exportToExcel } from '@/shared/lib/exportUtils';
import { format } from 'date-fns';

const meses = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const AniversariantesPage: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState<string>((new Date().getMonth() + 1).toString());
  const { data, isLoading, refresh } = useAniversariantes(parseInt(mesSelecionado));

  const handleExportExcel = () => {
    if (!data.length) return;
    
    const exportData = data.map(item => ({
      Nome: item.nome,
      Dia: item.dia,
      Tipo: item.tipo,
      Telefone: item.telefone,
      WhatsApp: item.whatsapp
    }));

    const mesNome = meses.find(m => m.value === mesSelecionado)?.label;
    exportToExcel(exportData, `Aniversariantes_${mesNome}_${format(new Date(), 'yyyy')}`);
  };

  const filters = (
    <div className="flex flex-col md:flex-row items-end gap-3">
      <div className="space-y-2 w-full md:w-[200px]">
        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Mês do Relatório</label>
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-zinc-200">
            {meses.map((mes) => (
              <SelectItem key={mes.value} value={mes.value} className="text-sm focus:bg-indigo-50 focus:text-indigo-600 rounded-lg">
                {mes.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={refresh} 
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 gap-2 w-full md:w-auto"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isLoading ? 'Filtrando...' : 'Filtrar'}
      </Button>
    </div>
  );

  return (
    <ReportLayout
      title="Aniversariantes do Mês"
      description="Lista de alunos e professores que comemoram aniversário neste período."
      filters={filters}
      printFilters={`Mês de Referência: ${meses.find(m => m.value === mesSelecionado)?.label || 'Não Informado'}`}
      onExportExcel={handleExportExcel}
      isLoading={isLoading}
    >
      <div className="p-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider w-[80px] text-center">Dia</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Nome</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Tipo</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider no-print">Contato</TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider text-right no-print">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-zinc-50">
                      <TableCell><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></TableCell>
                      <TableCell><div className="h-4 w-48 bg-zinc-100 animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-zinc-100 animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-8 w-8 bg-zinc-100 animate-pulse rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                        <Cake className="w-8 h-8 opacity-20" />
                        <p className="font-medium">Nenhum aniversariante encontrado para este mês.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id} className="border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                          {item.dia}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{item.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          rounded-lg font-bold text-[10px] px-2 py-0.5 border
                          ${item.role === 'aluno' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            item.role === 'professor' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-zinc-50 text-zinc-600 border-zinc-100'}
                        `}>
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="no-print">
                        <div className="flex items-center gap-3">
                          {item.whatsapp && (
                            <a 
                              href={`https://wa.me/55${item.whatsapp.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-500 hover:text-emerald-600 transition-colors p-1.5 rounded-lg hover:bg-emerald-50 hover:cursor-pointer"
                              title="Enviar WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                          {item.telefone && (
                            <a 
                              href={`tel:${item.telefone.replace(/\D/g, '')}`}
                              className="text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-50 hover:cursor-pointer"
                              title="Ligar"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right no-print">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:cursor-pointer"
                            // Aqui poderia haver um link para o perfil do aluno/professor
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ReportLayout>
  );
};

export default AniversariantesPage;
