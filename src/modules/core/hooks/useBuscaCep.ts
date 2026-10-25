import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { buscarEnderecoPorCep, type EnderecoCep } from '@/modules/core/api/localidades'
import { getErrorMessage, unmaskCep } from '@/shared/lib/utils'

interface UseBuscaCepOptions {
  onEncontrado: (endereco: EnderecoCep) => void | Promise<void>
}

/**
 * Busca o endereço quando o CEP fica completo (8 dígitos).
 * Deve ser chamado apenas a partir de eventos do input (onChange/onBlur), para que valores
 * carregados programaticamente (edição, responsável existente) não sobrescrevam o endereço salvo.
 */
export function useBuscaCep({ onEncontrado }: UseBuscaCepOptions) {
  const [isBuscando, setIsBuscando] = useState(false)
  const ultimoCepBuscado = useRef<string | null>(null)
  const onEncontradoRef = useRef(onEncontrado)

  useEffect(() => {
    onEncontradoRef.current = onEncontrado
  }, [onEncontrado])

  const buscar = useCallback(async (valor: string | null | undefined) => {
    const cep = unmaskCep(valor ?? '')

    if (cep.length !== 8) {
      ultimoCepBuscado.current = null
      return
    }

    if (cep === ultimoCepBuscado.current) return
    ultimoCepBuscado.current = cep

    setIsBuscando(true)
    try {
      const endereco = await buscarEnderecoPorCep(cep)
      await onEncontradoRef.current(endereco)

      if (endereco.cidade && !endereco.id_cidade) {
        toast.warning(`Cidade "${endereco.cidade}" não encontrada na lista. Selecione-a manualmente.`)
      } else if (!endereco.logradouro || !endereco.bairro) {
        toast.info('CEP geral da cidade. Preencha a rua e o bairro manualmente.')
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        toast.error('CEP não encontrado.')
      } else {
        ultimoCepBuscado.current = null
        toast.error(getErrorMessage(error, 'Não foi possível consultar o CEP.'))
      }
    } finally {
      setIsBuscando(false)
    }
  }, [])

  return { buscar, isBuscando }
}
