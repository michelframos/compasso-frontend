import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2, GraduationCap, Info, History, FileText,
  DollarSign, CalendarDays, UserCircle, BookOpen, Users
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useMatriculaForm } from '../hooks/useMatriculaForm';
import { useAlunos } from '../hooks/useAlunos';
import { useTurmas } from '../../Turmas/hooks/useTurmas';
import { MatriculaHistorico } from './MatriculaHistorico';
import { MatriculaMensalidades } from './MatriculaMensalidades';
import { MatriculaAgendamentos } from './MatriculaAgendamentos';
import { MatriculaContrato } from './MatriculaContrato';
import { useContratos } from '@/modules/financeiro';
import { leadsApi, type Lead } from '@/modules/comercial';
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import type { Aluno } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { substituirPlaceholders } from '@/shared/lib/contrato-utils';
import api from '@/shared/lib/axios';
import { cn } from '@/shared/lib/utils';

type OpcaoCurso = { id: number; nome: string }
type OpcaoNivel = { id: number; nome: string; curso_id?: number | null }
type OpcaoProfessor = { id: number; usuario: { nome: string } }
interface MatriculaFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { id: number };
  defaultTurmaId?: string;
  defaultAlunoId?: string;
  defaultLeadId?: string;
  excludedAlunoIds?: number[];
}
export const MatriculaForm: React.FC<MatriculaFormProps> = ({
  onClose, onSuccess, initialData, defaultTurmaId, defaultAlunoId, defaultLeadId, excludedAlunoIds = []
}) => {
  const isEdit = !!initialData;
  const hasFinanceiro = useHasModulo('financeiro');
  const hasLeads = useHasModulo('leads');
  const [activeTab, setActiveTab] = useState<'geral' | 'historico' | 'mensalidades' | 'agendamentos' | 'contrato'>('geral');
  React.useEffect(() => {
    if ((activeTab === 'mensalidades' || activeTab === 'contrato') && !hasFinanceiro) {
      setActiveTab('geral');
    }
  }, [activeTab, hasFinanceiro]);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const { form, onSubmit, isLoading, fullMatriculaData, isFetchingFullData } = useMatriculaForm(
    onSuccess,
    { ...initialData, defaultTurmaId, defaultAlunoId, defaultLeadId }
  );
  const { register, watch, control, formState: { errors } } = form;
  const { alunos, fetchAlunos, isLoading: isLoadingAlunos } = useAlunos();
  const { turmas, fetchTurmas, isLoading: isLoadingTurmas } = useTurmas();
  const { contratos, fetchContratos } = useContratos();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cursos, setCursos] = useState<OpcaoCurso[]>([]);
  const [niveis, setNiveis] = useState<OpcaoNivel[]>([]);
  const [professores, setProfessores] = useState<OpcaoProfessor[]>([]);
  const [preselectedAluno, setPreselectedAluno] = useState<Aluno | null>(null);
  const turmaDetalheCache = useRef<Map<string, unknown>>(new Map());
  const cursoDetalheCache = useRef<Map<string, unknown>>(new Map());
  const alunoDetalheCache = useRef<Map<string, unknown>>(new Map());
  const tipoMatricula = watch('tipo');
  const selectedTurmaId = watch('id_turma');
  const selectedCursoId = watch('id_curso');
  const selectedAlunoId = watch('id_aluno');
  const selectedContratoId = watch('contrato_id');

  // Base do formulário: só o necessário para matrícula em turma (fluxo padrão).
  useEffect(() => {
    fetchAlunos('id', 'desc', '', 200);
    fetchTurmas();
    if (hasFinanceiro) fetchContratos(1, 'nome', 'asc');
    if (hasLeads) {
      leadsApi.listLeads({ page: 1 })
        .then((res) => setLeads(res.data ?? []))
        .catch((err) => console.error('Erro ao carregar leads:', err));
    }
  }, [fetchAlunos, fetchTurmas, fetchContratos, hasFinanceiro, hasLeads]);

  // Curso/nível/professor só entram quando o tipo muda para "curso".
  useEffect(() => {
    if (tipoMatricula !== 'curso') return;
    let ativo = true;
    const carregarOpcoesCurso = async () => {
      try {
        const [cursosRes, niveisRes, professoresRes] = await Promise.all([
          api.get('/cursos', { params: { per_page: 100 } }),
          api.get('/niveis', { params: { per_page: 100 } }),
          api.get('/professores', { params: { per_page: 100 } }),
        ]);
        if (!ativo) return;
        setCursos(cursosRes.data.data ?? []);
        setNiveis(niveisRes.data.data ?? []);
        setProfessores(professoresRes.data.data ?? []);
      } catch (err) {
        console.error('Erro ao carregar opções de matrícula em curso:', err);
      }
    };
    void carregarOpcoesCurso();
    return () => { ativo = false; };
  }, [tipoMatricula]);

  useEffect(() => {
    if (defaultAlunoId && !alunos.find(a => String(a.id) === String(defaultAlunoId))) {
      api.get(`/alunos/${defaultAlunoId}`).then(res => {
        setPreselectedAluno(res.data.data);
      }).catch(err => console.error('Erro ao buscar aluno pré-selecionado:', err));
    }
  }, [defaultAlunoId, alunos]);

  const niveisFiltered = selectedCursoId
    ? niveis.filter(n => !n.curso_id || n.curso_id === Number(selectedCursoId))
    : niveis;
  const showTransferReason = !!(
    fullMatriculaData &&
    tipoMatricula === 'turma' &&
    selectedTurmaId &&
    Number(selectedTurmaId) !== fullMatriculaData.id_turma
  );

  const obterTurmaDetalhe = async (turmaId: string) => {
    const cached = turmaDetalheCache.current.get(turmaId);
    if (cached) return cached;
    const response = await api.get(`/turmas/${turmaId}`);
    const data = response.data.data;
    turmaDetalheCache.current.set(turmaId, data);
    return data;
  };

  const obterCursoDetalhe = async (cursoId: string) => {
    const cached = cursoDetalheCache.current.get(cursoId);
    if (cached) return cached;
    const response = await api.get(`/cursos/${cursoId}`);
    const data = response.data.data;
    cursoDetalheCache.current.set(cursoId, data);
    return data;
  };

  const obterAlunoDetalhe = async (alunoId: string) => {
    const cached = alunoDetalheCache.current.get(alunoId);
    if (cached) return cached;
    const response = await api.get(`/alunos/${alunoId}`);
    const data = response.data.data;
    alunoDetalheCache.current.set(alunoId, data);
    return data;
  };

  // Cascata de contratos — tipo=turma
  useEffect(() => {
    if (!hasFinanceiro || !selectedTurmaId || isEdit || tipoMatricula !== 'turma') return;
    const aplicarContratoCascata = async () => {
      try {
        const turmaData = await obterTurmaDetalhe(String(selectedTurmaId)) as {
          contrato_id?: number | null
          curso?: { contrato_id?: number | null }
        };
        let contratoIdParaAplicar = null;
        let origem = '';
        if (turmaData.contrato_id) {
          contratoIdParaAplicar = turmaData.contrato_id;
          origem = 'turma';
        } else if (turmaData.curso?.contrato_id) {
          contratoIdParaAplicar = turmaData.curso.contrato_id;
          origem = 'curso';
        }
        if (contratoIdParaAplicar && form.getValues('contrato_id') !== contratoIdParaAplicar) {
          form.setValue('contrato_id', contratoIdParaAplicar);
          toast.success(`Contrato padrão da ${origem} aplicado automaticamente!`, {
            description: 'Você pode alterá-lo manualmente se necessário.'
          });
        }
      } catch (error) {
        console.error('Erro ao buscar contrato da turma:', error);
      }
    };
    void aplicarContratoCascata();
  }, [selectedTurmaId, isEdit, tipoMatricula, form, hasFinanceiro]);

  // Cascata de contratos — tipo=curso
  useEffect(() => {
    if (!hasFinanceiro || !selectedCursoId || isEdit || tipoMatricula !== 'curso') return;
    const aplicarContratoCascataCurso = async () => {
      try {
        const cursoData = await obterCursoDetalhe(String(selectedCursoId)) as { contrato_id?: number | null };
        if (cursoData?.contrato_id && form.getValues('contrato_id') !== cursoData.contrato_id) {
          form.setValue('contrato_id', cursoData.contrato_id);
          toast.success('Contrato padrão do curso aplicado automaticamente!', {
            description: 'Você pode alterá-lo manualmente se necessário.'
          });
        }
      } catch (error) {
        console.error('Erro ao buscar contrato do curso:', error);
      }
    };
    void aplicarContratoCascataCurso();
  }, [selectedCursoId, isEdit, tipoMatricula, form, hasFinanceiro]);

  useEffect(() => {
    if (!hasLeads || !selectedAlunoId || isEdit || form.getValues('id_lead')) return;
    const aluno = alunos.find(a => String(a.id) === String(selectedAlunoId));
    if (aluno?.id_lead) {
      form.setValue('id_lead', aluno.id_lead);
      toast.success('Lead de origem vinculado automaticamente ao aluno!', {
        description: 'Rastreamento de conversão preservado.'
      });
    }
  }, [selectedAlunoId, isEdit, alunos, form, hasLeads]);

  // Snapshot do contrato — reutiliza cache de aluno/turma/curso
  useEffect(() => {
    if (!hasFinanceiro || !selectedContratoId || selectedContratoId.toString() === 'none' || !selectedAlunoId) {
      if (form.getValues('contrato_gerado') !== null) {
        form.setValue('contrato_gerado', null);
      }
      return;
    }
    if (tipoMatricula === 'turma' && !selectedTurmaId) return;
    if (tipoMatricula === 'curso' && !selectedCursoId) return;
    let isMounted = true;
    const gerarSnapshot = async () => {
      setIsGeneratingSnapshot(true);
      try {
        const contrato = contratos.find(c => c.id === Number(selectedContratoId));
        if (!contrato) return;
        const [alunoData, entidadeData] = await Promise.all([
          obterAlunoDetalhe(String(selectedAlunoId)),
          tipoMatricula === 'turma'
            ? obterTurmaDetalhe(String(selectedTurmaId))
            : obterCursoDetalhe(String(selectedCursoId)),
        ]);
        if (!isMounted) return;
        const conteudoGerado = substituirPlaceholders(contrato.conteudo, {
          aluno: alunoData,
          turma: tipoMatricula === 'turma' ? entidadeData : undefined,
          curso: tipoMatricula === 'curso' ? entidadeData : undefined,
          data_matricula: form.getValues('data')
        });
        if (form.getValues('contrato_gerado') !== conteudoGerado) {
          form.setValue('contrato_gerado', conteudoGerado);
        }
      } catch (error) {
        console.error('Erro ao gerar snapshot do contrato:', error);
      } finally {
        if (isMounted) setIsGeneratingSnapshot(false);
      }
    };
    const timeoutId = setTimeout(gerarSnapshot, 500);
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [hasFinanceiro, selectedContratoId, selectedAlunoId, selectedTurmaId, selectedCursoId, tipoMatricula, contratos, form]);
  const alunosDisponiveis = Array.isArray(alunos)
    ? (excludedAlunoIds.length > 0
      ? alunos.filter(a => a && !excludedAlunoIds.includes(a.id))
      : alunos)
    : [];
  if (isFetchingFullData || isLoadingAlunos || isLoadingTurmas) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-zinc-500 font-medium">Carregando informações...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full bg-white flex-1 overflow-hidden">
      {/* Tabs Header — apenas em modo edição */}
      {isEdit && (
        <div className="flex flex-col p-8 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveTab('geral')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'geral'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <FileText className="w-4 h-4" />
              Dados da Matrícula
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agendamentos')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'agendamentos'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <CalendarDays className="w-4 h-4" />
              Agendamentos
            </button>
            {/* Histórico apenas para tipo=turma */}
            {(!fullMatriculaData || fullMatriculaData.tipo === 'turma') && (
              <button
                type="button"
                onClick={() => setActiveTab('historico')}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'historico'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
              >
                <History className="w-4 h-4" />
                Histórico de Transferências
              </button>
            )}
            {hasFinanceiro && (
<button
              type="button"
              onClick={() => setActiveTab('mensalidades')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'mensalidades'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <DollarSign className="w-4 h-4" />
              Mensalidades
            </button>
)}
            {hasFinanceiro && (
<button
              type="button"
              onClick={() => setActiveTab('contrato')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'contrato'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <FileText className="w-4 h-4" />
              Contrato
            </button>
)}
          </div>
        </div>
      )}
      <form onSubmit={(e) => { e.stopPropagation(); onSubmit(e); }} className="flex flex-col flex-1 overflow-hidden">
        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'geral' ? (
            <>
              {/* Seção Dados da Matrícula */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Dados da Matrícula</h3>
                </div>
                {/* Tipo de Matrícula — toggle só em criação ou quando editando */}
                {!isEdit && (
                  <div className="space-y-2">
                    <Label className="font-medium ml-1 text-zinc-700">Tipo de Matrícula *</Label>
                    <Controller
                      name="tipo"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('turma')}
                            className={cn(
                              'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all hover:cursor-pointer',
                              field.value === 'turma'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                            )}
                          >
                            <Users className={cn('w-6 h-6', field.value === 'turma' ? 'text-indigo-600' : 'text-zinc-400')} />
                            <div className="text-center">
                              <p className="font-bold text-sm">Matrícula em Turma</p>
                              <p className="text-[11px] mt-0.5 opacity-70">Vincula o aluno a uma turma existente</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('curso')}
                            className={cn(
                              'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all hover:cursor-pointer',
                              field.value === 'curso'
                                ? 'border-violet-500 bg-violet-50 text-violet-700'
                                : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                            )}
                          >
                            <BookOpen className={cn('w-6 h-6', field.value === 'curso' ? 'text-violet-600' : 'text-zinc-400')} />
                            <div className="text-center">
                              <p className="font-bold text-sm">Matrícula em Curso</p>
                              <p className="text-[11px] mt-0.5 opacity-70">Vincula o aluno a um curso e professor</p>
                            </div>
                          </button>
                        </div>
                      )}
                    />
                  </div>
                )}
                {/* Badge de tipo em modo edição */}
                {isEdit && fullMatriculaData && (
                  <div className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold',
                    fullMatriculaData.tipo === 'turma'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-violet-50 text-violet-700 border border-violet-200'
                  )}>
                    {fullMatriculaData.tipo === 'turma'
                      ? <><Users className="w-3 h-3" /> Matrícula em Turma</>
                      : <><BookOpen className="w-3 h-3" /> Matrícula em Curso</>
                    }
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Aluno */}
                  <div className="space-y-2">
                    <Label htmlFor="id_aluno" className={`font-medium ml-1 ${errors.id_aluno ? 'text-rose-500' : 'text-zinc-700'}`}>
                      Aluno *
                    </Label>
                    {isEdit || defaultAlunoId ? (
                      <div className="h-11 flex items-center px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 font-bold text-sm shadow-sm">
                        <UserCircle className="w-4 h-4 mr-2 text-zinc-400" />
                        {fullMatriculaData?.aluno?.usuario?.nome ||
                          alunos.find(a => a.id === Number(watch('id_aluno')))?.usuario?.nome ||
                          preselectedAluno?.usuario?.nome ||
                          'Aluno selecionado'}
                      </div>
                    ) : (
                      <select
                        id="id_aluno"
                        {...register('id_aluno')}
                        className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_aluno ? 'border-rose-500' : 'border-zinc-200'}`}
                      >
                        <option value="">Selecione um aluno</option>
                        {alunosDisponiveis.length === 0 ? (
                          <option disabled value="">Nenhum aluno disponível</option>
                        ) : (
                          alunosDisponiveis.map(aluno => (
                            <option key={aluno.id} value={String(aluno.id)}>{aluno.usuario.nome}</option>
                          ))
                        )}
                      </select>
                    )}
                    {errors.id_aluno && <p className="text-[11px] text-rose-500 ml-1">{errors.id_aluno.message}</p>}
                  </div>
                  {/* Data da Matrícula */}
                  <div className="space-y-2">
                    <Label htmlFor="data" className={`font-medium ml-1 ${errors.data ? 'text-rose-500' : 'text-zinc-700'}`}>
                      Data da Matrícula *
                    </Label>
                    <Input
                      id="data"
                      type="date"
                      {...register('data')}
                      className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.data ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                    />
                    {errors.data && <p className="text-[11px] text-rose-500 ml-1">{errors.data.message}</p>}
                  </div>
                  {/* === CAMPOS TIPO TURMA === */}
                  {tipoMatricula === 'turma' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="id_turma" className={`font-medium ml-1 ${errors.id_turma ? 'text-rose-500' : 'text-zinc-700'}`}>
                        Turma *
                      </Label>
                      <select
                        id="id_turma"
                        {...register('id_turma')}
                        className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_turma ? 'border-rose-500' : 'border-zinc-200'}`}
                      >
                        <option value="">Selecione uma turma</option>
                        {Array.isArray(turmas) && turmas.map(turma => (
                          <option key={turma.id} value={String(turma.id)}>
                            {turma.curso?.nome} - {turma.nivel?.nome} (#{turma.id})
                          </option>
                        ))}
                      </select>
                      {errors.id_turma && <p className="text-[11px] text-rose-500 ml-1">{errors.id_turma.message}</p>}
                    </div>
                  )}
                  {/* === CAMPOS TIPO CURSO === */}
                  {tipoMatricula === 'curso' && (
                    <>
                      {/* Curso */}
                      <div className="space-y-2">
                        <Label htmlFor="id_curso" className={`font-medium ml-1 ${errors.id_curso ? 'text-rose-500' : 'text-zinc-700'}`}>
                          Curso *
                        </Label>
                        <select
                          id="id_curso"
                          {...register('id_curso')}
                          className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_curso ? 'border-rose-500' : 'border-zinc-200'}`}
                        >
                          <option value="">Selecione um curso</option>
                          {cursos.map(curso => (
                            <option key={curso.id} value={String(curso.id)}>{curso.nome}</option>
                          ))}
                        </select>
                        {errors.id_curso && <p className="text-[11px] text-rose-500 ml-1">{errors.id_curso.message}</p>}
                      </div>
                      {/* Nível */}
                      <div className="space-y-2">
                        <Label htmlFor="id_nivel" className={`font-medium ml-1 ${errors.id_nivel ? 'text-rose-500' : 'text-zinc-700'}`}>
                          Nível *
                        </Label>
                        <select
                          id="id_nivel"
                          {...register('id_nivel')}
                          className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_nivel ? 'border-rose-500' : 'border-zinc-200'}`}
                        >
                          <option value="">Selecione um nível</option>
                          {niveisFiltered.map(nivel => (
                            <option key={nivel.id} value={String(nivel.id)}>{nivel.nome}</option>
                          ))}
                        </select>
                        {errors.id_nivel && <p className="text-[11px] text-rose-500 ml-1">{errors.id_nivel.message}</p>}
                      </div>
                      {/* Professor */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="id_professor" className={`font-medium ml-1 ${errors.id_professor ? 'text-rose-500' : 'text-zinc-700'}`}>
                          Professor *
                        </Label>
                        <select
                          id="id_professor"
                          {...register('id_professor')}
                          className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_professor ? 'border-rose-500' : 'border-zinc-200'}`}
                        >
                          <option value="">Selecione um professor</option>
                          {professores.map(professor => (
                            <option key={professor.id} value={String(professor.id)}>
                              {professor.usuario.nome}
                            </option>
                          ))}
                        </select>
                        {errors.id_professor && <p className="text-[11px] text-rose-500 ml-1">{errors.id_professor.message}</p>}
                      </div>
                    </>
                  )}
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-zinc-700 font-medium ml-1">Status</Label>
                    <select
                      id="status"
                      {...register('status')}
                      className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                    >
                      <option value="ativa">Ativa</option>
                      <option value="pausada">Pausada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="completada">Completada</option>
                      <option value="transferida">Transferida</option>
                    </select>
                  </div>
                  {hasLeads && (
                  <div className="space-y-2">
                    <Label htmlFor="id_lead" className="text-zinc-700 font-medium ml-1">Origem (Lead)</Label>
                    <Controller
                      name="id_lead"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                          value={field.value?.toString() || 'none'}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-zinc-200 focus:ring-indigo-600">
                            <SelectValue placeholder="Selecione o lead de origem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum (Venda Direta)</SelectItem>
                            {leads.filter(l => l.status !== 'perdido').map((lead) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.nome} ({lead.status})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-[11px] text-zinc-400 ml-1 italic">
                      Vincule um lead para rastrear a conversão no funil de vendas.
                    </p>
                  </div>
                  )}
                  {hasFinanceiro && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contrato_id" className="text-zinc-700 font-medium ml-1">Contrato / Termo de Matrícula</Label>
                    <Controller
                      name="contrato_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                          value={field.value?.toString() || 'none'}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-zinc-200 focus:ring-indigo-600">
                            <SelectValue placeholder="Selecione um contrato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum contrato associado</SelectItem>
                            {contratos.map((contrato) => (
                              <SelectItem key={contrato.id} value={contrato.id.toString()}>
                                {contrato.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-[11px] text-zinc-400 ml-1 italic">
                      O contrato é selecionado automaticamente com base na Turma ou Curso.
                    </p>
                  </div>
                  )}
                  {/* Status geração snapshot */}
                  {hasFinanceiro && selectedContratoId && selectedContratoId.toString() !== 'none' && (
                    <div className="md:col-span-2 flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      {isGeneratingSnapshot ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5 text-indigo-600" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-indigo-900">
                          {isGeneratingSnapshot ? 'Gerando snapshot do contrato...' : 'Snapshot do Contrato Gerado'}
                        </span>
                        <span className="text-[11px] text-indigo-700">
                          {isGeneratingSnapshot
                            ? 'Aguarde enquanto processamos os dados...'
                            : 'O conteúdo do contrato foi processado e será salvo como registro histórico desta matrícula.'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Motivo de Transferência */}
                {showTransferReason && (
                  <div className="space-y-2 p-4 bg-amber-50 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2">
                      <History className="w-4 h-4 text-amber-600" />
                      <Label htmlFor="motivo_transferencia" className="text-amber-900 font-bold text-sm uppercase tracking-tight">Motivo da Transferência</Label>
                    </div>
                    <Input
                      id="motivo_transferencia"
                      {...register('motivo_transferencia')}
                      placeholder="Ex: Mudança de horário, solicitação do aluno..."
                      className="h-11 rounded-xl border-amber-200 bg-white focus-visible:ring-amber-500"
                    />
                    <p className="text-[11px] text-amber-700">Ao alterar a turma, um registro histórico será criado automaticamente.</p>
                  </div>
                )}
              </div>
              {/* Seção Observações */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                  <Info className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Observações</h3>
                </div>
                <div className="space-y-2">
                  <textarea
                    id="observacoes"
                    {...register('observacoes')}
                    className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"
                    placeholder="Detalhes adicionais sobre a matrícula..."
                  />
                </div>
              </div>
            </>
          ) : activeTab === 'historico' ? (
            initialData && <MatriculaHistorico matriculaId={initialData.id} />
          ) : activeTab === 'mensalidades' && hasFinanceiro ? (
            initialData && <MatriculaMensalidades matriculaId={initialData.id} alunoId={fullMatriculaData?.id_aluno} />
          ) : activeTab === 'agendamentos' ? (
            <MatriculaAgendamentos
              turmaId={fullMatriculaData?.id_turma ?? undefined}
              alunoId={fullMatriculaData?.id_aluno}
              professorId={fullMatriculaData?.tipo === 'curso'
                ? fullMatriculaData?.id_professor
                : fullMatriculaData?.turma?.id_professor ?? fullMatriculaData?.id_professor}
              cursoId={fullMatriculaData?.id_curso}
              nivelId={fullMatriculaData?.id_nivel}
            />
          ) : activeTab === 'contrato' && hasFinanceiro ? (
            <MatriculaContrato
              matricula={{
                ...fullMatriculaData,
                contrato_gerado: watch('contrato_gerado'),
                aluno: fullMatriculaData?.aluno || alunos.find(a => String(a.id) === String(watch('id_aluno'))),
                turma: fullMatriculaData?.turma || turmas.find(t => String(t.id) === String(watch('id_turma'))),
                data: watch('data'),
                id_turma: Number(watch('id_turma'))
              } as any}
            />
          ) : null}
        </div>
        {/* Footer */}
        <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px]">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100 w-full md:w-auto"
          >
            {activeTab === 'geral' ? 'Cancelar' : 'Fechar'}
          </Button>
          {activeTab === 'geral' && (
            <Button
              type="submit"
              disabled={isLoading || isGeneratingSnapshot}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isGeneratingSnapshot ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Contrato...
                </>
              ) : (
                isEdit ? 'Atualizar Matrícula' : 'Realizar Matrícula'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
