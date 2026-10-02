import React from 'react';
import type { DiarioData } from '../hooks/useDiarioClasse';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DiarioViewProps {
  data: DiarioData | any;
  isBlank?: boolean;
}

const statusMap: Record<string, string> = {
  'presente': 'P',
  'falta': 'F',
  'falta_justificada': 'J',
};

const statusColorMap: Record<string, string> = {
  'presente': 'text-emerald-600',
  'falta': 'text-rose-600',
  'falta_justificada': 'text-amber-600',
};

const diasSemana: Record<string, string> = {
  'segunda': 'Segunda-feira',
  'terca': 'Terça-feira',
  'quarta': 'Quarta-feira',
  'quinta': 'Quinta-feira',
  'sexta': 'Sexta-feira',
  'sabado': 'Sábado',
  'domingo': 'Domingo',
};

export const DiarioView: React.FC<DiarioViewProps> = ({ data, isBlank }) => {
  const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const aulas = isBlank ? Array.from({ length: 1 }, (_, i) => ({ id: `blank_aula_${i}`, data: null, conteudo_dado: '', presencas: {} })) : (data?.aulas || []);
  const alunos = isBlank && (!data?.alunos || data.alunos.length === 0) 
    ? Array.from({ length: 20 }, (_, i) => ({ id_aluno: `blank_aluno_${i}`, nome: '' })) 
    : (data?.alunos || []);

  return (
    <div className={`bg-white p-8 rounded-lg shadow-sm border border-zinc-100 print:shadow-none print:border-none print:p-0 ${isBlank ? 'max-w-[800px] mx-auto' : ''}`}>
      {/* Cabeçalho Interno - Escondido na impressão (ReportLayout já fornece um) */}
      <div className="flex justify-between items-start mb-8 border-b pb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Diário de Classe</h1>
          <p className="text-zinc-500 font-medium">Mapa de Turma e Registro de Presenças por Período</p>
        </div>
        <div className="text-right text-sm text-zinc-500">
          <p className="font-bold text-zinc-900">Gerado em:</p>
          <p>{dataAtual}</p>
        </div>
      </div>

      {/* Informações da Turma */}
      <div className={`grid gap-6 mb-8 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 ${isBlank ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Turma</p>
          <p className="font-bold text-zinc-900 leading-tight">{data?.descricao ? data.descricao : (data?.id ? `Turma #${data.id}` : '______________________')}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Professor(a)</p>
          <p className="font-bold text-zinc-900 leading-tight">{data?.professor || '______________________'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Curso / Nível</p>
          <p className="font-bold text-zinc-900 leading-tight">{data?.curso ? `${data.curso} - ${data.nivel}` : '______________________'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Horários Padrão</p>
          <div className="space-y-0.5">
            {data?.horarios && data.horarios.length > 0 ? data.horarios.map((h: any, i: number) => (
              <p key={i} className="text-[11px] font-bold text-zinc-900">
                {diasSemana[h.dia_semana] || h.dia_semana}: {h.hora_inicio.substring(0, 5)} - {h.hora_termino.substring(0, 5)}
              </p>
            )) : <p className="text-[11px] font-bold text-zinc-900">______________________</p>}
          </div>
        </div>
      </div>

      {/* Grade de Presenças */}
      <div className="mb-12">
        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Frequência dos Alunos no Período
        </h3>
        <div className="border rounded-xl overflow-hidden overflow-x-auto">
            <Table>
            <TableHeader className="bg-zinc-50">
                <TableRow>
                <TableHead className="w-10 text-center font-bold text-[11px] uppercase p-2">Nº</TableHead>
                <TableHead className="font-bold text-[11px] uppercase min-w-[200px] p-2">Aluno</TableHead>
                {aulas.map((aula: any) => (
                    <TableHead key={aula.id} className="text-center font-bold text-[10px] border-l p-1 min-w-[40px]">
                    {aula.data ? format(parseISO(aula.data), 'dd/MM') : ''}
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {alunos.length > 0 ? (
                alunos.map((aluno: any, index: number) => (
                    <TableRow key={aluno.id_aluno} className={`${isBlank ? 'h-12' : 'h-10'} hover:bg-zinc-50/50 transition-colors ${!aluno.nome ? 'border-b border-zinc-200' : ''}`}>
                    <TableCell className="text-center text-zinc-400 font-medium text-[11px] p-2">
                        {String(index + 1).padStart(2, '0')}
                    </TableCell>
                    <TableCell className="font-bold text-zinc-900 text-xs p-2">
                        {aluno.nome}
                    </TableCell>
                    {aulas.map((aula: any) => {
                        const status = aula.presencas?.[aluno.id_aluno];
                        return (
                        <TableCell key={aula.id} className={`text-center font-black text-xs border-l p-1 ${status ? statusColorMap[status] : 'text-zinc-200'}`}>
                            {status ? statusMap[status] : (isBlank ? '' : '-')}
                        </TableCell>
                        );
                    })}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={aulas.length + 2} className="text-center py-12 text-zinc-500 italic">
                        Nenhum aluno matriculado nesta turma.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="mt-2 flex gap-4 text-[9px] font-bold uppercase text-zinc-400">
            <div className="flex items-center gap-1"><span className="text-emerald-600">P:</span> Presente</div>
            <div className="flex items-center gap-1"><span className="text-rose-600">F:</span> Falta</div>
            <div className="flex items-center gap-1"><span className="text-amber-600">J:</span> Justificada</div>
            <div className="flex items-center gap-1"><span className="text-zinc-200">-:</span> Não Lançado</div>
        </div>
      </div>

      {/* Conteúdo das Aulas */}
      <div className="print:break-before-page">
        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Registro de Conteúdos Ministrados
        </h3>
        <div className="space-y-3">
            {aulas.length > 0 ? (
                aulas.map((aula: any) => (
                    <div key={aula.id} className="flex gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
                        <div className="flex-none w-20 text-center flex flex-col justify-center">
                            <p className="text-[10px] font-black text-indigo-600 uppercase pt-0.5">{aula.data ? format(parseISO(aula.data), 'eee', { locale: ptBR }) : `Aula`}</p>
                            <p className="text-lg font-black text-zinc-900">{aula.data ? format(parseISO(aula.data), 'dd/MM') : '___/___'}</p>
                        </div>
                        <div className={`flex-1 border-l border-zinc-200 pl-4 flex flex-col justify-center ${isBlank ? 'min-h-[100px]' : 'min-h-[40px]'}`}>
                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Conteúdo</p>
                            <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                                {aula.conteudo_dado || (isBlank ? '' : <span className="text-zinc-300 italic">Conteúdo não preenchido pelo professor.</span>)}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl text-zinc-400 italic text-sm">
                    Nenhuma aula registrada no período selecionado.
                </div>
            )}
        </div>
      </div>

      {/* Rodapé do Relatório */}
      <div className="mt-16 flex justify-between items-end border-t pt-8">
        <div className="space-y-4">
          <div className="w-64 border-b border-zinc-300 h-8"></div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Assinatura do Professor</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Camerata Escola de Música</p>
          <p className="text-[9px] text-zinc-300 font-medium italic">Documento acadêmico de uso interno</p>
        </div>
      </div>
    </div>
  );
};
