import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Music, 
  Search, 
  Filter, 
  Box,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useInventarioInstrumentos } from './hooks/useInventarioInstrumentos';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const statusMap = {
  disponivel: { label: 'Disponível', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  emprestado: { label: 'Emprestado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  manutencao: { label: 'Em Manutenção', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const InventarioInstrumentos: React.FC = () => {
  const { 
    loading, 
    data, 
    summary, 
    filters, 
    handleFilterChange, 
    refresh 
  } = useInventarioInstrumentos();

  const filterElements = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input 
          placeholder="Buscar por aluno..." 
          className="h-9 pl-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"
          value={filters.aluno}
          onChange={(e) => handleFilterChange('aluno', e.target.value)}
        />
      </div>
      
      <Select 
        value={filters.tipo} 
        onValueChange={(value) => handleFilterChange('tipo', value)}
      >
        <SelectTrigger className="h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-zinc-400" />
            <SelectValue placeholder="Tipo de Instrumento" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-zinc-200">
          <SelectItem value="all">Todos os Tipos</SelectItem>
          <SelectItem value="Violão">Violão</SelectItem>
          <SelectItem value="Piano">Piano</SelectItem>
          <SelectItem value="Violino">Violino</SelectItem>
          <SelectItem value="Flauta">Flauta</SelectItem>
          <SelectItem value="Bateria">Bateria</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.status} 
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <SelectValue placeholder="Status" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-zinc-200">
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="disponivel">Disponível</SelectItem>
          <SelectItem value="emprestado">Emprestado</SelectItem>
          <SelectItem value="manutencao">Manutenção</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const cards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total</CardTitle>
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Box className="w-4 h-4 text-indigo-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-zinc-900">{summary.total}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Disponíveis</CardTitle>
          <div className="p-2 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-emerald-600">{summary.disponiveis}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Emprestados</CardTitle>
          <div className="p-2 bg-blue-50 rounded-xl">
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-blue-600">{summary.emprestados}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Manutenção</CardTitle>
          <div className="p-2 bg-amber-50 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-amber-600">{summary.manutencao}</div>
        </CardContent>
      </Card>
    </div>
  );

  const printFiltersDescription = [
    filters.aluno && `Aluno: ${filters.aluno}`,
    filters.tipo !== 'all' && `Tipo: ${filters.tipo}`,
    filters.status !== 'all' && `Status: ${statusMap[filters.status as keyof typeof statusMap]?.label || filters.status}`
  ].filter(Boolean).join(' | ') || 'Todos os registros';

  return (
    <ReportLayout
      title="Inventário de Instrumentos"
      description="Gestão, disponibilidade e controle de empréstimos."
      filters={filterElements}
      printFilters={printFiltersDescription}
      cards={cards}
      isLoading={loading}
    >
      <Table>
        <TableHeader className="bg-zinc-50/50">
          <TableRow className="border-zinc-100 hover:bg-transparent">
            <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Instrumento</TableHead>
            <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Tipo</TableHead>
            <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Nº Série</TableHead>
            <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Status</TableHead>
            <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Possuidor</TableHead>
            <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Data Empréstimo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-zinc-50">
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <Music className="w-8 h-8 opacity-20" />
                  <p className="font-medium">Nenhum instrumento encontrado com os filtros aplicados.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <TableCell className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{item.nome}</TableCell>
                <TableCell className="text-zinc-600 font-medium text-sm">{item.tipo}</TableCell>
                <TableCell className="text-zinc-500 font-mono text-[11px]">{item.numero_serie || '-'}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`rounded-lg font-bold text-[10px] px-2 py-0.5 border shadow-none ${statusMap[item.status as keyof typeof statusMap].color}`}
                  >
                    {statusMap[item.status as keyof typeof statusMap].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-700 font-bold text-sm uppercase tracking-tight">
                  {item.aluno?.usuario.nome || '-'}
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {item.data_emprestimo ? new Date(item.data_emprestimo).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ReportLayout>
  );
};

export default InventarioInstrumentos;
