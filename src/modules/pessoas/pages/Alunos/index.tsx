import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, Trash2, Edit, ChevronUp, ChevronDown, ChevronsUpDown, Search, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAlunos } from './hooks/useAlunos';
import type { Aluno } from './types';
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { PaginationCustom } from '@/shared/components/ui/pagination-custom';
import { CustomTable } from '@/shared/components/CustomTable';
import { CustomRow } from '@/shared/components/CustomTable/CustomRow';
import { CustomColumn } from '@/shared/components/CustomTable/CustonColumn';
import { PageHeader } from '@/shared/components/PageHeader';
import { CustomCircularLoading } from '@/shared/components/CustomCircularLoading';
import { NoData } from '@/shared/components/NoData';
import { useAuthStore } from '@/shared/store/useAuthStore';

export const AlunosPage: React.FC = () => {
    const { alunos, pagination, isLoading, error, deleteAluno, fetchAlunos } = useAlunos();
    const navigate = useNavigate();
    const tenant = useAuthStore((s) => s.tenant);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'usuarios.nome',
        direction: 'asc',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const limiteAlunos = tenant?.limite_alunos ?? null;
    const totalAlunos = pagination?.total ?? 0;
    const atLimit = limiteAlunos != null && totalAlunos >= limiteAlunos;
    const nearLimit = limiteAlunos != null && !atLimit && totalAlunos >= Math.ceil(limiteAlunos * 0.9);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAlunos(1, sortConfig.key, sortConfig.direction, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, sortConfig.key, sortConfig.direction, fetchAlunos]);

    const handleOpenCreate = () => {
        if (atLimit) {
            toast.error('Limite de alunos do plano atingido. Faça upgrade para continuar.');
            return;
        }
        navigate('/alunos/novo');
    };

    const handleOpenEdit = (aluno: Aluno) => {
        navigate(`/alunos/${aluno.id}`);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        try {
            await deleteAluno(deletingId);
            toast.success('Aluno excluído com sucesso!');
        } catch (err: unknown) {
            console.error('Delete error:', err);
            toast.error(getErrorMessage(err, 'Erro ao excluir aluno.'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleSort = (key: string) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="w-3 h-3 ml-1 text-indigo-600" /> :
            <ChevronDown className="w-3 h-3 ml-1 text-indigo-600" />;
    };

    return (
        <div className="space-y-6">
            {(atLimit || nearLimit) && (
                <div
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                        atLimit
                            ? 'border-amber-200 bg-amber-50 text-amber-900'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                >
                    <div className="flex items-start gap-2 flex-1">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${atLimit ? 'text-amber-600' : 'text-zinc-500'}`} />
                        <p>
                            {atLimit
                                ? `Limite de ${limiteAlunos} alunos do plano atingido (${totalAlunos}/${limiteAlunos}). Faça upgrade para cadastrar novos alunos.`
                                : `Você está próximo do limite do plano (${totalAlunos}/${limiteAlunos} alunos).`}
                        </p>
                    </div>
                    <Button asChild size="sm" className="rounded-full shrink-0 bg-indigo-600 hover:bg-indigo-700">
                        <Link to="/assinatura">Ver planos</Link>
                    </Button>
                </div>
            )}

            {/* Header */}
            <PageHeader
                firstChunkText="Gestão de"
                secondChunkText="Alunos"
                description="Visualize e gerencie os alunos da sua escola."
                onClick={handleOpenCreate}
                showAddButton={!atLimit}
                textAddButton="Novo Aluno"
                searchPlaceholder='Pesquisar alunos...'
                search={setSearchTerm}
                searchTerm={searchTerm}
            />

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Listagem */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <CustomCircularLoading />
                ) : alunos.length === 0 ? (
                    <NoData
                        icon={<Users className="w-8 h-8" />}
                        title='Nenhum aluno encontrado'
                        description='Comece cadastrando seu primeiro aluno clicando no botão acima.'
                        onClick={handleOpenCreate}
                    />
                ) : (
                    <>
                        <CustomTable
                            columns={[
                                {
                                    field: 'usuarios.nome',
                                    title: 'Aluno',
                                    icon: SortIcon,
                                    sortable: true,
                                    onSort: handleSort,
                                },
                                {
                                    field: 'usuarios.email',
                                    title: 'Contato',
                                    icon: SortIcon,
                                    sortable: true,
                                    onSort: handleSort,
                                },
                                {
                                    field: 'cpf',
                                    title: 'CPF',
                                    icon: SortIcon,
                                    sortable: true,
                                    onSort: handleSort,
                                },
                                {
                                    title: 'Ações',
                                    sortable: false,
                                },
                            ]}
                            rows={alunos.map(aluno => ({
                                renderField: (
                                    <>
                                        <CustomRow key={aluno.id}>
                                            <CustomColumn>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                        {aluno.usuario.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 leading-none">{aluno.usuario.nome}</p>
                                                        <p className="text-[11px] text-zinc-500 mt-1">ID: #{aluno.id}</p>
                                                    </div>
                                                </div>
                                            </CustomColumn>
                                            <CustomColumn>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {aluno.usuario.email}
                                                    </div>
                                                    {aluno.usuario.telefone && (
                                                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {aluno.usuario.telefone}
                                                        </div>
                                                    )}
                                                </div>
                                            </CustomColumn>
                                            <CustomColumn>
                                                <p className="text-xs text-zinc-600">{aluno.usuario.cpf}</p>
                                            </CustomColumn>
                                            <CustomColumn className='text-right'>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                                                        onClick={() => handleOpenEdit(aluno)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                                                        onClick={() => setDeletingId(aluno.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CustomColumn>
                                        </CustomRow>
                                    </>
                                )
                            }))}
                            mobileCards={alunos.map(aluno => ({
                                header: (
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
                                            {aluno.usuario.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[15px] font-bold text-zinc-900 truncate">{aluno.usuario.nome}</h3>
                                            <p className="text-xs text-zinc-500 font-medium tracking-tight">CPF: {aluno.usuario.cpf}</p>
                                        </div>
                                    </div>
                                ),
                                content: [
                                    {
                                        icon: <Mail className="w-3.5 h-3.5" />,
                                        label: aluno.usuario.email,
                                    },
                                    {
                                        icon: <Phone className="w-3.5 h-3.5" />,
                                        label: aluno.usuario.telefone,
                                    },
                                ],
                                buttons: (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 rounded-full border-zinc-200 text-xs font-bold px-4 gap-2 flex-1 hover:cursor-pointer"
                                            onClick={() => handleOpenEdit(aluno)}
                                        >
                                            <Edit className="w-4 h-4 text-indigo-600" />
                                            Editar Aluno
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50 hover:cursor-pointer"
                                            onClick={() => setDeletingId(aluno.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ),
                            }))}
                        />

                    </>
                )}

                {pagination && pagination.last_page > 1 && (
                    <PaginationCustom
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={(page) => fetchAlunos(page, sortConfig.key, sortConfig.direction, searchTerm)}
                        isLoading={isLoading}
                    />
                )}
            </div>

            <ConfirmDeleteDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title={<>Excluir <span className="text-rose-500">Aluno</span></>}
                description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno e removerá seus dados de nossos servidores."
                confirmLabel="Excluir"
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default AlunosPage;
