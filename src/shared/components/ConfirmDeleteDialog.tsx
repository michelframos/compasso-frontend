import type { FC, ReactNode } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';

interface ConfirmDeleteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
  className?: string;
}

export const ConfirmDeleteDialog: FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = 'Sim, Excluir',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  children,
  className,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent
        className={`sm:max-w-[420px] p-0 gap-0 rounded-[28px] border-none shadow-2xl overflow-hidden ${className ?? ''}`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <AlertDialogTitle className="text-xl font-bold leading-tight text-zinc-900">
                {title ?? (
                  <>
                    Confirmar <span className="text-rose-500">Exclusão</span>
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-sm leading-relaxed text-zinc-500">
                  {description}
                </div>
              </AlertDialogDescription>
            </div>
          </div>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/80 px-6 py-4 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={isLoading}
            className="mt-0 h-9 rounded-full border-zinc-200 px-5 font-bold hover:cursor-pointer hover:bg-white"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              if (open !== undefined) e.preventDefault();
              onConfirm();
            }}
            className="h-9 rounded-full border-none bg-rose-500 px-6 font-bold text-white shadow-lg shadow-rose-100 hover:cursor-pointer hover:bg-rose-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
