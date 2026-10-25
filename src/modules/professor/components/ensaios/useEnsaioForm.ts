import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import type { EnsaioAgendado, EnsaioPayload } from '../../types'

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

/** `dataLimite` é a data do espetáculo: o ensaio precisa acontecer até ela. */
const criarSchema = (ensaio: EnsaioAgendado | null, dataLimite: string | null) =>
  z
    .object({
      data: z.string().min(1, 'Informe a data'),
      hora_inicio: z.string().regex(HORA, 'Informe a hora de início'),
      hora_termino: z.string().regex(HORA, 'Informe a hora de término'),
      local: z.string().trim().max(255, 'Máximo de 255 caracteres'),
      observacoes: z.string().max(2000, 'Máximo de 2000 caracteres'),
    })
    .superRefine((dados, ctx) => {
      const hoje = format(new Date(), 'yyyy-MM-dd')
      const manteveData = ensaio !== null && dados.data === ensaio.data

      if (!manteveData && dados.data && dados.data < hoje) {
        ctx.addIssue({ code: 'custom', path: ['data'], message: 'O ensaio não pode ser no passado' })
      }
      if (dataLimite && dados.data > dataLimite) {
        ctx.addIssue({ code: 'custom', path: ['data'], message: 'O ensaio deve ser até a data do espetáculo' })
      }
      if (HORA.test(dados.hora_inicio) && HORA.test(dados.hora_termino) && dados.hora_termino <= dados.hora_inicio) {
        ctx.addIssue({ code: 'custom', path: ['hora_termino'], message: 'O término deve ser depois do início' })
      }
    })

type EnsaioFormValues = z.infer<ReturnType<typeof criarSchema>>

const valoresIniciais = (ensaio: EnsaioAgendado | null): EnsaioFormValues => ({
  data: ensaio?.data ?? format(new Date(), 'yyyy-MM-dd'),
  hora_inicio: ensaio?.hora_inicio ?? '',
  hora_termino: ensaio?.hora_termino ?? '',
  local: ensaio?.local ?? '',
  observacoes: ensaio?.observacoes ?? '',
})

export const useEnsaioForm = (
  ensaio: EnsaioAgendado | null,
  dataLimite: string | null,
  aberto: boolean,
  onSalvar: (payload: EnsaioPayload) => void,
) => {
  const schema = useMemo(() => criarSchema(ensaio, dataLimite), [ensaio, dataLimite])

  const form = useForm<EnsaioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(ensaio),
  })

  useEffect(() => {
    if (aberto) form.reset(valoresIniciais(ensaio))
  }, [aberto, ensaio, form])

  const enviar = form.handleSubmit((valores) => {
    onSalvar({
      data: valores.data,
      hora_inicio: valores.hora_inicio,
      hora_termino: valores.hora_termino,
      local: valores.local || null,
      observacoes: valores.observacoes.trim() || null,
    })
  })

  return { form, enviar }
}
