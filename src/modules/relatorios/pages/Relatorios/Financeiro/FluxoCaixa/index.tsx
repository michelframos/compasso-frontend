import React, { useMemo } from 'react';
import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';
import { useFluxoCaixa } from './hooks/useFluxoCaixa';
import { FluxoCaixaMovimentosDialog } from './components/FluxoCaixaMovimentosDialog';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { exportToExcel } from '@/shared/lib/exportUtils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { Search, Loader2, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

const FluxoCaixaPage: React.FC = () => {
  const {
    data,
    summary,
    isLoading,
    error,
    refresh,
    dataInicio,
    dataFim,
    setDataInicio,
    setDataFim,
    tipo,
    setTipo,
    aplicarAtalho,
    movimentosOpen,
    setMovimentosOpen,
    movimentosLoading,
    movimentos,
    movimentoMeta,
    abrirMovimentos,
  } = useFluxoCaixa();

  const categoriasPeriodo = useMemo(() => {
    const entradas = new Map<string, number>();
    const saidas = new Map<string, number>();

    for (const item of data) {
      for (const cat of item.categorias ?? []) {
        const map = cat.tipo === 'despesa' ? saidas : entradas;
        map.set(cat.categoria, (map.get(cat.categoria) ?? 0) + cat.valor);
      }
    }

    const toList = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8);

    return { entradas: toList(entradas), saidas: toList(saidas) };
  }, [data]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatCompact = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const formatPeriodo = (periodo: string) => {
    try {
      return format(parseISO(`${periodo}-01`), 'MMM/yy', { locale: ptBR });
    } catch {
      return periodo;
    }
  };

  const handleExportExcel = () => {
    const exportData = data.map((item) => ({
      Período: item.periodo,
      'Previsto Entrada': item.previsto_entrada,
      'Realizado Entrada': item.realizado_entrada,
      'Em aberto Entrada': item.em_aberto_entrada,
      'Variação Entrada': item.variacao_entrada,
      'Previsto Saída': item.previsto_saida,
      'Realizado Saída': item.realizado_saida,
      'Em aberto Saída': item.em_aberto_saida,
      'Saldo Previsto': item.saldo_previsto,
      'Saldo Realizado': item.saldo_realizado,
      'Saldo Realizado Acumulado': item.saldo_realizado_acumulado,
    }));

    exportToExcel(exportData, `Fluxo_Caixa_${format(new Date(), 'yyyyMMdd')}`);
  };

  const atalhoClass = (active?: boolean) =>
    `h-8 rounded-full px-3 text-xs font-bold border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`;

  const filters = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className={atalhoClass()} onClick={() => aplicarAtalho('padrao')}>Padrão (-6 / +3)</Button>
        <Button type="button" variant="outline" className={atalhoClass()} onClick={() => aplicarAtalho('mesAtual')}>Este mês</Button>
        <Button type="button" variant="outline" className={atalhoClass()} onClick={() => aplicarAtalho('ultimos6')}>Últimos 6 meses</Button>
        <Button type="button" variant="outline" className={atalhoClass()} onClick={() => aplicarAtalho('anoAtual')}>Ano atual</Button>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Início</label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="h-9 w-[180px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Fim</label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="h-9 w-[180px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
            className="h-9 w-[160px] rounded-xl bg-zinc-50 border border-zinc-200 px-3 text-sm font-medium text-zinc-700"
          >
            <option value="">Entradas e saídas</option>
            <option value="receita">Só entradas</option>
            <option value="despesa">Só saídas</option>
          </select>
        </div>
        <Button
          onClick={refresh}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 gap-2 w-full md:w-auto mt-4 md:mt-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isLoading ? 'Gerando...' : 'Gerar Relatório'}
        </Button>
      </div>
    </div>
  );

  const cards = (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      <Card className="border-none shadow-sm bg-emerald-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-emerald-600 uppercase flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Entradas (caixa)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(summary?.realizado_entrada ?? 0)}</div>
          <p className="text-[10px] text-emerald-600/70 mt-1">
            Previsto no vencimento: {formatCurrency(summary?.previsto_entrada ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-rose-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-rose-600 uppercase flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Saídas (caixa)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{formatCurrency(summary?.realizado_saida ?? 0)}</div>
          <p className="text-[10px] text-rose-600/70 mt-1">
            Previsto no vencimento: {formatCurrency(summary?.previsto_saida ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-indigo-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-indigo-600 uppercase flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Saldo do período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-700">{formatCurrency(summary?.saldo_realizado ?? 0)}</div>
          <p className="text-[10px] text-indigo-600/70 mt-1">
            Acumulado: {formatCurrency(summary?.saldo_realizado_acumulado ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-amber-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-amber-600 uppercase flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Eficiência de cobrança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700">{summary?.eficiencia_entrada ?? 0}%</div>
          <p className="text-[10px] text-amber-600/70 mt-1">
            Pago das contas que vencem no período
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-zinc-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500 uppercase flex items-center gap-2">
            Em aberto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-800">{formatCurrency(summary?.em_aberto_entrada ?? 0)}</div>
          <p className="text-[10px] text-zinc-500 mt-1">
            A pagar: {formatCurrency(summary?.em_aberto_saida ?? 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <ReportLayout
        title="Fluxo de Caixa"
        description="Comparativo mensal entre o que vence (previsto) e o que entrou/saiu de fato (caixa), com saldo acumulado."
        filters={filters}
        printFilters={`Período: ${dataInicio ? format(parseISO(dataInicio), 'dd/MM/yyyy') : 'Início'} até ${dataFim ? format(parseISO(dataFim), 'dd/MM/yyyy') : 'Fim'}${tipo ? ` · ${tipo}` : ''}`}
        cards={cards}
        onExportExcel={handleExportExcel}
        isLoading={isLoading}
      >
        <div className="space-y-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-rose-700 font-medium">{error}</p>
              <Button variant="outline" size="sm" className="rounded-full h-8 gap-1.5" onClick={refresh}>
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar de novo
              </Button>
            </div>
          )}

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-zinc-100">
              <CardTitle className="text-lg font-semibold text-zinc-800">
                Caixa realizado e saldo acumulado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="h-[360px] flex items-center justify-center text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : data.length === 0 ? (
                <p className="h-[200px] flex items-center justify-center text-sm text-zinc-400">
                  Nenhum dado encontrado para o período.
                </p>
              ) : (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="periodo"
                        tickFormatter={formatPeriodo}
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={formatCompact}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value: number | string | undefined) => formatCurrency(Number(value || 0))}
                        labelFormatter={(label) => formatPeriodo(String(label))}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="previsto_entrada" name="Previsto entrada" fill="#86efac" fillOpacity={0.45} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="realizado_entrada" name="Caixa entrada" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="previsto_saida" name="Previsto saída" fill="#fda4af" fillOpacity={0.45} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="realizado_saida" name="Caixa saída" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="saldo_realizado_acumulado"
                        name="Saldo acumulado"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {(categoriasPeriodo.entradas.length > 0 || categoriasPeriodo.saidas.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-zinc-100">
                  <CardTitle className="text-lg font-semibold text-zinc-800">Entradas por categoria</CardTitle>
                  <p className="text-xs text-zinc-400 font-medium">Caixa realizado no período</p>
                </CardHeader>
                <CardContent className="p-0">
                  {categoriasPeriodo.entradas.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-8">Nenhuma entrada no período.</p>
                  ) : (
                    <ul className="divide-y divide-zinc-100">
                      {categoriasPeriodo.entradas.map((item) => (
                        <li key={item.categoria} className="flex items-center justify-between px-5 py-3">
                          <span className="text-sm font-medium text-zinc-700 truncate pr-3">{item.categoria}</span>
                          <span className="text-sm font-bold text-emerald-600 shrink-0">{formatCurrency(item.valor)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-zinc-100">
                  <CardTitle className="text-lg font-semibold text-zinc-800">Saídas por categoria</CardTitle>
                  <p className="text-xs text-zinc-400 font-medium">Caixa realizado no período</p>
                </CardHeader>
                <CardContent className="p-0">
                  {categoriasPeriodo.saidas.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-8">Nenhuma saída no período.</p>
                  ) : (
                    <ul className="divide-y divide-zinc-100">
                      {categoriasPeriodo.saidas.map((item) => (
                        <li key={item.categoria} className="flex items-center justify-between px-5 py-3">
                          <span className="text-sm font-medium text-zinc-700 truncate pr-3">{item.categoria}</span>
                          <span className="text-sm font-bold text-rose-600 shrink-0">{formatCurrency(item.valor)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-zinc-100">
              <CardTitle className="text-lg font-semibold text-zinc-800">
                Detalhamento mensal
              </CardTitle>
              <p className="text-xs text-zinc-400 font-medium">Clique em um mês para ver as contas ou os pagamentos.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 border-zinc-100">
                      <TableHead className="font-bold text-zinc-600">Período</TableHead>
                      <TableHead className="font-bold text-zinc-600 text-right">Prev. entrada</TableHead>
                      <TableHead className="font-bold text-emerald-700 text-right">Caixa entrada</TableHead>
                      <TableHead className="font-bold text-zinc-600 text-right">Aberto</TableHead>
                      <TableHead className="font-bold text-rose-600 text-right">Prev. saída</TableHead>
                      <TableHead className="font-bold text-rose-600 text-right">Caixa saída</TableHead>
                      <TableHead className="font-bold text-indigo-600 text-right">Saldo mês</TableHead>
                      <TableHead className="font-bold text-indigo-700 text-right">Acumulado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-zinc-400">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          Carregando dados...
                        </TableCell>
                      </TableRow>
                    ) : data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-zinc-400">
                          Nenhum dado encontrado para o período.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => (
                        <TableRow
                          key={item.periodo}
                          className="border-zinc-100 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                          onClick={() => void abrirMovimentos(item.periodo, 'realizado')}
                        >
                          <TableCell className="font-medium text-zinc-700">
                            <div className="flex flex-col">
                              <span className="capitalize">{formatPeriodo(item.periodo)}</span>
                              <button
                                type="button"
                                className="text-[10px] text-indigo-600 font-bold text-left hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void abrirMovimentos(item.periodo, 'previsto');
                                }}
                              >
                                Ver previstos
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-zinc-500">{formatCurrency(item.previsto_entrada)}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(item.realizado_entrada)}</TableCell>
                          <TableCell className="text-right text-amber-700">{formatCurrency(item.em_aberto_entrada)}</TableCell>
                          <TableCell className="text-right text-rose-300">{formatCurrency(item.previsto_saida)}</TableCell>
                          <TableCell className="text-right font-semibold text-rose-600">{formatCurrency(item.realizado_saida)}</TableCell>
                          <TableCell className={`text-right font-bold ${item.saldo_realizado >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
                            {formatCurrency(item.saldo_realizado)}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${item.saldo_realizado_acumulado >= 0 ? 'text-indigo-800' : 'text-rose-700'}`}>
                            {formatCurrency(item.saldo_realizado_acumulado)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ReportLayout>

      <FluxoCaixaMovimentosDialog
        open={movimentosOpen}
        onOpenChange={setMovimentosOpen}
        isLoading={movimentosLoading}
        movimentos={movimentos}
        periodo={movimentoMeta?.periodo ?? null}
        origem={movimentoMeta?.origem ?? null}
      />
    </>
  );
};

export default FluxoCaixaPage;
