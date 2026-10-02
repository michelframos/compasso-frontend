import React, { useState, useEffect } from 'react';

import { ReportLayout } from '@/modules/relatorios/components/ReportLayout';

import { DiarioView } from './components/DiarioView';

import { useDiarioClasse } from './hooks/useDiarioClasse';

import { useReportStore } from '@/modules/relatorios/store/useReportStore';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { Loader2, Printer, Users, Calendar } from 'lucide-react';

import { format } from 'date-fns';

import api from '@/shared/lib/axios';

import { ptBR } from 'date-fns/locale';



interface Turma {

  id: number;

  descricao?: string;

  curso?: {

    nome: string;

  };

}



const DiarioClassePage: React.FC = () => {

  const { data, isLoading } = useDiarioClasse();

  const {

    id_turma,

    setIdTurma,

    data_inicio,

    setDataInicio,

    data_fim,

    setDataFim

  } = useReportStore();

  const [turmas, setTurmas] = useState<Turma[]>([]);

  const [isBlankPrint, setIsBlankPrint] = useState(false);



  useEffect(() => {

    const handleAfterPrint = () => {

      setIsBlankPrint(false);

    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => window.removeEventListener('afterprint', handleAfterPrint);

  }, []);



  useEffect(() => {

    const fetchTurmas = async () => {

      try {

        const response = await api.get('/turmas');

        const turmasData = response.data.data || response.data;

        setTurmas(Array.isArray(turmasData) ? turmasData : []);

      } catch (error) {

        console.error('Erro ao buscar turmas:', error);

      }

    };

    fetchTurmas();

  }, []);



  const handlePrint = () => {

    window.print();

  };



  const handlePrintBlank = () => {

    setIsBlankPrint(true);

    setTimeout(() => {

      window.print();

    }, 100);

  };



  const filters = (

    <div className="flex flex-col md:flex-row items-end gap-3 flex-wrap">

      <div className="space-y-2 w-full lg:w-auto">

        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">

          <Calendar className="w-3 h-3" /> Início

        </label>

        <Input

          type="date"

          value={data_inicio}

          onChange={(e) => setDataInicio(e.target.value)}

          className="h-9 w-full lg:w-[150px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium"

        />

      </div>

      <div className="space-y-2 w-full lg:w-auto">

        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">

          <Calendar className="w-3 h-3" /> Fim

        </label>

        <Input

          type="date"

          value={data_fim}

          onChange={(e) => setDataFim(e.target.value)}

          className="h-9 w-full lg:w-[150px] rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm font-medium"

        />

      </div>

      <div className="space-y-2 w-full lg:w-auto">

        <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">

          <Users className="w-3 h-3" /> Turma

        </label>

        <Select value={id_turma} onValueChange={setIdTurma}>

          <SelectTrigger className="h-9 w-full lg:w-[250px] rounded-xl bg-zinc-50 border-zinc-200 text-sm font-medium">

            <SelectValue placeholder="Escolha uma turma..." />

          </SelectTrigger>

          <SelectContent className="rounded-xl border-zinc-100 shadow-xl">

            {turmas.map((turma) => (

              <SelectItem key={turma.id} value={turma.id.toString()}>

                {turma.descricao || turma.curso?.nome || `Turma #${turma.id}`}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

      </div>



      <div className="flex flex-col lg:flex-row gap-2 mt-4 lg:mt-0 items-end w-full lg:w-auto">

        <Button

          onClick={handlePrint}

          disabled={!data || isLoading}

          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-9 font-bold transition-all hover:cursor-pointer active:scale-95 gap-2 w-full lg:w-auto shadow-lg shadow-indigo-100"

        >

          <Printer className="h-4 w-4" />

          Imprimir Diário

        </Button>



        <Button

          onClick={handlePrintBlank}

          variant="outline"

          className="rounded-full px-6 h-9 font-bold transition-all hover:cursor-pointer active:scale-95 gap-2 w-full lg:w-auto shadow-sm border-zinc-200"

        >

          <Printer className="h-4 w-4" />

          Imprimir em Branco

        </Button>

      </div>

    </div>

  );



  return (

    <ReportLayout

      title="Diário de Classe"

      description="Gere o mapa da turma com histórico de frequência e conteúdos ministrados."

      filters={filters}

      printFilters={[

        `Período: ${data_inicio ? format(new Date(data_inicio), 'dd/MM/yyyy') : 'Início'} até ${data_fim ? format(new Date(data_fim), 'dd/MM/yyyy') : 'Fim'}`,

        id_turma && `Turma: ${turmas.find(t => t.id.toString() === id_turma)?.descricao || id_turma}`,

        isBlankPrint ? 'IMPRESSÃO EM BRANCO (MODELO)' : 'RELATÓRIO DE ATIVIDADES'

      ].filter(Boolean).join(' | ')}

      isLoading={isLoading}

    >

      {isLoading ? (

        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">

          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />

          <p className="text-sm font-medium animate-pulse">Carregando dados do diário...</p>

        </div>

      ) : isBlankPrint || data ? (

        <DiarioView data={data || { aulas: [], alunos: [], horarios: [] }} isBlank={isBlankPrint} />

      ) : (

        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/30">

          <div className="p-4 bg-white rounded-2xl shadow-sm border border-zinc-100 mb-4">

            <Users className="w-8 h-8 text-zinc-300" />

          </div>

          <p className="text-zinc-500 font-bold">Nenhuma turma selecionada</p>

          <p className="text-zinc-400 text-sm">Selecione uma turma e o período acima para gerar o diário.</p>

        </div>

      )}

    </ReportLayout>

  );

};



export default DiarioClassePage;
