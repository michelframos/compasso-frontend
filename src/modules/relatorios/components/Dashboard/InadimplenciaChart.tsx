import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface InadimplenciaData {
  name: string;
  value: number;
}

interface InadimplenciaChartProps {
  data: InadimplenciaData[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const InadimplenciaChart: React.FC<InadimplenciaChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const atrasado = data.find(d => d.name === 'Atrasado')?.value || 0;
  const percentualAtraso = total > 0 ? (atrasado / total) * 100 : 0;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-zinc-900">Índice de Inadimplência</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-18px]">
            <span className="text-2xl font-black text-zinc-900">{percentualAtraso.toFixed(1)}%</span>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Atraso</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
