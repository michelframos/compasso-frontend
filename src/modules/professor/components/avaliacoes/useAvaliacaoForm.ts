import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import type { AvaliacaoAluno, AvaliacaoPayload } from '../../types'

const paraNumero = (valor: string) => Number(valor.replace(',', '.'))

const notaValida = (valor: string) => {
  if (valor === '') return true
  const nota = paraNumero(valor)
  return !Number.isNaN(nota) && nota >= 0 && nota <= 10
}

const schema = z
  .object({
    id_aluno: z.number().nullable(),
    id_turma: z.number().nullable(),
    data: z
      .string()
      .min(1, 'Informe a data')
      .refine((valor) => valor <= format(new Date(), 'yyyy-MM-dd'), 'A data não pode ser futura'),
    tipo: z.enum(['pratica', 'teorica', 'apresentacao', 'participacao', 'outra']),
    nota: z.string().trim().refine(notaValida, 'A nota deve estar entre 0 e 10'),
    conceito: z.enum(['excelente', 'bom', 'regular', 'insuficiente']).nullable(),
    comentario: z.string().max(2000, 'Máximo de 2000 caracteres'),
  })
  .refine((valores) => valores.nota !== '' || valores.conceito !== null, {
    message: 'Informe a nota ou o conceito',
    path: ['nota'],
  })

export type AvaliacaoFormValues = z.infer<typeof schema>

export interface AvaliacaoFormContexto {
  idAluno: number | null
  idTurma: number | null
}

const valoresIniciais = (avaliacao: AvaliacaoAluno | null, contexto: AvaliacaoFormContexto): AvaliacaoFormValues => ({
  id_aluno: avaliacao?.id_aluno ?? contexto.idAluno,
  id_turma: avaliacao ? avaliacao.id_turma : contexto.idTurma,
  data: avaliacao?.data ?? format(new Date(), 'yyyy-MM-dd'),
  tipo: avaliacao?.tipo ?? 'pratica',
  nota: avaliacao?.nota != null ? String(avaliacao.nota).replace('.', ',') : '',
  conceito: avaliacao?.conceito ?? null,
  comentario: avaliacao?.comentario ?? '',
})

export const useAvaliacaoForm = (
  avaliacao: AvaliacaoAluno | null,
  contexto: AvaliacaoFormContexto,
  aberto: boolean,
  onSalvar: (payload: AvaliacaoPayload) => void
) => {
  const form = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(avaliacao, contexto),
  })

  const { idAluno, idTurma } = contexto

  useEffect(() => {
    if (aberto) form.reset(valoresIniciais(avaliacao, { idAluno, idTurma }))
  }, [aberto, avaliacao, idAluno, idTurma, form])

  const enviar = form.handleSubmit((valores) => {
    if (!avaliacao && valores.id_aluno === null) {
      form.setError('id_aluno', { message: 'Escolha o aluno' })
      return
    }

    onSalvar({
      id_aluno: valores.id_aluno ?? undefined,
      id_turma: valores.id_turma,
      data: valores.data,
      tipo: valores.tipo,
      nota: valores.nota === '' ? null : paraNumero(valores.nota),
      conceito: valores.conceito,
      comentario: valores.comentario.trim() || null,
    })
  })

  const [tipo, conceito, idAlunoSelecionado, idTurmaSelecionada] = useWatch({
    control: form.control,
    name: ['tipo', 'conceito', 'id_aluno', 'id_turma'],
  })

  return { form, enviar, tipo, conceito, idAlunoSelecionado, idTurmaSelecionada }
}
