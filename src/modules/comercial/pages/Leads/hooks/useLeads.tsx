import { useState, useCallback, useEffect } from 'react';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { useLeadForm } from './useLeadForm';

export interface Lead {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: 'novo' | 'contatado' | 'matriculado' | 'perdido';
  observacoes: string | null;
  created_at: string;
}

export const useLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchLeads = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/leads?page=${page}`);
      setLeads(response.data.data);
      setPagination({
        current_page: response.data.meta.current_page,
        last_page: response.data.meta.last_page,
        total: response.data.meta.total
      });
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast.error(getErrorMessage(error, 'Não foi possível carregar a lista de leads.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLead = async (data: any) => {
    setIsLoading(true);
    try {
      await api.post('/leads', data);
      toast.success('Lead criado com sucesso!');
      fetchLeads();
      setIsModalOpen(false);
      return true;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast.error(getErrorMessage(error, 'Erro ao criar lead.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async (id: number, data: any) => {
    setIsLoading(true);
    try {
      await api.put(`/leads/${id}`, data);
      toast.success('Lead atualizado com sucesso!');
      fetchLeads();
      setIsModalOpen(false);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast.error(getErrorMessage(error, 'Erro ao atualizar lead.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLead = async (id: number) => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead excluído com sucesso!');
      fetchLeads();
      return true;
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast.error(getErrorMessage(error, 'Erro ao excluir lead.'));
      return false;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFormSubmit = async (data: any) => {
    if (editingLead) {
      return await updateLead(editingLead.id, data);
    } else {
      return await createLead(data);
    }
  };

  const { form, handleManualSubmit } = useLeadForm(handleFormSubmit, editingLead);

  useEffect(() => {
    if (isModalOpen) {
      if (editingLead) {
        form.reset({
          nome: editingLead.nome,
          email: editingLead.email || '',
          telefone: editingLead.telefone || '',
          status: editingLead.status,
          observacoes: editingLead.observacoes || '',
        });
      } else {
        form.reset({
          nome: '',
          email: '',
          telefone: '',
          status: 'novo',
          observacoes: '',
        });
      }
    }
  }, [isModalOpen, editingLead, form]);

  const handleOpenCreate = () => {
    setEditingLead(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleConvert = (lead: Lead) => {
    navigate(`/alunos/novo?lead_id=${lead.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    const success = await deleteLead(deletingId);
    if (success) {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'novo':
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Novo</Badge>;
      case 'contatado':
        return <Badge className="bg-amber-100 text-amber-600 hover:bg-amber-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Contatado</Badge>;
      case 'matriculado':
        return <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Matriculado</Badge>;
      case 'perdido':
        return <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Perdido</Badge>;
      default:
        return <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">{status}</Badge>;
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.telefone?.includes(searchTerm)
  );

  return {
    leads,
    isLoading,
    pagination,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingLead,
    setEditingLead,
    deletingId,
    setDeletingId,
    handleOpenCreate,
    handleOpenEdit,
    handleConvert,
    handleFormSubmit,
    handleDeleteConfirm,
    getStatusBadge,
    filteredLeads,
    form,
    handleManualSubmit
  };
};

