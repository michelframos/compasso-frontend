import { useState, useCallback, useEffect } from 'react';

import api from '@/shared/lib/axios';

import { getErrorMessage } from '@/shared/lib/utils';

import type { Curso, PaginatedResponse, PaginationMeta } from '../types';

import { toast } from 'sonner';

import { useCursoForm } from './useCursoForm';

import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';



export const useCursos = () => {

  const [cursos, setCursos] = useState<Curso[]>([]);

  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedCurso, setSelectedCurso] = useState<Curso | undefined>(undefined);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({

    key: 'nome',

    direction: 'asc',

  });

  const [searchTerm, setSearchTerm] = useState('');



  const fetchCursos = useCallback(async (page = 1, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string) => {

    try {

      setIsLoading(true);

      setError(null);

      const response = await api.get<PaginatedResponse<Curso>>('/cursos', {

        params: {

          page,

          sort_by: sortBy,

          sort_order: sortOrder,

          search: search

        }

      });



      const payload = response.data;

      setCursos(payload.data);

      setPagination(payload.meta);

    } catch (err: unknown) {

      setError(getErrorMessage(err, 'Erro ao carregar cursos'));

      console.error('Error fetching cursos:', err);

    } finally {

      setIsLoading(false);

    }

  }, []);



  const deleteCurso = async (id: number) => {

    try {

      await api.delete(`/cursos/${id}`);

      setCursos(prev => prev.filter(c => c.id !== id));

      return true;

    } catch (err: unknown) {

      console.error('Error deleting curso:', err);

      throw err;

    }

  };



  const handleFormSuccess = (id?: number) => {

    setIsFormOpen(false);

    fetchCursos(pagination?.current_page || 1, sortConfig.key, sortConfig.direction, searchTerm);

  };



  const { form, handleManualSubmit } = useCursoForm(handleFormSuccess, selectedCurso);



  const handleOpenCreate = () => {

    setSelectedCurso(undefined);

    form.reset({ nome: '', descricao: '', contrato_id: null });

    setIsFormOpen(true);

  };



  const handleOpenEdit = (curso: Curso) => {

    setSelectedCurso(curso);

    form.reset({ nome: curso.nome, descricao: curso.descricao || '', contrato_id: curso.contrato_id || null });

    setIsFormOpen(true);

  };



  const handleDeleteConfirm = async () => {

    if (!deletingId) return;

    try {

      await deleteCurso(deletingId);

      toast.success('Curso excluído com sucesso!');

    } catch (err: unknown) {

      console.error('Delete error:', err);

      toast.error(getErrorMessage(err, 'Erro ao excluir curso.'));

    } finally {

      setDeletingId(null);

    }

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



  // Debounce search

  useEffect(() => {

    const timer = setTimeout(() => {

      fetchCursos(1, sortConfig.key, sortConfig.direction, searchTerm);

    }, 500);

    return () => clearTimeout(timer);

  }, [searchTerm, sortConfig.key, sortConfig.direction, fetchCursos]);



  useEffect(() => {

    if (isFormOpen) {

      if (selectedCurso) {

        form.reset({

          nome: selectedCurso.nome,

          descricao: selectedCurso.descricao || '',

          contrato_id: selectedCurso.contrato_id || null,

        });

      } else {

        form.reset({ nome: '', descricao: '', contrato_id: null });

      }

    }

  }, [isFormOpen, selectedCurso]);



  return {

    cursos,

    pagination,

    isLoading,

    error,

    deletingId,

    isFormOpen,

    selectedCurso,

    sortConfig,

    searchTerm,

    form,

    setDeletingId,

    setIsFormOpen,

    setSelectedCurso,

    setSortConfig,

    setSearchTerm,

    fetchCursos,

    deleteCurso,

    handleFormSuccess,

    handleOpenCreate,

    handleOpenEdit,

    handleDeleteConfirm,

    handleSort,

    SortIcon,

    handleManualSubmit,

  };

};
