import React, { useState, useEffect } from 'react';

import { Plus, Layers, Trash2, Edit, ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Card, CardContent } from '@/shared/components/ui/card';

import { useNiveis } from './hooks/useNiveis';

import type { Nivel } from './types';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogHeader,

  DialogTitle,

} from "@/components/ui/dialog";

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { NivelForm } from './components/NivelForm';

import { PaginationCustom } from '@/shared/components/ui/pagination-custom';



export const NiveisPage: React.FC = () => {

  const { niveis, pagination, isLoading, error, deleteNivel, fetchNiveis } = useNiveis();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedNivel, setSelectedNivel] = useState<Nivel | undefined>(undefined);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({

    key: 'nome',

    direction: 'asc',

  });

  const [searchTerm, setSearchTerm] = useState('');



  // Debounce search

  useEffect(() => {

    const timer = setTimeout(() => {

      fetchNiveis(1, sortConfig.key, sortConfig.direction, searchTerm);

    }, 500);

    return () => clearTimeout(timer);

  }, [searchTerm, sortConfig.key, sortConfig.direction, fetchNiveis]);



  const handleOpenCreate = () => {

    setSelectedNivel(undefined);

    setIsFormOpen(true);

  };



  const handleOpenEdit = (nivel: Nivel) => {

    setSelectedNivel(nivel);

    setIsFormOpen(true);

  };



  const handleDeleteConfirm = async () => {

    if (!deletingId) return;

    try {

      await deleteNivel(deletingId);

      toast.success('Nível excluído com sucesso!');

    } catch (err: unknown) {

      console.error('Delete error:', err);

      toast.error(getErrorMessage(err, 'Erro ao excluir nível.'));

    } finally {

      setDeletingId(null);

    }

  };



  const handleFormSuccess = (id?: number) => {

    // If it was a new record (no previous selection but we got an ID), 

    // we could keep it open, but since it's a modal and the list refreshes, 

    // it's safer to just close it as per standard modal behavior unless asked otherwise.

    // The main goal was "not redirecting" (navigating away).

    setIsFormOpen(false);

    fetchNiveis(pagination?.current_page || 1, sortConfig.key, sortConfig.direction, searchTerm);

  };



  const handleSort = (key: string) => {

    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {

      direction = 'desc';

    }

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

      {/* Header */}

      <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">

            Gestão de <span className="text-indigo-600">Níveis</span>

          </h1>

          <p className="text-zinc-500 mt-1 text-[14px]">Visualize e gerencie os níveis de ensino da sua escola.</p>

        </div>



        <div className="flex flex-col lg:flex-row md:items-center gap-3 w-full lg:w-auto">

          <div className="relative w-full lg:w-auto">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

            <Input

              placeholder="Pesquisar níveis..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="pl-9 h-9 rounded-full bg-white border-zinc-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"

            />

          </div>

          <Button

            onClick={handleOpenCreate}

            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"

          >

            <Plus className="w-4 h-4" />

            Novo Nível

          </Button>

        </div>

      </div>



      {error && (

        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">

          {error}

        </div>

      )}



      {/* Listagem */}

      <div className="grid grid-cols-1 gap-4">

        {isLoading ? (

          <div className="flex items-center justify-center py-20">

            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

          </div>

        ) : niveis.length === 0 ? (

          <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">

            <CardContent className="flex flex-col items-center justify-center py-12 text-center">

              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                <Layers className="w-8 h-8" />

              </div>

              <h3 className="text-lg font-bold text-zinc-900">Nenhum nível encontrado</h3>

              <p className="text-zinc-500 max-w-xs mx-auto mt-1">

                Comece cadastrando seu primeiro nível clicando no botão acima.

              </p>

            </CardContent>

          </Card>

        ) : (

          <Card className="overflow-hidden border-none shadow-sm bg-white">

            <CardContent className="p-0">

              {/* Desktop Table */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="bg-zinc-50/50 border-b border-zinc-100">

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                        onClick={() => handleSort('nome')}

                      >

                        <div className="flex items-center">

                          Nível

                          <SortIcon column="nome" />

                        </div>

                      </th>

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                        onClick={() => handleSort('observacoes')}

                      >

                        <div className="flex items-center">

                          Observações

                          <SortIcon column="observacoes" />

                        </div>

                      </th>

                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-zinc-50">

                    {niveis.map((nivel) => (

                      <tr key={nivel.id} className="hover:bg-zinc-50/50 transition-colors group">

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div 

                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"

                              style={{ 

                                backgroundColor: nivel.cor_identificacao ? `${nivel.cor_identificacao}20` : '#eef2ff',

                                color: nivel.cor_identificacao || '#4f46e5',

                                border: `1px solid ${nivel.cor_identificacao ? `${nivel.cor_identificacao}40` : '#e0e7ff'}`

                              }}

                            >

                              {nivel.nome.charAt(0).toUpperCase()}

                            </div>

                            <div>

                              <p className="text-sm font-bold text-zinc-900 leading-none">{nivel.nome}</p>

                              <div className="flex items-center gap-2 mt-1">

                                <p className="text-[11px] text-zinc-500">ID: #{nivel.id}</p>

                                {nivel.curso && (

                                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">

                                    {nivel.curso.nome}

                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-xs text-zinc-600 line-clamp-2 max-w-md">

                            {nivel.observacoes || <span className="text-zinc-400 italic">Sem observações</span>}

                          </p>

                          {nivel.expectativas_aprendizado && (

                            <p className="text-[11px] text-indigo-600 mt-1 font-medium truncate max-w-xs" title={nivel.expectativas_aprendizado}>

                              â˜… {nivel.expectativas_aprendizado}

                            </p>

                          )}

                        </td>

                        <td className="px-6 py-4 text-right">

                          <div className="flex items-center justify-end gap-2">

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                              onClick={() => handleOpenEdit(nivel)}

                            >

                              <Edit className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"

                              onClick={() => setDeletingId(nivel.id)}

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



              {/* Mobile Cards */}

              <div className="md:hidden divide-y divide-zinc-100">

                {niveis.map((nivel) => (

                  <div key={nivel.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">

                    <div className="flex items-center gap-3">

                      <div 

                        className="w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0"

                        style={{ 

                          backgroundColor: nivel.cor_identificacao ? `${nivel.cor_identificacao}20` : '#eef2ff',

                          color: nivel.cor_identificacao || '#4f46e5',

                          border: `1px solid ${nivel.cor_identificacao ? `${nivel.cor_identificacao}40` : '#e0e7ff'}`

                        }}

                      >

                        {nivel.nome.charAt(0).toUpperCase()}

                      </div>

                      <div className="flex-1 min-w-0">

                        <h3 className="text-[15px] font-bold text-zinc-900 truncate">{nivel.nome}</h3>

                        <div className="flex items-center gap-2 mt-0.5">

                          <p className="text-xs text-zinc-500 font-medium tracking-tight">ID: #{nivel.id}</p>

                          {nivel.curso && (

                            <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider truncate">

                              {nivel.curso.nome}

                            </span>

                          )}

                        </div>

                      </div>

                    </div>



                    <div className="space-y-1.5 px-1">

                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Observações</span>

                      <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">

                        {nivel.observacoes || <span className="text-zinc-400 italic">Sem observações exclusivas.</span>}

                      </p>

                      {nivel.expectativas_aprendizado && (

                        <div className="mt-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-50">

                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Expectativas</span>

                          <p className="text-xs text-indigo-700 leading-relaxed line-clamp-2">

                            {nivel.expectativas_aprendizado}

                          </p>

                        </div>

                      )}

                    </div>



                    <div className="flex items-center justify-end gap-2 pt-1">

                      <Button

                        variant="outline"

                        size="sm"

                        className="h-9 rounded-full border-zinc-200 text-xs font-bold px-4 gap-2 flex-1"

                        onClick={() => handleOpenEdit(nivel)}

                      >

                        <Edit className="w-4 h-4 text-indigo-600" />

                        Editar Nível

                      </Button>

                      <Button

                        variant="ghost"

                        size="icon"

                        className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50"

                        onClick={() => setDeletingId(nivel.id)}

                      >

                        <Trash2 className="w-4 h-4" />

                      </Button>

                    </div>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}



        {pagination && pagination.last_page > 1 && (

          <PaginationCustom

            currentPage={pagination.current_page}

            lastPage={pagination.last_page}

            onPageChange={(page) => fetchNiveis(page, sortConfig.key, sortConfig.direction, searchTerm)}

            isLoading={isLoading}

          />

        )}

      </div>



      {/* Form Modal */}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>

        <DialogContent className="sm:max-w-[500px] p-0 rounded-[24px] border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          <DialogHeader className="p-8 pb-0 shrink-0">

            <DialogTitle className="text-2xl font-bold text-zinc-900">

              {selectedNivel ? 'Editar' : 'Cadastrar'} <span className="text-indigo-600">Nível</span>

            </DialogTitle>

            <DialogDescription className="text-zinc-500">

              {selectedNivel ? 'Altere os dados do nível selecionado.' : 'Preencha as informações para adicionar um novo nível.'}

            </DialogDescription>

          </DialogHeader>

          <NivelForm

            nivel={selectedNivel}

            onClose={() => setIsFormOpen(false)}

            onSuccess={handleFormSuccess}

          />

        </DialogContent>

      </Dialog>



      <ConfirmDeleteDialog

        open={!!deletingId}

        onOpenChange={(open) => !open && setDeletingId(null)}

        title={<>Excluir <span className="text-rose-500">Nível</span></>}

        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o nível e todas as informações relacionadas."

        confirmLabel="Excluir"

        onConfirm={handleDeleteConfirm}

      />

    </div>

  );

};



export default NiveisPage;
