import React from 'react';

import { Music2 } from 'lucide-react';

import { format } from 'date-fns';

import { ptBR } from 'date-fns/locale';



interface PrintHeaderProps {

  title: string;

  description?: string;

  printFilters?: string | React.ReactNode;

}



export const PrintHeader: React.FC<PrintHeaderProps> = ({ title, description, printFilters }) => {

  const now = new Date();

  const formattedDate = format(now, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });



  return (

    <div className="hidden print:block mb-8 border-b-2 border-zinc-900 pb-6">

      <div className="flex justify-between items-start mb-6">

        <div className="flex items-center gap-3">

          <div className="p-2 bg-indigo-600 rounded-full text-white">

            <Music2 className="w-8 h-8" />

          </div>

          <div>

            <h2 className="text-2xl font-black text-zinc-900 leading-none">COMPASSO</h2>

            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mt-1">SISTEMA DE GESTÃO MUSICAL</p>

          </div>

        </div>

        <div className="text-right">

          <p className="text-[10px] font-bold text-zinc-400 tracking-wider">GERADO EM</p>

          <p className="text-xs font-bold text-zinc-700">{formattedDate}</p>

        </div>

      </div>



      <div className="space-y-1">

        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">{title}</h1>

        {description && (

          <p className="text-sm text-zinc-600 font-medium max-w-2xl">

            {description}

          </p>

        )}

      </div>



      {printFilters && (

        <div className="mt-4 pt-4 border-t border-zinc-100">

          <p className="text-[10px] font-bold text-zinc-400 tracking-wider mb-1 uppercase">Filtros Aplicados</p>

          <div className="text-xs text-zinc-700 font-bold whitespace-pre-wrap">

            {printFilters}

          </div>

        </div>

      )}

    </div>

  );

};
