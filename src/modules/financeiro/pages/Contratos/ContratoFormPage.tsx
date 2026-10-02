import React, { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { ContratoForm } from './components/ContratoForm';

import api from '@/shared/lib/axios';

import type { Contrato } from '@/modules/financeiro/store/useContratoStore';



export const ContratoFormPage: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [contrato, setContrato] = useState<Contrato | undefined>(undefined);

  const [loading, setLoading] = useState(!!id);



  useEffect(() => {

    const fetchContrato = async () => {

      if (!id) return;

      try {

        const response = await api.get(`/contratos/${id}`);

        setContrato(response.data.data);

      } catch (error) {

        console.error('Error fetching contrato:', error);

      } finally {

        setLoading(false);

      }

    };



    fetchContrato();

  }, [id]);



  const handleBack = () => {

    navigate('/contratos');

  };



  const handleSuccess = (id?: number) => {

    if (id) {

      navigate(`/contratos/${id}`);

    } else {

      navigate('/contratos');

    }

  };



  if (loading) {

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

            {id ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Contrato</span>

          </h1>

          <p className="text-zinc-500 text-[14px]">

            {id ? 'Altere o conteúdo do template de contrato.' : 'Defina o título e o conteúdo do novo template.'}

          </p>

        </div>

      </div>



      <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100">

        <ContratoForm 

          key={contrato?.id || 'new'}

          contrato={contrato} 

          onClose={handleBack} 

          onSuccess={handleSuccess} 

        />

      </div>

    </div>

  );

};



export default ContratoFormPage;
