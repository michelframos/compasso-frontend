import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useEspetaculos } from './hooks/useEspetaculos';
import type { Espetaculo } from './types';
import { EspetaculoForm } from './components/EspetaculoForm';

export const EspetaculoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { espetaculos, isLoading: isLoadingList } = useEspetaculos();

  const espetaculo = id && !isNaN(Number(id)) 
    ? (espetaculos.find(p => p.id === Number(id)) || { id: Number(id) } as unknown as Espetaculo)
    : undefined;

  const handleBack = () => {
    navigate('/espetaculos');
  };

  const handleSuccess = (id?: number) => {
    if (id) {
      navigate(`/espetaculos/${id}`);
    } else {
      navigate('/espetaculos');
    }
  };

  if (id && isLoadingList && !espetaculo) {
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
            {id ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Espetáculo</span>
          </h1>
          <p className="text-zinc-500 text-[14px]">
            {id ? 'Altere os dados do espetáculo.' : 'Preencha as informações para adicionar um novo evento.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100 overflow-hidden">
        <EspetaculoForm 
          espetaculo={espetaculo} 
          onClose={handleBack} 
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
};

export default EspetaculoFormPage;
