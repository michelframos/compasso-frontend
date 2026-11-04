import React, { useEffect, useState } from 'react';
import { Loader2, UserCircle, CalendarDays, HandHelping, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { useEmprestimoForm } from '../hooks/useEmprestimoForm';
import { useAlunosParaSelect as useAlunos } from '@/modules/academico';
import { useContratos } from '@/modules/financeiro';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { CurrencyInput } from '@/shared/components/ui/currency-input';
import { substituirPlaceholders } from '@/shared/lib/contrato-utils';
import api from '@/shared/lib/axios';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface CategoriaContaBasico {
  id: number;
  nome: string;
  tipo: string;
}

interface EmprestimoModalProps {
  onClose: () => void;
  onSuccess: () => void;
  instrumento: {
    id: number;
    nome: string;
    tipo?: string;
    numero_serie?: string;
  };
}

export const EmprestimoModal: React.FC<EmprestimoModalProps> = ({ onClose, onSuccess, instrumento }) => {
  const hasFinanceiro = useHasModulo('financeiro');
  const { form, handleSubmit, isLoading } = useEmprestimoForm(onSuccess, instrumento.id);
  const { register, watch, setValue, formState: { errors } } = form;
  const { alunos, fetchAlunos, isLoading: isLoadingAlunos } = useAlunos();
  const { contratos, fetchContratos } = useContratos();
  
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [contratoGerado, setContratoGerado] = useState<string | null>(null);

  const selectedAlunoId = watch('id_aluno');
  const loanDate = watch('data_emprestimo');
  const gerarConta = watch('gerar_conta');

  const [financeiroCategorias, setFinanceiroCategorias] = useState<CategoriaContaBasico[]>([]);
  const [isLoadingFinanceiro, setIsLoadingFinanceiro] = useState(false);

  useEffect(() => {
    fetchAlunos();
    if (hasFinanceiro) fetchContratos(1, 'nome', 'asc');
  }, [fetchAlunos, fetchContratos, hasFinanceiro]);

  // Carrega categorias de conta (receitas)
  useEffect(() => {
    if (!hasFinanceiro) return;
    const fetchCategorias = async () => {
        setIsLoadingFinanceiro(true);
        try {
            const response = await api.get('/categorias-contas');
            const categorias = response.data.data || [];
            // Filtra apenas categorias de receita
            setFinanceiroCategorias(categorias.filter((c: CategoriaContaBasico) => c.tipo === 'receita'));
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        } finally {
            setIsLoadingFinanceiro(false);
        }
    };
    fetchCategorias();
  }, [hasFinanceiro]);

  // Geração de Snapshot do Termo
  useEffect(() => {
    if (!selectedContratoId || selectedContratoId === "none" || !selectedAlunoId || !loanDate) {
      setContratoGerado(null);
      return;
    }

    const gerarSnapshot = async () => {
      try {
        const contrato = contratos.find(c => c.id === Number(selectedContratoId));
        if (!contrato) return;

        const alunoRes = await api.get(`/alunos/${selectedAlunoId}`);
        const alunoData = alunoRes.data.data;

        const conteudoGerado = substituirPlaceholders(contrato.conteudo, {
          aluno: alunoData,
          instrumento: {
            nome: instrumento.nome,
            tipo: instrumento.tipo,
            numero_serie: instrumento.numero_serie
          },
          data_emprestimo: loanDate
        });

        setContratoGerado(conteudoGerado);
      } catch (error) {
        console.error('Erro ao gerar snapshot do termo:', error);
      }
    };

    gerarSnapshot();
  }, [selectedContratoId, selectedAlunoId, loanDate, contratos, instrumento]);

  const idConverter = (v: unknown) => {
    const num = Number(v);
    return isNaN(num) || num === 0 ? null : num;
  };

  return (
    <div className="flex flex-col w-full bg-white">
      <form 
        onSubmit={(e) => { 
          e.stopPropagation(); 
          handleSubmit(
            selectedContratoId && selectedContratoId !== "none" ? Number(selectedContratoId) : null,
            contratoGerado
          )(e); 
        }} 
        className="flex flex-col flex-1"
      >
        <div className="p-8 space-y-6 overflow-y-auto flex-1 h-full">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <HandHelping className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Registrar Empréstimo</h3>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <HandHelping className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-tight">Instrumento</p>
                <p className="text-sm font-black text-indigo-900">{instrumento.nome}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Aluno */}
              <div className="space-y-2">
                <Label htmlFor="id_aluno" className={`font-medium ml-1 ${errors.id_aluno ? 'text-rose-500' : 'text-zinc-700'}`}>
                  Selecionar Aluno *
                </Label>
                <div className="relative">
                  {isLoadingAlunos ? (
                    <div className="h-11 flex items-center px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 text-sm">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando alunos...
                    </div>
                  ) : (
                    <select
                      id="id_aluno"
                      {...register('id_aluno')}
                      className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${errors.id_aluno ? 'border-rose-500' : 'border-zinc-200'}`}
                    >
                      <option value="">Selecione um aluno</option>
                      {Array.isArray(alunos) && alunos.map(aluno => (
                        <option key={aluno.id} value={String(aluno.id)}>{aluno.usuario.nome}</option>
                      ))}
                    </select>
                  )}
                  <UserCircle className="absolute right-3 top-3 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
                {errors.id_aluno && <p className="text-[11px] text-rose-500 ml-1">{errors.id_aluno.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data de Empréstimo */}
                <div className="space-y-2">
                  <Label htmlFor="data_emprestimo" className={`font-medium ml-1 ${errors.data_emprestimo ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Data do Empréstimo *
                  </Label>
                  <div className="relative">
                    <Input
                      id="data_emprestimo"
                      type="date"
                      {...register('data_emprestimo')}
                      className={`h-11 rounded-xl focus-visible:ring-indigo-600 border-zinc-200 ${errors.data_emprestimo ? 'border-rose-500' : ''}`}
                    />
                    <CalendarDays className="absolute right-3 top-3 w-5 h-5 text-zinc-400" />
                  </div>
                  {errors.data_emprestimo && <p className="text-[11px] text-rose-500 ml-1">{errors.data_emprestimo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_prevista_devolucao" className="text-zinc-700 font-medium ml-1">Devolução prevista</Label>
                  <div className="relative">
                    <Input
                      id="data_prevista_devolucao"
                      type="date"
                      {...register('data_prevista_devolucao')}
                      className="h-11 rounded-xl focus-visible:ring-indigo-600 border-zinc-200"
                    />
                    <CalendarDays className="absolute right-3 top-3 w-5 h-5 text-zinc-400" />
                  </div>
                </div>

                {/* Contrato */}
                {hasFinanceiro && (
                <div className="space-y-2">
                  <Label htmlFor="contrato_id" className="text-zinc-700 font-medium ml-1">Termo de Responsabilidade (Opcional)</Label>
                  <Select 
                      onValueChange={(value) => setSelectedContratoId(value)} 
                      value={selectedContratoId || "none"}
                  >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-200 focus:ring-indigo-600">
                          <SelectValue placeholder="Selecione um termo" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="none">Nenhum termo associado</SelectItem>
                          {contratos.map((contrato) => (
                              <SelectItem key={contrato.id} value={contrato.id.toString()}>
                                  {contrato.nome}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                )}
              </div>

              {hasFinanceiro && contratoGerado && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-1">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-indigo-900">Termo Processado</span>
                          <span className="text-[11px] text-indigo-700">O snapshot do termo foi gerado com sucesso.</span>
                      </div>
                  </div>
              )}

              {/* Seção Financeira */}
              {hasFinanceiro && (
              <div className="space-y-4 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 mt-2">
                  <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-indigo-900">Gerar Conta a Receber?</Label>
                          <p className="text-[11px] text-indigo-600/70">Marque para criar uma cobrança automática para este empréstimo.</p>
                      </div>
                      <input
                          type="checkbox"
                          {...register('gerar_conta')}
                          className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                  </div>

                  {gerarConta && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Valor</Label>
                              <CurrencyInput
                                  id="valor_conta"
                                  value={Number(watch('valor_conta')) || 0}
                                  onChange={(val) => setValue('valor_conta', val, { shouldValidate: true })}
                                  prefix="R$"
                                  className="h-10 rounded-xl border-zinc-200 focus:ring-indigo-600"
                                  placeholder="0,00"
                              />
                              {errors.valor_conta && <p className="text-[10px] text-rose-500 font-medium ml-1">{errors.valor_conta.message}</p>}
                          </div>

                          <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Vencimento</Label>
                              <Input
                                  type="date"
                                  {...register('data_vencimento_conta')}
                                  className="h-10 rounded-xl border-zinc-200 focus:ring-indigo-600"
                              />
                          </div>

                          <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Categoria</Label>
                              {isLoadingFinanceiro ? (
                                  <div className="h-10 flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                  </div>
                              ) : (
                                  <select
                                      {...register('id_categoria_conta', { setValueAs: idConverter })}
                                      className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                                  >
                                      <option value={0}>Selecione...</option>
                                      {financeiroCategorias.map((cat: any) => (
                                          <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                      ))}
                                  </select>
                              )}
                          </div>
                      </div>
                  )}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end w-full gap-3 shrink-0 rounded-b-[24px]">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Empréstimo'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
