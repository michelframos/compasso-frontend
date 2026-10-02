import api from './axios';
import { substituirPlaceholders } from './contrato-utils';
import { toast } from 'sonner';
import { getErrorMessage } from './utils';

/**
 * Utilitário para sincronizar contratos quando os dados de origem mudam.
 */

/**
 * Re-sincroniza todos os contratos vinculados a um aluno (Matrículas e Instrumentos).
 */
export const syncAlunoContratos = async (alunoId: number) => {
  try {
    const response = await api.get(`/alunos/${alunoId}`);
    const aluno = response.data.data;

    if (!aluno) return;

    // Sincronizar Matrículas e empréstimos
    // Atualizar Matrículas
    if (aluno.matriculas && Array.isArray(aluno.matriculas)) {
      for (const matricula of aluno.matriculas) {
        if (matricula.contrato_id) {
            // Buscar conteúdo original do contrato
            const contratoRes = await api.get(`/contratos/${matricula.contrato_id}`);
            const contratoOriginal = contratoRes.data.data;

            if (contratoOriginal) {
                const novoConteudo = substituirPlaceholders(contratoOriginal.conteudo, {
                    aluno: aluno,
                    turma: matricula.turma,
                    data_matricula: matricula.data
                });

                if (novoConteudo !== matricula.contrato_gerado) {
                    await api.put(`/matriculas/${matricula.id}`, {
                        contrato_gerado: novoConteudo
                    });
                }
            }
        }
      }
    }

    // Atualizar Instrumentos (Empréstimos Ativos)
    if (aluno.instrumentos && Array.isArray(aluno.instrumentos)) {
        for (const inst of aluno.instrumentos) {
            if (inst.status === 'emprestado' && inst.contrato_gerado) {
                 // Buscar o histórico para saber qual foi o contrato_id original
                 const histRes = await api.get(`/instrumentos/${inst.id}/historico`);
                 const historico = histRes.data.data || [];
                 const ultimoEmprestimo = historico.find((h: any) => h.acao === 'emprestimo');

                 if (ultimoEmprestimo && ultimoEmprestimo.contrato_id) {
                    const contratoRes = await api.get(`/contratos/${ultimoEmprestimo.contrato_id}`);
                    const contratoOriginal = contratoRes.data.data;

                    if (contratoOriginal) {
                        const novoConteudo = substituirPlaceholders(contratoOriginal.conteudo, {
                            aluno: aluno,
                            instrumento: inst,
                            data_emprestimo: inst.data_emprestimo || undefined
                        });

                        if (novoConteudo !== inst.contrato_gerado) {
                            await api.put(`/instrumentos/${inst.id}`, {
                                contrato_gerado: novoConteudo
                            });
                        }
                    }
                 }
            }
        }
    }

    console.log(`Sincronização de contratos do aluno ${alunoId} concluída.`);
  } catch (error) {
    console.error('Erro na sincronização de contratos do aluno:', error);
    toast.error(getErrorMessage(error, 'Ocorreu um erro ao atualizar os contratos vinculados ao aluno.'));
  }
};

/**
 * Re-sincroniza todas as matrículas de uma turma específica.
 */
export const syncTurmaContratos = async (turmaId: number) => {
    try {
        const response = await api.get(`/turmas/${turmaId}`);
        const turma = response.data.data;

        if (!turma || !turma.matriculas) return;

        for (const matricula of turma.matriculas) {
            if (matricula.contrato_id) {
                const contratoRes = await api.get(`/contratos/${matricula.contrato_id}`);
                const contratoOriginal = contratoRes.data.data;

                // Precisamos dos dados completos do aluno
                const alunoRes = await api.get(`/alunos/${matricula.id_aluno}`);
                const aluno = alunoRes.data.data;

                if (contratoOriginal && aluno) {
                    const novoConteudo = substituirPlaceholders(contratoOriginal.conteudo, {
                        aluno: aluno,
                        turma: turma,
                        data_matricula: matricula.data
                    });

                    if (novoConteudo !== matricula.contrato_gerado) {
                        await api.put(`/matriculas/${matricula.id}`, {
                            contrato_gerado: novoConteudo
                        });
                    }
                }
            }
        }
        console.log(`Sincronização de contratos da turma ${turmaId} concluída.`);
    } catch (error) {
        console.error('Erro na sincronização de contratos da turma:', error);
    }
};

/**
 * Re-sincroniza o contrato de um instrumento específico caso esteja emprestado.
 */
export const syncInstrumentoContrato = async (instrumentoId: number) => {
    try {
        const response = await api.get(`/instrumentos/${instrumentoId}`);
        const inst = response.data.data;

        if (inst && inst.id_aluno && inst.status === 'emprestado') {
             const histRes = await api.get(`/instrumentos/${inst.id}/historico`);
             const historico = histRes.data.data || [];
             const ultimoEmprestimo = historico.find((h: any) => h.acao === 'emprestimo');

             if (ultimoEmprestimo && ultimoEmprestimo.contrato_id) {
                const alunoRes = await api.get(`/alunos/${inst.id_aluno}`);
                const aluno = alunoRes.data.data;
                
                const contratoRes = await api.get(`/contratos/${ultimoEmprestimo.contrato_id}`);
                const contratoOriginal = contratoRes.data.data;

                if (contratoOriginal && aluno) {
                    const novoConteudo = substituirPlaceholders(contratoOriginal.conteudo, {
                        aluno: aluno,
                        instrumento: inst,
                        data_emprestimo: inst.data_emprestimo || undefined
                    });

                    if (novoConteudo !== inst.contrato_gerado) {
                        await api.put(`/instrumentos/${inst.id}`, {
                            contrato_gerado: novoConteudo
                        });
                    }
                }
             }
        }
    } catch (error) {
        console.error('Erro na sincronização do contrato do instrumento:', error);
    }
};
