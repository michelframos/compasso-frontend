import React, { useEffect } from 'react';

import { useMatriculaMensalidades } from '../hooks/useMatriculaMensalidades';

import type { Mensalidade } from '../hooks/useMatriculaMensalidades';

import { Button } from '@/shared/components/ui/button';

import { ContaModal } from '@/modules/financeiro';

import { CreditCard, Calendar, Loader2, AlertCircle, DollarSign, Plus, FileText } from 'lucide-react';

import { useCarneMatricula } from '../hooks/useCarneMatricula';

import { CarneOptionsModal } from '@/shared/components/CarneOptionsModal';



interface MatriculaMensalidadesProps {

  matriculaId: number;

  alunoId?: number;

}



const MESES = [

  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',

  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'

];



const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {

  pendente: { label: 'Pendente', classes: 'bg-amber-100 text-amber-700 border-amber-200' },

  pago: { label: 'Pago', classes: 'bg-green-100 text-green-700 border-green-200' },

  vencido: { label: 'Vencido', classes: 'bg-red-100 text-red-700 border-red-200' },

  pago_parcialmente: { label: 'Pago Parcialmente', classes: 'bg-blue-100 text-blue-700 border-blue-200' },

  cancelado: { label: 'Cancelado', classes: 'bg-zinc-100 text-zinc-500 border-zinc-200' },

};



function formatDate(dateStr: string | null): string {

  if (!dateStr) return '—';

  const [year, month, day] = dateStr.substring(0, 10).split('-');

  return `${day}/${month}/${year}`;

}



function formatCurrency(value: number | string): string {

  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

}



