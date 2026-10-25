import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { ObservacaoAluno, ObservacaoPayload } from '../../../types'

const schema = z.object({
  tipo: z.enum(['comportamento', 'evolucao', 'alerta', 'geral']),
  texto: z.string().trim().min(1, 'Escreva a observação').max(5000, 'Máximo de 5000 caracteres'),
  visivel_responsavel: z.boolean(),
  id_turma: z.number().nullable(),
})

type ObservacaoFormValues = z.infer<typeof schema>

const valoresIniciais = (observacao: ObservacaoAluno | null, turmaPadrao: number | null): ObservacaoFormValues => ({
  tipo: observacao?.tipo ?? 'evolucao',
  texto: observacao?.texto ?? '',
  visivel_responsavel: observacao?.visivel_responsavel ?? false,
  id_turma: observacao ? observacao.id_turma : turmaPadrao,
})

export const useObservacaoForm = (
  observacao: ObservacaoAluno | null,
  turmaPadrao: number | null,
  aberto: boolean,
  onSalvar: (payload: ObservacaoPayload) => void
) => {
  const form = useForm<ObservacaoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(observacao, turmaPadrao),
  })

  useEffect(() => {
    if (aberto) form.reset(valoresIniciais(observacao, turmaPadrao))
  }, [aberto, observacao, turmaPadrao, form])

  const enviar = form.handleSubmit((valores) => {
    onSalvar({ ...valores, texto: valores.texto.trim() })
  })

  const [tipo, visivelResponsavel, idTurma] = useWatch({
    control: form.control,
    name: ['tipo', 'visivel_responsavel', 'id_turma'],
  })

  return { form, enviar, tipo, visivelResponsavel, idTurma }
}
