import React from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { useTurmas } from './hooks/useTurmas';

import type { Turma } from './types';

import { TurmaForm } from './components/TurmaForm';



export const TurmaFormPage: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { turmas, isLoading: isLoadingList } = useTurmas();



  // Se for edição, tentamos encontrar a turma na lista (contexto inicial)

  const turma = id && !isNaN(Number(id)) 

    ? (turmas.find(t => t.id === Number(id)) || { id: Number(id) } as unknown as Turma)

    : undefined;



  const handleBack = () => {

    navigate('/turmas');

  };



  const handleSuccess = (id?: number) => {

    if (id) {

      navigate(`/turmas/${id}`);

    } else {

      navigate('/turmas');

    }

  };



  if (id && isLoadingList && !turma) {

    return (

      <div className="flex items-center justify-center py-20">

        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

      </div>

    );

  }



  return (

    <div className="space-y-6 mx-auto">

      {/* Header com Botão Voltar */}

      <div className="flex items-center gap-4">

        <Button 

          variant="ghost" 

          size="icon" 

          onClick={handleBack}

          className="rounded-full h-10 w-10 hover:bg-white hover:text-indigo-600 shadow-sm border border-zinc-100 hover:cursor-pointer transition-all"

        >

          <ChevronLeft className="w-5 h-5" />

        </Button>

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">

            {id ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Turma</span>

          </h1>

          <p className="text-zinc-500 text-[14px]">

            {id ? 'Altere as configurações e dados básicos desta turma.' : 'Preencha as informações para abrir uma nova turma.'}

          </p>

        </div>

      </div>



      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100">

        <TurmaForm 

          turma={turma} 

          onClose={handleBack} 

          onSuccess={handleSuccess} 

        />

      </div>

    </div>

  );

};



export default TurmaFormPage;
