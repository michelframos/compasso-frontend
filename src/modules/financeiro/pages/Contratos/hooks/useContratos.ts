import { useCallback, useMemo } from 'react';
import { useContratoStore } from '@/modules/financeiro/store/useContratoStore';

export const useContratos = () => {
  const { 
    contratos, 
    isLoading, 
    pagination, 
    fetchContratos, 
    deleteContrato,
    addContrato,
    updateContrato
  } = useContratoStore();

  const fetch = useCallback((page = 1, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string) => {
    return fetchContratos(page, sortBy, sortOrder, search);
  }, [fetchContratos]);

  const result = useMemo(() => ({
    contratos,
    isLoading,
    pagination,
    fetchContratos: fetch,
    deleteContrato,
    addContrato,
    updateContrato
  }), [contratos, isLoading, pagination, fetch, deleteContrato, addContrato, updateContrato]);

  return result;
};
