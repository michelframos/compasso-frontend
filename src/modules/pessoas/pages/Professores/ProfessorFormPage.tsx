import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useProfessores } from './hooks/useProfessores';
import type { Professor } from './hooks/useProfessores';
import { ProfessorForm } from './components/ProfessorForm';

export const ProfessorFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { professores, isLoading: isLoadingList } = useProfessores();

  // Find the professor in the list if we have it (for initial context)
  // useProfessorForm will fetch the full data anyway
  const professor = id && !isNaN(Number(id)) 
    ? (professores.find(p => p.id === Number(id)) || { id: Number(id) } as unknown as Professor)
    : undefined;

  const handleBack = () => {
    navigate('/professores');
  };

  const handleSuccess = (id?: number) => {
    if (id) {
      navigate(`/professores/${id}`);
    } else {
      navigate('/professores');
    }
  };

  if (id && isLoadingList && !professor) {
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
            {id ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Professor</span>
          </h1>
          <p className="text-zinc-500 text-[14px]">
            {id ? 'Altere os dados e visualize as turmas vinculadas.' : 'Preencha as informações para adicionar um novo docente.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100">
        <ProfessorForm 
          professor={professor} 
          onClose={handleBack} 
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
};

export default ProfessorFormPage;
