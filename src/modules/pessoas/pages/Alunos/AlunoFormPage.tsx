import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAlunos } from './hooks/useAlunos';
import type { Aluno } from './types';
import { AlunoForm } from './components/AlunoForm';

export const AlunoFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const leadId = searchParams.get('lead_id');
    const navigate = useNavigate();
    const { alunos, isLoading: isLoadingList } = useAlunos();

    const aluno = id && !isNaN(Number(id))
        ? (alunos.find(a => a.id === Number(id)) || { id: Number(id) } as unknown as Aluno)
        : undefined;

    const handleBack = () => {
        navigate('/alunos');
    };

    const handleSuccess = (newId?: number) => {
        if (leadId && newId) {
            // Se veio de um lead, redireciona para criar a matrícula vinculando ambos
            navigate(`/matriculas/novo?aluno_id=${newId}&lead_id=${leadId}`);
        } else if (newId) {
            navigate(`/alunos/${newId}`);
        } else {
            navigate('/alunos');
        }
    };

    if (id && isLoadingList && !aluno) {
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
                        {id ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Aluno</span>
                    </h1>
                    <p className="text-zinc-500 text-[14px]">
                        {id ? 'Altere os dados e visualize as matrículas vinculadas.' : 'Preencha as informações para adicionar um novo aluno.'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100">
                <AlunoForm
                    aluno={aluno}
                    onClose={handleBack}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default AlunoFormPage;
