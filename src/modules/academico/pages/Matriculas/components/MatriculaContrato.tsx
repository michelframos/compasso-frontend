import React from 'react';

import { BookOpen, Printer, FileText } from 'lucide-react';

import { Card, CardContent } from '@/shared/components/ui/card';

import { Button } from '@/shared/components/ui/button';

import { substituirPlaceholders } from '@/shared/lib/contrato-utils';

import { printContract } from '@/shared/lib/print-utils';

import type { Matricula } from '../types';



interface MatriculaContratoProps {

  matricula: Matricula;

}



export const MatriculaContrato: React.FC<MatriculaContratoProps> = ({ matricula }) => {

  const handlePrint = () => {

    if (!matricula.contrato_gerado) return;



    const alunoNome = matricula.aluno?.usuario?.nome || 'Aluno';

    const conteudoFinal = substituirPlaceholders(matricula.contrato_gerado, {

      aluno: matricula.aluno as any,

      turma: matricula.turma as any,

      data_matricula: matricula.data

    });



    printContract(conteudoFinal, `Contrato de Matrícula - ${alunoNome}`);

  };



  if (!matricula.contrato_gerado) {

    return (

      <div className="flex flex-col items-center justify-center py-12 text-center">

        <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

          <FileText className="w-8 h-8" />

        </div>

        <h3 className="text-lg font-bold text-zinc-900">Nenhum contrato gerado</h3>

        <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">

          Esta matrícula não possui um contrato gerado. Verifique se um template foi selecionado nos dados gerais.

        </p>

      </div>

    );

  }



  return (

    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">

          <FileText className="w-5 h-5 text-indigo-600" />

          Contrato da Matrícula

        </h3>

      </div>



      <Card className="border-zinc-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-colors">

        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col md:flex-row md:items-center items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">

              <BookOpen className="w-6 h-6" />

            </div>

            <div>

              <h4 className="text-base font-bold text-zinc-900 leading-none">

                Contrato de Matrícula - {matricula.turma?.curso?.nome || 'Curso'}

              </h4>

              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider font-semibold flex items-center gap-2">

                {matricula.turma?.descricao || `Turma #${matricula.id_turma}`}

                <span className="text-zinc-300">•</span>

                Gerado em {new Date(matricula.data).toLocaleDateString('pt-BR')}

              </p>

            </div>

          </div>



          <Button

            type="button"

            onClick={handlePrint}

            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-11 px-8 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all hover:cursor-pointer w-full md:w-auto"

          >

            <Printer className="w-5 h-5" />

            Imprimir Contrato

          </Button>

        </CardContent>

      </Card>



      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">

        <div className="p-2 bg-white rounded-xl shadow-sm h-fit">

          <FileText className="w-4 h-4 text-amber-600" />

        </div>

        <div className="space-y-1">

          <p className="text-sm font-bold text-amber-900">Dica de Impressão</p>

          <p className="text-xs text-amber-700 leading-relaxed">

            O contrato exibido aqui é um registro histórico do momento em que a matrícula foi realizada.

            Se os dados do aluno ou da turma mudarem, o conteúdo deste contrato permanecerá o mesmo para fins de auditoria.

          </p>

        </div>

      </div>

    </div>

  );

};
