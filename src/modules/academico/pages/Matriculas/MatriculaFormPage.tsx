import React from 'react';

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { MatriculaForm } from './components/MatriculaForm';



export const MatriculaFormPage: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const [searchParams] = useSearchParams();

  const defaultAlunoId = searchParams.get('aluno_id');

  const defaultLeadId = searchParams.get('lead_id');

  const navigate = useNavigate();



  const handleBack = () => {

    navigate('/matriculas');

  };



  const handleSuccess = (id?: number) => {

    if (id) {

      navigate(`/matriculas/${id}`);

    } else {

      navigate('/matriculas');

    }

  };



  const initialData = React.useMemo(() =>

    id && !isNaN(Number(id)) ? { id: Number(id) } : undefined,

    [id]);



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

            {id ? 'Editar' : 'Nova'} <span className="text-indigo-600">Matrícula</span>

          </h1>

          <p className="text-zinc-500 text-[14px]">

            {id ? 'Altere os dados da matrícula selecionada.' : 'Preencha as informações para matricular um aluno em uma turma.'}

          </p>

        </div>

      </div>



      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100">

        <MatriculaForm

          initialData={initialData}

          onClose={handleBack}

          onSuccess={handleSuccess}

          defaultAlunoId={defaultAlunoId || undefined}

          defaultLeadId={defaultLeadId || undefined}

        />

      </div>

    </div>

  );

};



export default MatriculaFormPage;
