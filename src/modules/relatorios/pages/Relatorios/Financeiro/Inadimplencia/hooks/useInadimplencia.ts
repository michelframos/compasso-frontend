import { useState, useCallback, useEffect } from 'react';
import { getInadimplencia } from '@/modules/relatorios/api/relatorios';
import {
  previewContaNotificacao,
  enviarContaNotificacao,
  type ContaNotificacaoCanal,
  type ContaNotificacaoPreview,
} from '@/modules/notificacoes/api/notificacoes';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface InadimplenciaData {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  aluno: {
    id: number;
    usuario: {
      nome: string;
      whatsapp?: string;
      email?: string;
    };
    responsaveis: Array<{
      id: number;
      usuario: {
        nome: string;
        whatsapp?: string;
        email?: string;
      };
    }>;
  };
}

export interface InadimplenciaSummary {
  total_atraso: number;
  quantidade_vencidos: number;
}

export const useInadimplencia = () => {
  const { data_inicio, data_fim } = useReportStore();
  const [data, setData] = useState<InadimplenciaData[]>([]);
  const [summary, setSummary] = useState<InadimplenciaSummary>({
    total_atraso: 0,
    quantidade_vencidos: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyCanal, setNotifyCanal] = useState<ContaNotificacaoCanal | null>(null);
  const [notifyContaId, setNotifyContaId] = useState<number | null>(null);
  const [notifyPreview, setNotifyPreview] = useState<ContaNotificacaoPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchInadimplencia = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInadimplencia({ data_inicio, data_fim });
      setData(response.data);
      setSummary(response.summary);
    } catch (error) {
      console.error('Erro ao buscar inadimplência:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar o relatório de inadimplência.'));
    } finally {
      setIsLoading(false);
    }
  }, [data_inicio, data_fim]);

  useEffect(() => {
    fetchInadimplencia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotify = async (item: InadimplenciaData, canal: ContaNotificacaoCanal) => {
    setNotifyContaId(item.id);
    setNotifyCanal(canal);
    setNotifyPreview(null);
    setNotifyOpen(true);
    setIsLoadingPreview(true);

    try {
      const preview = await previewContaNotificacao(item.id, canal);
      setNotifyPreview(preview);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível carregar a prévia da mensagem.'));
      setNotifyOpen(false);
      setNotifyCanal(null);
      setNotifyContaId(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCloseNotify = (open: boolean) => {
    if (isSending) return;
    setNotifyOpen(open);
    if (!open) {
      setNotifyCanal(null);
      setNotifyContaId(null);
      setNotifyPreview(null);
    }
  };

  const handleConfirmNotify = async (mensagem: string) => {
    if (!notifyContaId || !notifyCanal) return;

    setIsSending(true);
    try {
      const response = await enviarContaNotificacao(notifyContaId, {
        canal: notifyCanal,
        mensagem,
      });
      toast.success(response.message || 'Mensagem enviada com sucesso!');
      setNotifyOpen(false);
      setNotifyCanal(null);
      setNotifyContaId(null);
      setNotifyPreview(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erro ao enviar a mensagem.'));
    } finally {
      setIsSending(false);
    }
  };

  return {
    data,
    summary,
    isLoading,
    refresh: fetchInadimplencia,
    handleNotify,
    notifyDialog: {
      open: notifyOpen,
      canal: notifyCanal,
      preview: notifyPreview,
      isLoadingPreview,
      isSending,
      onOpenChange: handleCloseNotify,
      onConfirm: handleConfirmNotify,
    },
  };
};
