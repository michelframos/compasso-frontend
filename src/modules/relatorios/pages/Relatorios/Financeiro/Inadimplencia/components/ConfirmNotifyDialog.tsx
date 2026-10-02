import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Loader2, Mail, MessageSquare } from 'lucide-react';
import type { ContaNotificacaoCanal, ContaNotificacaoPreview } from '@/modules/notificacoes/api/notificacoes';

interface ConfirmNotifyDialogProps {
  open: boolean;
  canal: ContaNotificacaoCanal | null;
  preview: ContaNotificacaoPreview | null;
  isLoadingPreview?: boolean;
  isSending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mensagem: string) => void;
}

export const ConfirmNotifyDialog: React.FC<ConfirmNotifyDialogProps> = ({
  open,
  canal,
  preview,
  isLoadingPreview = false,
  isSending = false,
  onOpenChange,
  onConfirm,
}) => {
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (open && preview?.mensagem) {
      setMensagem(preview.mensagem);
      return;
    }

    if (!open) {
      setMensagem('');
    }
  }, [open, preview]);

  const isWhatsapp = canal === 'whatsapp';
  const canalLabel = isWhatsapp ? 'WhatsApp' : 'E-mail';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-[24px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            {isWhatsapp ? (
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            ) : (
              <Mail className="w-5 h-5 text-indigo-600" />
            )}
            Confirmar envio por {canalLabel}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Revise o conteúdo da mensagem antes do disparo. Você pode editar o texto se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-2 space-y-4">
          {isLoadingPreview ? (
            <div className="flex items-center justify-center py-10 text-zinc-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando prévia...
            </div>
          ) : preview ? (
            <>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Destinatário</p>
                    <p className="text-sm font-bold text-zinc-900">{preview.destinatario}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      {isWhatsapp ? 'WhatsApp' : 'E-mail'}
                    </p>
                    <p className="text-sm font-medium text-zinc-700">
                      {preview.destino || 'Não informado'}
                    </p>
                  </div>
                </div>
                {preview.conta.descricao && (
                  <p className="text-xs text-zinc-500 border-t border-zinc-200 pt-2">
                    Conta: {preview.conta.descricao}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 ml-1">
                  Conteúdo da mensagem
                </label>
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="min-h-[140px] rounded-xl resize-none border-zinc-200"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500 py-6 text-center">
              Não foi possível carregar a prévia da mensagem.
            </p>
          )}
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-zinc-100 bg-zinc-50/40 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isSending || isLoadingPreview || !preview?.destino || !mensagem.trim()}
            onClick={() => onConfirm(mensagem.trim())}
            className={`rounded-full text-white ${
              isWhatsapp
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar e enviar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
