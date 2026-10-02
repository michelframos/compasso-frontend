import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { LeadFormValues } from '../hooks/useLeadForm';

interface LeadFormModalProps {
  form: UseFormReturn<LeadFormValues>;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ form }) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const statusValue = watch('status');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-zinc-700 font-bold">Nome *</Label>
          <Input
            id="nome"
            {...register('nome')}
            placeholder="Nome completo"
            className={`h-11 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white transition-all ${errors.nome ? 'border-rose-500' : ''}`}
          />
          {errors.nome && <p className="text-xs text-rose-500 font-medium">{errors.nome.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700 font-bold">Email</Label>
            <Input
              id="email"
              {...register('email')}
              placeholder="email@exemplo.com"
              className={`h-11 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white transition-all ${errors.email ? 'border-rose-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-zinc-700 font-bold">Telefone</Label>
            <Input
              id="telefone"
              {...register('telefone')}
              placeholder="(00) 00000-0000"
              className={`h-11 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white transition-all ${errors.telefone ? 'border-rose-500' : ''}`}
            />
            {errors.telefone && <p className="text-xs text-rose-500 font-medium">{errors.telefone.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-zinc-700 font-bold">Status</Label>
          <Select
            value={statusValue}
            onValueChange={(value: LeadFormValues['status']) => setValue('status', value)}
          >
            <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white transition-all">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="rounded-[20px] border-zinc-100 shadow-xl">
              <SelectItem value="novo" className="rounded-lg">Novo</SelectItem>
              <SelectItem value="contatado" className="rounded-lg">Contatado</SelectItem>
              <SelectItem value="matriculado" className="rounded-lg">Matriculado</SelectItem>
              <SelectItem value="perdido" className="rounded-lg">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes" className="text-zinc-700 font-bold">Observações</Label>
          <textarea
            id="observacoes"
            {...register('observacoes')}
            className="w-full min-h-[100px] p-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none text-sm"
            placeholder="Detalhes sobre o interesse do lead..."
          />
        </div>
      </div>
    </div>
  );
};