function MensalidadeCard({ mensalidade }: { mensalidade: Mensalidade }) {

  const status = STATUS_CONFIG[mensalidade.status] ?? { label: mensalidade.status, classes: 'bg-zinc-100 text-zinc-500 border-zinc-200' };



  return (

    <div className="flex flex-col md:flex-row md:items-center items-center justify-between p-4 bg-white border border-zinc-100 rounded-xl hover:border-indigo-100 hover:shadow-sm transition-all">

      <div className="flex items-center gap-3 min-w-0">

        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">

          <CreditCard className="w-4 h-4 text-indigo-600" />

        </div>

        <div className="min-w-0">

          <p className="text-sm font-semibold text-zinc-900 truncate">{mensalidade.descricao}</p>

          <div className="flex items-center gap-2 mt-0.5">

            {mensalidade.mes_referencia && mensalidade.ano_referencia && (

              <span className="text-xs text-zinc-400">

                {MESES[mensalidade.mes_referencia]} / {mensalidade.ano_referencia}

              </span>

            )}

            {mensalidade.numero_parcela && mensalidade.quantidade_parcelas && (

              <span className="text-xs text-zinc-400">

                · Parcela {mensalidade.numero_parcela}/{mensalidade.quantidade_parcelas}

              </span>

            )}

          </div>

        </div>

      </div>



      <div className="flex items-center gap-3 flex-shrink-0 ml-4">

        {/* Vencimento */}

        <div className="hidden sm:flex flex-col items-end">

          <span className="text-[11px] text-zinc-400 uppercase tracking-wide">Vencimento</span>

          <div className="flex items-center gap-1">

            <Calendar className="w-3 h-3 text-zinc-400" />

            <span className="text-xs font-medium text-zinc-600">{formatDate(mensalidade.data_vencimento)}</span>

          </div>

        </div>



        {/* Valor */}

        <div className="flex flex-col items-end">

          <span className="text-[11px] text-zinc-400 uppercase tracking-wide">Valor</span>

          <span className="text-sm font-bold text-zinc-900">{formatCurrency(mensalidade.valor)}</span>

          {Number(mensalidade.saldo_devedor) > 0 && Number(mensalidade.saldo_devedor) < Number(mensalidade.valor) && (

            <span className="text-[10px] text-zinc-400">Saldo: {formatCurrency(mensalidade.saldo_devedor)}</span>

          )}

        </div>



        {/* Badge de Status */}

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.classes}`}>

          {status.label}

        </span>

      </div>

    </div>

  );

}



export const MatriculaMensalidades: React.FC<MatriculaMensalidadesProps> = ({ matriculaId, alunoId }) => {

  const { mensalidades, isLoading, fetchMensalidades } = useMatriculaMensalidades(matriculaId);

  const { emitirCarne, isGenerating } = useCarneMatricula();

  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const [isCarneOptionsOpen, setIsCarneOptionsOpen] = React.useState(false);



  useEffect(() => {

    fetchMensalidades();

  }, [fetchMensalidades]);



  const totalPendente = mensalidades

    .filter(m => ['pendente', 'vencido', 'pago_parcialmente'].includes(m.status))

    .reduce((acc, m) => acc + (m.saldo_devedor ?? 0), 0);



  const pagasCount = mensalidades.filter(m => m.status === 'pago').length;



  return (

    <div className="space-y-4">

      {/* Resumo */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        <div className="p-3 bg-zinc-50 rounded-xl text-center">

          <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Total</p>

          <p className="text-lg font-bold text-zinc-900">{mensalidades.length}</p>

        </div>

        <div className="p-3 bg-green-50 rounded-xl text-center">

          <p className="text-[11px] text-green-600 uppercase tracking-wide">Pagas</p>

          <p className="text-lg font-bold text-green-700">{pagasCount}</p>

        </div>

        <div className="p-3 bg-amber-50 rounded-xl text-center">

          <p className="text-[11px] text-amber-600 uppercase tracking-wide">A Receber</p>

          <p className="text-lg font-bold text-amber-700">{formatCurrency(totalPendente)}</p>

        </div>

      </div>



      {/* Cabeçalho da seção */}

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-100">

        <div className="flex items-center gap-2">

          <DollarSign className="w-5 h-5 text-indigo-600" />

          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Mensalidades</h3>

        </div>

        <div className="flex flex-col md:flex-row mt-2 md:mt-0 items-center gap-2">

          <Button

            type="button"

            disabled={isGenerating || mensalidades.length === 0}

            onClick={() => setIsCarneOptionsOpen(true)}

            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full h-9 px-4 gap-2 shadow-lg shadow-violet-100 font-bold active:scale-95 transition-all text-xs hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"

          >

            {isGenerating ? (

              <Loader2 className="w-4 h-4 animate-spin" />

            ) : (

              <FileText className="w-4 h-4" />

            )}

            Emitir Carnê

          </Button>

          <Button

            type="button"

            onClick={() => setIsFormOpen(true)}

            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-4 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-xs hover:cursor-pointer w-full md:w-auto"

          >

            <Plus className="w-4 h-4" />

            Nova Mensalidade

          </Button>

        </div>

      </div>



      {/* Conteúdo Variável */}

      {isLoading ? (

        <div className="flex flex-col items-center justify-center py-16 gap-3">

          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

          <p className="text-sm text-zinc-500">Carregando mensalidades...</p>

        </div>

      ) : mensalidades.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-100">

          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">

            <AlertCircle className="w-6 h-6 text-zinc-400" />

          </div>

          <div>

            <p className="text-sm font-semibold text-zinc-700">Nenhuma mensalidade encontrada</p>

            <p className="text-xs text-zinc-400 mt-1">Não há cobranças registradas para este aluno.</p>

          </div>

        </div>

      ) : (

        <div className="space-y-2">

          {mensalidades.map(mensalidade => (

            <MensalidadeCard key={mensalidade.id} mensalidade={mensalidade} />

          ))}

        </div>

      )}



      <ContaModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tipoFluxo="receita"
        id_aluno={alunoId}
        id_matricula={matriculaId}
        title={<>Nova <span className="text-indigo-600">Mensalidade</span></>}
        description="Crie uma nova cobrança ou mensalidade vinculada a esta matrícula."
        onSuccess={() => {
          fetchMensalidades();
        }}
      />



      <CarneOptionsModal

        isOpen={isCarneOptionsOpen}

        onClose={() => setIsCarneOptionsOpen(false)}

        onConfirm={(options) => {

          emitirCarne(matriculaId, options).finally(() => setIsCarneOptionsOpen(false));

        }}

        isGenerating={isGenerating}

      />

    </div>

  );

};


