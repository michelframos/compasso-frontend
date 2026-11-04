import React, { useState, useMemo } from 'react';
import { Users, Shirt, Receipt, CheckCircle2, XCircle, Search, Loader2, Save, Send, UserPlus } from 'lucide-react';
import { useApresentacaoParticipantes } from '../hooks/useApresentacaoParticipantes';
import { AddParticipanteModal } from './AddParticipanteModal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { CurrencyInput } from '@/shared/components/ui/currency-input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import type { ApresentacaoAluno } from '../types';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface ApresentacaoParticipantesProps {
  apresentacaoId: number;
  turmaId: number;
}

export const ApresentacaoParticipantes: React.FC<ApresentacaoParticipantesProps> = ({ apresentacaoId, turmaId }) => {
  const hasFinanceiro = useHasModulo('financeiro');
  const {
    participantes,
    alunosTurma,
    isLoading,
    isGeneratingFaturas,
    toggleParticipacao,
    updateFigurino,
    gerarCobrancasEmLote
  } = useApresentacaoParticipantes(apresentacaoId, turmaId);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dataVencimento, setDataVencimento] = useState('');
  const [editValues, setEditValues] = useState<{
    papel: string;
    tamanho_figurino: string;
    valor_figurino: number;
    pago_figurino: boolean;
    recebeu_figurino: boolean;
  }>({
    papel: '',
    tamanho_figurino: '',
    valor_figurino: 0,
    pago_figurino: false,
    recebeu_figurino: false,
  });

  const todosAlunos = useMemo(() => {
    const mapaAlunos = new Map<number, { id: number; nome: string }>();

    // 1. Adiciona alunos da turma
    alunosTurma.forEach(a => mapaAlunos.set(a.id, a));

    // 2. Adiciona participantes (pode conter alunos externos)
    participantes.forEach(p => {
      // Importante: No types o 'aluno' tem id, nome, usuario (no backend retorna o load de usuario se tiver)
      // Ajuste para pegar do p.aluno.nome ou p.aluno.usuario.nome caso não venha flat

      if (p.id_aluno && !mapaAlunos.has(p.id_aluno)) {
        mapaAlunos.set(p.id_aluno, {
          id: p.id_aluno,
          nome: p.aluno ? p.aluno.nome : `Aluno Externo (#${p.id_aluno})`
        });
      }
    });

    return Array.from(mapaAlunos.values());
  }, [alunosTurma, participantes]);

  const filteredAlunos = todosAlunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const participantesValidos = participantes.filter(p => Number(p.valor_figurino) > 0 && !p.fatura_gerada);
  const isAllSelected = participantesValidos.length > 0 && selectedIds.length === participantesValidos.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(participantesValidos.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selId => selId !== id));
    }
  };

  const startEdit = (p: ApresentacaoAluno) => {
    setEditingId(p.id);
    setEditValues({
      papel: p.papel || '',
      tamanho_figurino: p.tamanho_figurino || '',
      valor_figurino: Number(p.valor_figurino) || 0,
      pago_figurino: !!p.pago_figurino,
      recebeu_figurino: !!p.recebeu_figurino,
    });
  };

  const handleSave = async (id: number) => {
    await updateFigurino(id, editValues);
    setEditingId(null);
  };

  const handleGerarCobrancas = async () => {
    if (!dataVencimento) return;

    const success = await gerarCobrancasEmLote(selectedIds, dataVencimento);
    if (success) {
      setIsModalOpen(false);
      setSelectedIds([]);
      setDataVencimento('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Carregando participantes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Alunos da Turma
          </h3>
          <p className="text-xs text-zinc-500">Gerencie a participação e os figurinos dos alunos vinculados a esta turma.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 rounded-xl h-9 px-4 gap-2 font-bold transition-all text-sm hover:cursor-pointer w-full lg:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Novo Participante
          </Button>

          {hasFinanceiro && selectedIds.length > 0 && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-emerald-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"
            >
              <Send className="w-4 h-4" />
              Gerar Faturas ({selectedIds.length})
            </Button>
          )}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="hidden lg:block border border-zinc-100 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50 border border-zinc-100">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={participantesValidos.length === 0}
                  className="rounded border-zinc-300"
                />
              </TableHead>
              <TableHead className="w-[300px] text-xs font-bold uppercase text-zinc-500">Aluno</TableHead>
              <TableHead className="text-xs font-bold uppercase text-zinc-500">Status Participação</TableHead>
              <TableHead className="text-xs font-bold uppercase text-zinc-500">Figurino (Tam/Valor)</TableHead>
              <TableHead className="text-xs font-bold uppercase text-zinc-500">Pagamento</TableHead>
              <TableHead className="text-xs font-bold uppercase text-zinc-500">Entrega</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase text-zinc-500">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlunos.map((aluno) => {
              const participante = participantes.find(p => p.id_aluno === aluno.id);
              const isEditing = editingId === participante?.id;
              const hasValor = participante && Number(participante.valor_figurino) > 0;
              const isSelected = participante ? selectedIds.includes(participante.id) : false;

              return (
                <TableRow key={aluno.id} className="group transition-colors hover:bg-zinc-50/30 border-b border-zinc-100">
                  <TableCell className="text-center">
                    {hasValor && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked: boolean | "indeterminate") => handleSelectRow(participante.id, checked === true)}
                        disabled={participante.fatura_gerada}
                        className="rounded border-zinc-300"
                        title={participante.fatura_gerada ? "Fatura já gerada" : ""}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase">
                        {aluno.nome.substring(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-zinc-700">{aluno.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {participante ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-zinc-100 hover:bg-emerald-50 pointer-events-none">
                        Participante
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-400 border-zinc-100 font-normal">
                        Não vinculado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {participante ? (
                      isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-24 h-8 text-xs px-2"
                            placeholder="Papel"
                            value={editValues.papel}
                            onChange={e => setEditValues(prev => ({ ...prev, papel: e.target.value }))}
                          />
                          <Input
                            className="w-16 h-8 text-xs px-2"
                            placeholder="Tam"
                            value={editValues.tamanho_figurino}
                            onChange={e => setEditValues(prev => ({ ...prev, tamanho_figurino: e.target.value }))}
                          />
                          <CurrencyInput
                            className="w-24 h-8 text-xs px-2"
                            value={editValues.valor_figurino}
                            onChange={(val) => setEditValues(prev => ({ ...prev, valor_figurino: val }))}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <Shirt className="w-3.5 h-3.5 opacity-40" />
                          <span className="font-bold">{participante.papel || 'Sem papel'}</span>
                          <span className="text-zinc-300">|</span>
                          <span className="font-bold">{participante.tamanho_figurino || '-'}</span>
                          <span className="text-zinc-300">|</span>
                          <span className="font-medium">
                            {participante.valor_figurino
                              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(participante.valor_figurino))
                              : 'R$ 0,00'}
                          </span>
                        </div>
                      )
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {participante ? (
                      isEditing ? (
                        <select
                          className="h-8 text-xs rounded-md border border-zinc-200 px-2 outline-none focus:ring-1 focus:ring-indigo-600"
                          value={String(editValues.pago_figurino)}
                          onChange={e => setEditValues(prev => ({ ...prev, pago_figurino: e.target.value === 'true' }))}
                        >
                          <option value="false">Pendente</option>
                          <option value="true">Pago</option>
                        </select>
                      ) : (
                        participante.pago_figurino ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Pago
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                            <Receipt className="w-3.5 h-3.5" />
                            Aberto
                          </div>
                        )
                      )
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {participante ? (
                      isEditing ? (
                        <select
                          className="h-8 text-xs rounded-md border border-zinc-200 px-2 outline-none focus:ring-1 focus:ring-indigo-600"
                          value={String(editValues.recebeu_figurino)}
                          onChange={e => setEditValues(prev => ({ ...prev, recebeu_figurino: e.target.value === 'true' }))}
                        >
                          <option value="false">Não Entregue</option>
                          <option value="true">Entregue</option>
                        </select>
                      ) : (
                        participante.recebeu_figurino ? (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[11px] uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Entregue
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[11px] uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" />
                            Pendente
                          </div>
                        )
                      )
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {participante ? (
                        isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                              className="h-8 text-xs font-bold hover:cursor-pointer"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSave(participante.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold gap-1.5 hover:cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Salvar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(participante)}
                              className="h-8 text-xs font-bold rounded-xl border-zinc-200 hover:bg-zinc-50 hover:cursor-pointer"
                            >
                              Editar Figurino
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleParticipacao(aluno.id)}
                              className="h-8 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl hover:cursor-pointer"
                            >
                              Remover
                            </Button>
                          </>
                        )
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => toggleParticipacao(aluno.id)}
                          className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 h-8 text-xs font-black rounded-xl gap-1.5 hover:cursor-pointer transition-all border border-indigo-100"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Vincular Aluno
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filteredAlunos.map((aluno) => {
          const participante = participantes.find(p => p.id_aluno === aluno.id);
          const isEditing = editingId === participante?.id;
          const hasValor = participante && Number(participante.valor_figurino) > 0;
          const isSelected = participante ? selectedIds.includes(participante.id) : false;

          return (
            <div key={aluno.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-sm uppercase">
                    {aluno.nome.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{aluno.nome}</h4>
                    {participante ? (
                      <Badge className="h-5 text-[10px] bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-50">
                        Participante
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 text-[10px] text-zinc-400 border-zinc-100 font-normal">
                        Não vinculado
                      </Badge>
                    )}
                  </div>
                </div>
                {hasValor && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: boolean | "indeterminate") => handleSelectRow(participante.id, checked === true)}
                    disabled={participante.fatura_gerada}
                    className="rounded-lg border-zinc-300 w-6 h-6"
                    title={participante.fatura_gerada ? "Fatura já gerada" : ""}
                  />
                )}
              </div>

              {participante && (
                <div className="space-y-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Figurino</span>
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            className="h-8 text-xs bg-white"
                            placeholder="Papel"
                            value={editValues.papel}
                            onChange={e => setEditValues(prev => ({ ...prev, papel: e.target.value }))}
                          />
                          <Input
                            className="h-8 text-xs bg-white"
                            placeholder="Tam"
                            value={editValues.tamanho_figurino}
                            onChange={e => setEditValues(prev => ({ ...prev, tamanho_figurino: e.target.value }))}
                          />
                          <CurrencyInput
                            className="h-8 text-xs bg-white"
                            value={editValues.valor_figurino}
                            onChange={(val) => setEditValues(prev => ({ ...prev, valor_figurino: val }))}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                          <Shirt className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{participante.papel || 'Sem papel'}</span>
                          <span className="text-zinc-300">|</span>
                          <span>{participante.tamanho_figurino || '-'}</span>
                          <span className="text-zinc-300">|</span>
                          <span>
                            {participante.valor_figurino
                              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(participante.valor_figurino))
                              : 'R$ 0,00'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pagamento</span>
                      {isEditing ? (
                        <select
                          className="w-full h-8 text-xs rounded-md border border-zinc-200 px-2 outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                          value={String(editValues.pago_figurino)}
                          onChange={e => setEditValues(prev => ({ ...prev, pago_figurino: e.target.value === 'true' }))}
                        >
                          <option value="false">Pendente</option>
                          <option value="true">Pago</option>
                        </select>
                      ) : (
                        participante.pago_figurino ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Pago
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase">
                            <Receipt className="w-3.5 h-3.5" />
                            Aberto
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-zinc-200/50">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Entrega</span>
                    {isEditing ? (
                      <select
                        className="w-full h-8 text-xs rounded-md border border-zinc-200 px-2 outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                        value={String(editValues.recebeu_figurino)}
                        onChange={e => setEditValues(prev => ({ ...prev, recebeu_figurino: e.target.value === 'true' }))}
                      >
                        <option value="false">Não Entregue</option>
                        <option value="true">Entregue</option>
                      </select>
                    ) : (
                      participante.recebeu_figurino ? (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Entregue
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase">
                          <XCircle className="w-3.5 h-3.5" />
                          Pendente
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {participante ? (
                  isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="flex-1 h-9 text-xs font-bold hover:cursor-pointer h-9"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(participante.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold gap-1.5 hover:cursor-pointer h-9"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(participante)}
                        className="flex-1 h-9 text-xs font-bold rounded-xl border-zinc-200 hover:bg-zinc-50 hover:cursor-pointer h-9"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleParticipacao(aluno.id)}
                        className="flex-1 h-9 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl hover:cursor-pointer h-9"
                      >
                        Remover
                      </Button>
                    </>
                  )
                ) : (
                  <Button
                    size="sm"
                    onClick={() => toggleParticipacao(aluno.id)}
                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 h-9 text-xs font-black rounded-xl gap-1.5 hover:cursor-pointer transition-all border border-indigo-100 h-9"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Vincular Aluno
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 border-none shadow-2xl text-zinc-900 bg-white flex flex-col max-h-[90vh] overflow-hidden">
          <DialogHeader className=" bg-emerald-50/50 border-b border-emerald-100 rounded-t-[32px]">
            <DialogTitle className="text-xl font-black text-zinc-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-600" />
              Gerar <span className="text-emerald-600">Faturas</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Você está prestes a gerar cobranças para <strong className="text-zinc-900">{selectedIds.length}</strong> aluno(s).
              Por favor, informe a data de vencimento padrão para as faturas.
            </DialogDescription>bor
          </DialogHeader>

          <div className="p-8 flex-1 overflow-y-auto">
            <div className="space-y-2 mb-8">
              <label htmlFor="data_vencimento" className="font-medium ml-1 text-zinc-700">
                Data de Vencimento *
              </label>
              <Input
                id="data_vencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="h-11 rounded-xl focus-visible:ring-emerald-600 border-zinc-200 w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleGerarCobrancas}
                disabled={!dataVencimento || isGeneratingFaturas}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-emerald-100 transition-all hover:cursor-pointer active:scale-95 flex items-center gap-2"
              >
                {isGeneratingFaturas ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddParticipanteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (alunoId) => {
          await toggleParticipacao(alunoId);
        }}
        participantesAtivosIds={participantes.map(p => p.id_aluno)}
      />
    </div>
  );
};
