import React, { useState } from 'react';

import { Users, User, Mail, Phone, Loader2, GraduationCap, History, ArrowRightLeft, Plus, Printer } from 'lucide-react';

import { printContract } from '@/shared/lib/print-utils';

import { substituirPlaceholders } from '@/shared/lib/contrato-utils';

import type { Turma } from '../types';

import {

    Dialog,

    DialogContent,

    DialogHeader,

    DialogTitle,

    DialogTrigger

} from '@/shared/components/ui/dialog';

import { MatriculaHistorico } from '../../Matriculas/components/MatriculaHistorico';

import { MatriculaTransferForm } from '../../Matriculas/components/MatriculaTransferForm';

import { MatriculaForm } from '../../Matriculas/components/MatriculaForm';

import { Button } from '@/shared/components/ui/button';



export type TurmaComAlunos = Pick<Turma, 'id' | 'maximo_alunos' | 'matriculas'> & Partial<Turma>;

interface TurmaAlunosProps {

  turma: TurmaComAlunos | null;

  isLoading: boolean;

  onRefresh?: () => void;

  /** Oculta matrícula, transferência, contrato e histórico (visão do professor). */
  somenteLeitura?: boolean;

  /** Torna o nome do aluno clicável (ex.: abrir a ficha do aluno). */
  onAbrirAluno?: (idAluno: number) => void;

}

const NomeAluno: React.FC<{ nome: string; idAluno: number; className: string; onAbrir?: (idAluno: number) => void }> = ({ nome, idAluno, className, onAbrir }) =>
  onAbrir ? (
    <button
      type="button"
      onClick={() => onAbrir(idAluno)}
      className={`${className} text-left hover:text-indigo-600 hover:underline underline-offset-2 hover:cursor-pointer`}
    >
      {nome}
    </button>
  ) : (
    <span className={className}>{nome}</span>
  );



