import type { Matricula } from '../types';

export interface MatriculaDescricao {
    isCurso: boolean;
    tipoLabel: string;
    curso: string | null;
    nivel: string | null;
    professor: string | null;
    titulo: string;
    subtitulo: string | null;
}

export const descreverMatricula = (matricula: Matricula): MatriculaDescricao => {
    const isCurso = matricula.tipo === 'curso' || (!matricula.id_turma && !!matricula.id_curso);
    const curso = matricula.turma?.curso?.nome ?? matricula.curso?.nome ?? null;
    const nivel = matricula.turma?.nivel?.nome ?? matricula.nivel?.nome ?? null;
    const professor = matricula.turma?.professor?.usuario?.nome ?? matricula.professor?.usuario?.nome ?? null;

    const titulo = isCurso
        ? curso ?? 'Curso não informado'
        : matricula.turma?.descricao
            || (curso ? `Turma de ${curso}` : matricula.id_turma ? `Turma #${matricula.id_turma}` : 'Turma não informada');

    return {
        isCurso,
        tipoLabel: isCurso ? 'Curso individual' : 'Turma',
        curso,
        nivel,
        professor,
        titulo,
        subtitulo: !isCurso && matricula.turma?.descricao && curso ? `Curso: ${curso}` : null,
    };
};
