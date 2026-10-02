import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { FileText, User, Users, Info } from 'lucide-react';

interface CarneOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { titulo: string; preferencia_dados: 'aluno' | 'responsavel' }) => void;
  alunoNome?: string;
  isGenerating?: boolean;
}

export const CarneOptionsModal: React.FC<CarneOptionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  alunoNome,
  isGenerating = false,
}) => {
  const [titulo, setTitulo] = useState(alunoNome ? `Carnê de Pagamento - ${alunoNome}` : 'Carnê de Pagamento');
  const [preferencia, setPreferencia] = useState<'aluno' | 'responsavel'>('aluno');

  const handleConfirm = () => {
    onConfirm({ titulo, preferencia_dados: preferencia });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[32px] p-0 border-none shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 bg-violet-50/50 border-b border-violet-100">
          <DialogTitle className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-600" />
            Opções do <span className="text-violet-600">Carnê</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Configure como os dados devem aparecer no documento.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Título do Carnê
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Carnê de Pagamento - João Silva"
              className="h-10 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-violet-500 shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Dados do Pagador
            </Label>
            <Select
              value={preferencia}
              onValueChange={(val) => setPreferencia(val as 'aluno' | 'responsavel')}
            >
              <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-violet-500">
                <SelectValue placeholder="Selecione os dados" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-100">
                <SelectItem value="aluno" className="py-3 focus:bg-violet-50 focus:text-violet-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="font-bold text-sm">Dados do Aluno</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">O carnê sairá no nome do próprio aluno.</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="responsavel" className="py-3 focus:bg-violet-50 focus:text-violet-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <div>
                      <p className="font-bold text-sm">Dados do Responsável</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Usa os dados do responsável financeiro do aluno.</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preferencia === 'responsavel' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-normal">
                Nota: Se o aluno não tiver um responsável cadastrado, o sistema usará automaticamente os dados do aluno como backup.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full h-9 hover:cursor-pointer font-bold text-zinc-500"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full h-9 px-6 gap-2 shadow-lg shadow-violet-100 font-bold active:scale-95 transition-all hover:cursor-pointer"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Carnê'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
