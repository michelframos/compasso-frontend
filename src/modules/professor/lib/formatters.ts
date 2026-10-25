import { DIAS_SEMANA } from '../constants'
import type { AulaDoProfessor, TurmaHorario } from '../types'

export const hora = (valor: string | null | undefined) => (valor ? valor.substring(0, 5) : '')

interface TurmaNomeavel {
  descricao: string | null
  curso?: { nome: string } | null
  nivel?: { nome: string } | null
}

export const nomeTurma = (turma: TurmaNomeavel | null | undefined) => {
  if (!turma) return 'Aula avulsa'
  const base = [turma.curso?.nome, turma.nivel?.nome].filter(Boolean).join(' · ')
  return base || turma.descricao || 'Turma'
}

/** Prefere a descrição, que diferencia turmas do mesmo curso e nível. */
export const apelidoTurma = (turma: TurmaNomeavel | null | undefined) => turma?.descricao || nomeTurma(turma)

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const moeda = (valor: number) => MOEDA.format(valor)

/** Horas decimais como duração: 1.5 → "1h30". */
export const duracao = (horas: number) => {
  const minutos = Math.round(horas * 60)
  const resto = minutos % 60
  return `${Math.floor(minutos / 60)}h${resto ? String(resto).padStart(2, '0') : ''}`
}

/** Datas `Y-m-d` da API, interpretadas no fuso local. */
export const dataLocal = (valor: string) => new Date(`${valor.substring(0, 10)}T00:00:00`)

export const linkFichaAluno = (idAluno: number, idTurma?: number | null) =>
  idTurma ? `/professor/alunos/${idAluno}?turma=${idTurma}` : `/professor/alunos/${idAluno}`

export const tituloAula = (aula: AulaDoProfessor) =>
  aula.aluno_especifico?.usuario.nome
    ? `${nomeTurma(aula.turma)} — ${aula.aluno_especifico.usuario.nome}`
    : nomeTurma(aula.turma)

export const ordenarHorarios = (horarios: TurmaHorario[] = []) => {
  const ordem = DIAS_SEMANA.map((d) => d.valor)
  return [...horarios].sort(
    (a, b) => ordem.indexOf(a.dia_semana) - ordem.indexOf(b.dia_semana) || a.hora_inicio.localeCompare(b.hora_inicio)
  )
}

export const diaSemana = (valor: string, curto = false) => {
  const dia = DIAS_SEMANA.find((d) => d.valor === valor)
  if (!dia) return valor
  return curto ? dia.curto : dia.label
}