export const TurmaAlunos: React.FC<TurmaAlunosProps> = ({ turma, isLoading, onRefresh, somenteLeitura = false, onAbrirAluno }) => {

  const [isAddingAluno, setIsAddingAluno] = useState(false);



  if (isLoading) {

    return (

      <div className="flex flex-col items-center justify-center py-12 gap-3">

        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

        <p className="text-sm text-zinc-500 font-medium">Carregando lista de alunos...</p>

      </div>

    );

  }



  if (!turma) return null;



  const hasMatriculas = turma.matriculas && turma.matriculas.length > 0;



  return (

    <div className="space-y-6">

      {/* Resumo da Turma e Botão Novo Aluno */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">

        <div className="flex items-center gap-3 w-full md:w-auto">

          <div className="p-2 bg-indigo-100 rounded-lg">

            <GraduationCap className="w-5 h-5 text-indigo-600" />

          </div>

          <div>

            <h4 className="text-sm font-bold text-indigo-900">Capacidade da Turma</h4>

            <div className="flex items-center gap-2">

              <span className="text-2xl font-black text-indigo-600">

                {turma.matriculas?.length || 0}

                <span className="text-sm text-indigo-300 ml-1">/ {turma.maximo_alunos}</span>

              </span>

              <p className="text-[11px] text-indigo-700 font-medium">Alunos ativos</p>

            </div>

          </div>

        </div>

        

        {!somenteLeitura && (
        <Dialog open={isAddingAluno} onOpenChange={setIsAddingAluno}>

          <DialogTrigger asChild>

            <Button 

              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 flex items-center gap-2 w-full md:w-auto"

            >

              <Plus className="w-4 h-4" />

              Matricular Aluno

            </Button>

          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] rounded-[32px] p-0 border-none shadow-2xl flex flex-col overflow-hidden">

            <DialogHeader className=" border-b border-zinc-50">

              <DialogTitle className="flex items-center gap-2 text-xl font-black text-zinc-900">

                <Plus className="w-6 h-6 text-indigo-600" />

                Matricula <span className="text-indigo-600">Novo Aluno</span>

              </DialogTitle>

            </DialogHeader>

            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">

              <MatriculaForm 

                defaultTurmaId={String(turma.id)}

                excludedAlunoIds={turma.matriculas?.map(m => m.id_aluno) ?? []}

                onClose={() => setIsAddingAluno(false)}

                onSuccess={() => {

                  setIsAddingAluno(false);

                  if (onRefresh) onRefresh();

                }}

              />

            </div>

          </DialogContent>

        </Dialog>
        )}

      </div>



      {!hasMatriculas ? (

        <div className="flex flex-col items-center justify-center py-12 text-center">

          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

            <Users className="w-8 h-8" />

          </div>

          <h3 className="text-lg font-bold text-zinc-900">Nenhum aluno cadastrado</h3>

          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">

            Esta turma ainda não possui alunos vinculados no sistema.{!somenteLeitura && ' Clique no botão acima para realizar a primeira matrícula.'}

          </p>

        </div>

      ) : (



      <div className="overflow-hidden border border-zinc-100 rounded-2xl bg-white shadow-sm">

        {/* Desktop Table View */}

        <div className="hidden md:block overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="bg-zinc-50/50 border-b border-zinc-100">

                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Aluno</th>

                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Contato</th>

                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>

                {!somenteLeitura && <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Ações</th>}

              </tr>

            </thead>

            <tbody className="divide-y divide-zinc-50">

              {turma.matriculas?.map((matricula) => (

                <tr key={matricula.id} className="hover:bg-zinc-50/30 transition-colors group">

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-xs font-bold text-indigo-600 group-hover:border-indigo-200 transition-colors">

                        {matricula.aluno?.usuario.nome?.charAt(0).toUpperCase() || '?'}

                      </div>

                      <div>

                        <p className="text-sm font-bold text-zinc-700 group-hover:text-indigo-600 transition-colors">

                          <NomeAluno
                            nome={matricula.aluno?.usuario.nome || 'Aluno não identificado'}
                            idAluno={matricula.id_aluno}
                            className="font-bold"
                            onAbrir={onAbrirAluno}
                          />

                        </p>

                        <p className="text-[11px] text-zinc-400 flex items-center gap-1">

                          <User className="w-3 h-3" />

                          ID Aluno: {matricula.id_aluno}

                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex flex-col gap-1">

                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">

                        <Mail className="w-3.5 h-3.5 text-zinc-400" />

                        {matricula.aluno?.usuario.email || 'N/A'}

                      </div>

                      {matricula.aluno?.usuario.telefone && (

                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">

                          <Phone className="w-3.5 h-3.5 text-zinc-400" />

                          {matricula.aluno?.usuario.telefone}

                        </div>

                      )}

                    </div>

                  </td>

                  <td className="px-6 py-4">

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${

                      matricula.status === 'ativa' 

                        ? 'bg-emerald-100 text-emerald-700' 

                        : 'bg-zinc-100 text-zinc-500'

                    }`}>

                      {matricula.status || 'Pendente'}

                    </span>

                  </td>

                  {!somenteLeitura && (
                  <td className="px-6 py-4 text-right">

                    <div className="flex items-center justify-end gap-2">

                      <Actions matricula={matricula} turma={turma} onRefresh={onRefresh} />

                    </div>

                  </td>
                  )}

                </tr>

              ))}

            </tbody>

          </table>

        </div>



        {/* Mobile Cards View */}

        <div className="md:hidden divide-y divide-zinc-100">

          {turma.matriculas?.map((matricula) => (

            <div key={matricula.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">

                  {matricula.aluno?.usuario.nome?.charAt(0).toUpperCase() || '?'}

                </div>

                <div className="flex-1 min-w-0">

                  <h3 className="text-[15px] font-bold text-zinc-900 truncate">

                    <NomeAluno
                      nome={matricula.aluno?.usuario.nome || 'Aluno não identificado'}
                      idAluno={matricula.id_aluno}
                      className="font-bold max-w-full truncate"
                      onAbrir={onAbrirAluno}
                    />

                  </h3>

                  <div className="flex items-center gap-2 mt-0.5">

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${

                      matricula.status === 'ativa' 

                        ? 'bg-emerald-100 text-emerald-700' 

                        : 'bg-zinc-100 text-zinc-500'

                    }`}>

                      {matricula.status || 'Pendente'}

                    </span>

                    <span className="text-[10px] text-zinc-400 font-bold uppercase">ID: {matricula.id_aluno}</span>

                  </div>

                </div>

              </div>



              <div className="grid grid-cols-1 gap-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">

                <div className="flex items-center gap-2 text-xs text-zinc-600">

                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                  <span className="truncate">{matricula.aluno?.usuario.email || 'Sem e-mail'}</span>

                </div>

                {matricula.aluno?.usuario.telefone && (

                  <div className="flex items-center gap-2 text-xs text-zinc-600">

                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                    <span>{matricula.aluno?.usuario.telefone}</span>

                  </div>

                )}

              </div>



              {!somenteLeitura && (
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-50">

                <Actions matricula={matricula} turma={turma} onRefresh={onRefresh} isMobile />

              </div>
              )}

            </div>

          ))}

        </div>

      </div>

    )}

    </div>

  );

};



