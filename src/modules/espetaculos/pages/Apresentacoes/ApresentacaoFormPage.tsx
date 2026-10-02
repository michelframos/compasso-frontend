import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useApresentacoes } from './hooks/useApresentacoes';
import { ApresentacaoForm } from './components/ApresentacaoForm';

export const ApresentacaoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apresentacoes, isLoading: isLoadingList } = useApresentacoes();

  const apresentacao = id && !isNaN(Number(id)) 
    ? apresentacoes.find(p => p.id === Number(id))
    : undefined;

  const handleBack = () => {
    navigate('/apresentacoes');
  };

  const handleSuccess = (id?: number) => {
    if (id) {
      navigate(`/apresentacoes/${id}`);
    } else {
      navigate('/apresentacoes');
    }
  };

  if (id && isLoadingList && !apresentacao) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto">
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
            {id ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Apresentação</span>
          </h1>
          <p className="text-zinc-500 text-[14px]">
            {id ? 'Gerencie os dados e participantes da apresentação.' : 'Preencha as informações para adicionar uma nova apresentação em um espetáculo.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100 overflow-hidden">
        <ApresentacaoForm 
          apresentacao={apresentacao}
          onClose={handleBack} 
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
};

export default ApresentacaoFormPage;
