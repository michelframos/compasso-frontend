import React, { useState, useEffect } from 'react';

import { PlusCircle, Search, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Card, CardContent } from '@/shared/components/ui/card';

import { useCategoriasConta } from '../hooks/useCategoriasConta';

import { PaginationCustom } from '@/shared/components/ui/pagination-custom';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import {

    Dialog,

    DialogContent,

    DialogDescription,

    DialogHeader,

    DialogTitle,

} from "@/components/ui/dialog";

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import { CategoriaForm } from './CategoriaForm';

import type { CategoriaConta } from '../types';



export const CategoriasTab: React.FC = () => {

    const { categorias, pagination, isLoading, error, fetchCategorias, deleteCategoria } = useCategoriasConta();

    

    const [searchTerm, setSearchTerm] = useState('');

    const [filtroTipo, setFiltroTipo] = useState<string>('');

    

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [selectedCategoria, setSelectedCategoria] = useState<CategoriaConta | undefined>(undefined);

    const [deletingId, setDeletingId] = useState<number | null>(null);



    useEffect(() => {

        const timer = setTimeout(() => {

            fetchCategorias(1, 'nome', 'asc', searchTerm, filtroTipo);

        }, 500);

        return () => clearTimeout(timer);

    }, [searchTerm, filtroTipo, fetchCategorias]);



    const handleFormSuccess = () => {

        setIsFormOpen(false);

        fetchCategorias(pagination?.current_page || 1, 'nome', 'asc', searchTerm, filtroTipo);

    };



    const handleOpenCreate = () => {

        setSelectedCategoria(undefined);

        setIsFormOpen(true);

    };



    const handleOpenEdit = (categoria: CategoriaConta) => {

        setSelectedCategoria(categoria);

        setIsFormOpen(true);

    };



    const handleDeleteConfirm = async () => {

        if (!deletingId) return;

        try {

            await deleteCategoria(deletingId);

            toast.success('Categoria excluída com sucesso!');

        } catch (err: unknown) {

            console.error('Delete error', err);

            toast.error(getErrorMessage(err, 'Não foi possível excluir a categoria. Verifique se existem contas vinculadas.'));

        } finally {

            setDeletingId(null);

        }

    };



    return (

        <div className="space-y-6">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                <div>

                    <h2 className="text-xl font-bold text-zinc-900">Categorias de Contas</h2>

                    <p className="text-zinc-500 text-[14px]">Gerencie as categorias para organizar receitas e despesas.</p>

                </div>

                

                <Button 

                    onClick={handleOpenCreate}

                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-4 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"

                >

                    <PlusCircle className="w-4 h-4" />

                    Nova Categoria

                </Button>

            </div>



            <Card className="border-none shadow-sm bg-white overflow-visible">

                <CardContent className="p-4 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-2">

                            <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Pesquisa e Tipo</label>

                            <div className="flex flex-col md:flex-row gap-2">

                                <div className="relative flex-1">

                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

                                    <Input

                                        placeholder="Buscar por nome..."

                                        value={searchTerm}

                                        onChange={(e) => setSearchTerm(e.target.value)}

                                        className="pl-9 h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"

                                    />

                                </div>

                                <select

                                    className="h-9 px-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 hover:cursor-pointer focus:ring-2 focus:ring-indigo-500"

                                    value={filtroTipo}

                                    onChange={(e) => setFiltroTipo(e.target.value)}

                                >

                                    <option value="">Todos os Tipos</option>

                                    <option value="receita">Receitas</option>

                                    <option value="despesa">Despesas</option>

                                </select>

                            </div>

                        </div>

                    </div>

                </CardContent>

            </Card>



            {error && (

                <div className="flex p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium items-center gap-2">

                    <AlertCircle className="w-5 h-5" />

                    {error}

                </div>

            )}



            <div className="grid grid-cols-1 gap-4">

                {isLoading ? (

                    <div className="flex items-center justify-center py-20">

                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

                    </div>

                ) : categorias.length === 0 ? (

                    <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">

                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">

                            <h3 className="text-lg font-bold text-zinc-900 mt-4">Nenhuma categoria encontrada</h3>

                            <p className="text-zinc-500 max-w-xs mx-auto mt-1">

                                Tente ajustar seus filtros ou cadastre uma nova categoria.

                            </p>

                        </CardContent>

                    </Card>

                ) : (

                    <Card className="overflow-hidden border-none shadow-sm bg-white">

                        <CardContent className="p-0">

                            <div className="overflow-x-auto">

                                <table className="w-full text-left border-collapse">

                                    <thead>

                                        <tr>

                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider w-[100px]">Tipo</th>

                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Nome</th>

                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Descrição</th>

                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-zinc-50">

                                        {categorias.map(categoria => (

                                            <tr key={categoria.id} className="hover:bg-zinc-50/50 transition-colors group">

                                                <td className="px-6 py-4">

                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${categoria.tipo === 'receita' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>

                                                        {categoria.tipo === 'receita' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <p className="text-sm font-bold text-zinc-900 leading-none mb-1">{categoria.nome}</p>

                                                    <span className="text-[10px] text-zinc-400 capitalize">{categoria.tipo}</span>

                                                </td>

                                                <td className="px-6 py-4 hidden md:table-cell">

                                                    <p className="text-sm text-zinc-500 line-clamp-2">{categoria.descricao || '-'}</p>

                                                </td>

                                                <td className="px-6 py-4 text-right">

                                                    <div className="flex items-center justify-end gap-2">

                                                        <Button

                                                            variant="ghost"

                                                            size="icon"

                                                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                                                            onClick={() => handleOpenEdit(categoria)}

                                                        >

                                                            <Edit className="w-4 h-4" />

                                                        </Button>

                                                        <Button

                                                            variant="ghost"

                                                            size="icon"

                                                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"

                                                            onClick={() => setDeletingId(categoria.id)}

                                                        >

                                                            <Trash2 className="w-4 h-4" />

                                                        </Button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </CardContent>

                    </Card>

                )}

                

                {pagination && pagination.last_page > 1 && (

                    <PaginationCustom

                        currentPage={pagination.current_page}

                        lastPage={pagination.last_page}

                        onPageChange={(page) => fetchCategorias(page, 'nome', 'asc', searchTerm, filtroTipo)}

                        isLoading={isLoading}

                    />

                )}

            </div>



            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>

                <DialogContent className="sm:max-w-xl rounded-[32px] p-0 border-none shadow-2xl flex flex-col overflow-hidden">

                    <DialogHeader className="p-8 pb-0">

                        <DialogTitle className="text-2xl font-bold text-zinc-900">

                            {selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}

                        </DialogTitle>

                        <DialogDescription className="text-zinc-500">

                            Preencha as informações para organizar sua gestão financeira.

                        </DialogDescription>

                    </DialogHeader>

                    <CategoriaForm

                        categoria={selectedCategoria}

                        tipoFluxo={(filtroTipo as 'receita' | 'despesa') || 'despesa'}

                        onClose={() => setIsFormOpen(false)}

                        onSuccess={handleFormSuccess}

                    />

                </DialogContent>

            </Dialog>



            <ConfirmDeleteDialog

                open={!!deletingId}

                onOpenChange={(open) => !open && setDeletingId(null)}

                title={<>Excluir <span className="text-rose-500">Categoria</span></>}

                description="Esta ação não poderá ser desfeita. Tem certeza que deseja remover esta categoria?"

                onConfirm={handleDeleteConfirm}

            />

        </div>

    );

};
