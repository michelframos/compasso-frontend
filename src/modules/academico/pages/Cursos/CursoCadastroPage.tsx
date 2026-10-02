import React from 'react';

import { useNavigate } from 'react-router-dom';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { CursoForm } from './components/CursoForm';



export const CursoCadastroPage: React.FC = () => {

  const navigate = useNavigate();



  const handleBack = () => {

    navigate('/cursos');

  };



  const handleSuccess = () => {

    navigate('/cursos');

  };



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

            Cadastrar <span className="text-indigo-600">Curso</span>

          </h1>

          <p className="text-zinc-500 text-[14px]">

            Preencha as informações para adicionar um novo curso à grade.

          </p>

        </div>

      </div>



      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100 overflow-hidden">

        <CursoForm 

          onClose={handleBack} 

          onSuccess={handleSuccess} 

        />

      </div>

    </div>

  );

};



export default CursoCadastroPage;
