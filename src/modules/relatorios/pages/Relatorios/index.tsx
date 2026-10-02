import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Link } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Music,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

const reportCategories = [
  {
    title: "Financeiro",
    description: "Controle de receitas, despesas e fluxo de caixa.",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    reports: [
      {
        name: "Relatório de Inadimplência",
        path: "/relatorios/financeiro/inadimplencia",
        description: "Alunos com mensalidades atrasadas.",
        isReady: true
      },
      {
        name: "Fluxo de Caixa",
        path: "/relatorios/financeiro/fluxo-caixa",
        description: "Entradas vs Saídas mensais.",
        isReady: true
      },
    ]
  },
  {
    title: "Acadêmico",
    description: "Frequência, absenteísmo e diários de classe.",
    icon: Users,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    reports: [
      {
        name: "Frequência e Absenteísmo",
        path: "/relatorios/academico/absenteismo",
        description: "Controle de faltas por período.",
        isReady: true
      },
      {
        name: "Diário de Classe",
        path: "/relatorios/academico/diario-classe",
        description: "Mapa de presença por turma.",
        isReady: true
      },
    ]
  },
  {
    title: "Comercial e Gestão",
    description: "Leads, conversão e aniversariantes.",
    icon: TrendingUp,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    reports: [
      {
        name: "Aniversariantes do Mês",
        path: "/relatorios/comercial/aniversariantes",
        description: "Alunos e professores.",
        isReady: true
      },
      {
        name: "Funil de Vendas",
        path: "/relatorios/comercial/funil",
        description: "Conversão de leads em matrículas.",
        isReady: true
      },
    ]
  },
  {
    title: "Logística",
    description: "Instrumentos e FIGURINOS.",
    icon: Music,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    reports: [
      {
        name: "Inventário de Instrumentos",
        path: "/relatorios/logistica/inventario-instrumentos",
        description: "Disponibilidade e manutenção.",
        isReady: true
      },
    ]
  }
];

export const RelatoriosPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Relatórios <span className="text-indigo-600">e Insights</span>
        </h1>
        <p className="text-zinc-500 mt-2">Escolha uma categoria para visualizar os relatórios disponíveis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reportCategories.map((category) => (
          <Card key={category.title} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-3 rounded-2xl ${category.color}`}>
                <category.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-zinc-600">
                <CardTitle className="text-xl font-bold">{category.title}</CardTitle>
                <CardDescription className="text-sm font-medium">{category.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {category.reports.map((report) => (
                  <div key={report.name} className="group">
                    {report.isReady ? (
                      <Link
                        to={report.path}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all font-bold group-hover:cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                            {report.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-medium">
                            {report.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ) : (
                      <div
                        className="flex items-center justify-between p-3 rounded-xl grayscale opacity-60 border border-transparent"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-zinc-700">
                            {report.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            {report.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tight bg-zinc-100 text-zinc-400">Em Breve</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatoriosPage;
