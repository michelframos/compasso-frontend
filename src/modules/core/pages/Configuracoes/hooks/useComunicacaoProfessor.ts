import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getComunicacaoProfessor, salvarComunicacaoProfessor } from '../../../api/comunicacaoProfessor'
import { getErrorMessage } from '@/shared/lib/utils'

export const LIMITE_MINIMO = 1
export const LIMITE_MAXIMO = 100

export const useComunicacaoProfessor = () => {
  const [salvo, setSalvo] = useState<number | null>(null)
  const [limite, setLimite] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let cancelled = false

    getComunicacaoProfessor()
      .then((resposta) => {
        if (cancelled) return
        setSalvo(resposta.limite_avisos_dia)
        setLimite(String(resposta.limite_avisos_dia))
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar o limite de avisos.'))
      })

    return () => {
      cancelled = true
    }
  }, [])

  const valor = Number(limite)
  const valido = Number.isInteger(valor) && valor >= LIMITE_MINIMO && valor <= LIMITE_MAXIMO

  const salvar = async () => {
    if (!valido || valor === salvo) return
    setSalvando(true)

    try {
      const resposta = await salvarComunicacaoProfessor({ limite_avisos_dia: valor })
      setSalvo(resposta.limite_avisos_dia)
      setLimite(String(resposta.limite_avisos_dia))
      toast.success('Limite de avisos atualizado.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o limite de avisos.'))
    } finally {
      setSalvando(false)
    }
  }

  return { carregado: salvo !== null, limite, setLimite, valido, alterado: valido && valor !== salvo, salvando, salvar }
}