// Subcomponente de Ações para evitar repetição de código

const Actions = ({ 

  matricula, 

  turma, 

  onRefresh, 

  isMobile 

}: { 

  matricula: any; 

  turma: TurmaComAlunos; 

  onRefresh?: () => void; 

  isMobile?: boolean 

}) => {

  const [selectedMatriculaId, setSelectedMatriculaId] = useState<number | null>(null);



  return (

    <div className={`flex items-center ${isMobile ? 'flex-1 gap-2' : 'justify-end gap-2'}`}>

      {/* Botão Imprimir Contrato */}

      {matricula.contrato_gerado && (

        <Button

          variant={isMobile ? "outline" : "ghost"}

          size={isMobile ? "sm" : "icon"}

          className={`${isMobile ? 'flex-1 h-9 rounded-full' : 'h-8 w-8'} hover:bg-zinc-100 hover:text-zinc-600 transition-colors hover:cursor-pointer`}

          title="Imprimir Contrato"

          onClick={() => {

            const alunoObj = matricula.aluno;

            const dataArgs = {

              aluno: alunoObj,

              turma: turma,

              data_matricula: matricula.data || new Date().toISOString()

            };

            const conteudoFinal = substituirPlaceholders(matricula.contrato_gerado!, dataArgs);

            printContract(conteudoFinal, `Contrato de Matrícula - ${alunoObj?.usuario.nome || 'Aluno'}`);

          }}

        >

          <Printer className="w-4 h-4" />

          {isMobile && <span className="ml-2 text-xs font-bold uppercase">Contrato</span>}

        </Button>

      )}



      {/* Botão Transferir */}

      <Dialog onOpenChange={(open) => !open && setSelectedMatriculaId(null)}>

        <DialogTrigger asChild>

          <Button

            variant={isMobile ? "outline" : "ghost"}

            size={isMobile ? "sm" : "icon"}

            className={`${isMobile ? 'flex-1 h-9 rounded-full border-amber-200 text-amber-600 hover:bg-amber-50' : 'h-8 w-8 hover:bg-amber-50 hover:text-amber-600'} rounded-lg transition-colors hover:cursor-pointer`}

            title="Transferir aluno para outra turma"

            onClick={() => setSelectedMatriculaId(matricula.id)}

          >

            <ArrowRightLeft className="w-4 h-4" />

            {isMobile && <span className="ml-2 text-xs font-bold uppercase">Transferir</span>}

          </Button>

        </DialogTrigger>

        {selectedMatriculaId === matricula.id && (

          <DialogContent className="max-w-xl rounded-[32px] p-0 border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

            <DialogHeader className=" border-b border-zinc-50">

              <DialogTitle className="flex items-center gap-2 text-xl font-black text-zinc-900">

                <ArrowRightLeft className="w-6 h-6 text-amber-600" />

                Transferência de Aluno

              </DialogTitle>

            </DialogHeader>

            <div className="p-8 pt-6 flex-1 overflow-y-auto">

              <MatriculaTransferForm

                matriculaId={matricula.id}

                turmaAtualId={turma.id}

                alunoNome={matricula.aluno?.usuario.nome || 'Aluno'}

                onClose={() => setSelectedMatriculaId(null)}

                onSuccess={() => onRefresh?.()}

              />

            </div>

          </DialogContent>

        )}

      </Dialog>



      {/* Botão Histórico */}

      <Dialog>

        <DialogTrigger asChild>

          <Button

            variant={isMobile ? "outline" : "ghost"}

            size={isMobile ? "sm" : "icon"}

            className={`${isMobile ? 'h-9 w-9 rounded-full' : 'h-8 w-8'} hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors hover:cursor-pointer`}

            title="Ver histórico de transferências"

            onClick={() => setSelectedMatriculaId(matricula.id)}

          >

            <History className="w-4 h-4" />

          </Button>

        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[90vh] rounded-[32px] p-0 border-none shadow-2xl flex flex-col overflow-hidden">

          <DialogHeader className=" border-b border-zinc-50">

            <DialogTitle className="flex items-center gap-2 text-xl font-black text-zinc-900">

              <History className="w-6 h-6 text-indigo-600" />

              Histórico de {matricula.aluno?.usuario.nome}

            </DialogTitle>

          </DialogHeader>

          <div className=" flex-1 overflow-y-auto">

            {selectedMatriculaId === matricula.id && (

              <MatriculaHistorico matriculaId={matricula.id} />

            )}

          </div>

        </DialogContent>

      </Dialog>

    </div>

  );

};
