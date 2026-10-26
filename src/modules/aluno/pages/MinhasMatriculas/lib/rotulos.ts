import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { HorarioMatricula, MatriculaDoAluno } from '../../../types'

const DIAS: Record<string, string> = {
  domingo: 'domingo',
  segunda: 'segunda',
  terca: 'terça',
  quarta: 'quarta',
  quinta: 'quinta',
  sexta: 'sexta',
  sabado: 'sábado',
}

const STATUS: Record<string, string> = {
  ativa: 'Ativa',
  cancelada: 'Cancelada',
  transferida: 'Transferida',
}

export function rotuloStatus(status: string | null) {
  if (!status) return 'Matrícula'
  return STATUS[status] ?? status
}

export function tituloMatricula(matricula: MatriculaDoAluno) {
  return matricula.turma?.nome || matricula.curso?.nome || 'Matrícula'
}

export function rotuloHorario(horarios: HorarioMatricula[]) {
  if (horarios.length === 0) return 'Sem horário fixo'
  return horarios
    .map((horario) => `${DIAS[horario.dia_semana] ?? horario.dia_semana}, ${horario.hora_inicio}–${horario.hora_termino}`)
    .join(' · ')
}

export function rotuloPeriodo(periodo: { inicio: string | null; fim: string | null }) {
  const inicio = periodo.inicio ? format(new Date(`${periodo.inicio}T00:00:00`), "d 'de' MMM 'de' yyyy", { locale: ptBR }) : null
  const fim = periodo.fim ? format(new Date(`${periodo.fim}T00:00:00`), "d 'de' MMM 'de' yyyy", { locale: ptBR }) : null
  if (inicio && fim) return `${inicio} a ${fim}`
  if (inicio) return `A partir de ${inicio}`
  return 'Período não informado'
}

export function rotuloData(valor: string | null) {
  if (!valor) return ''
  const dia = valor.slice(0, 10)
  return format(new Date(`${dia}T00:00:00`), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}
