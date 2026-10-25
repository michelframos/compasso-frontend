import { useState } from 'react'
import { toast } from 'sonner'
import { enviarFotoPerfil, removerFotoPerfil } from '@/modules/core/api/perfil'
import type { Perfil } from '@/modules/core/types'
import { getErrorMessage } from '@/shared/lib/utils'

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAXIMO = 2 * 1024 * 1024

export const FOTO_ACCEPT = TIPOS_ACEITOS.join(',')

export const useFotoPerfil = (onAtualizado: (perfil: Perfil) => void) => {
  const [isEnviando, setIsEnviando] = useState(false)
  const [isRemovendo, setIsRemovendo] = useState(false)

  const enviar = async (arquivo: File | undefined) => {
    if (!arquivo) return

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      toast.error('Use uma imagem JPG, PNG ou WEBP.')
      return
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error('A imagem deve ter no máximo 2MB.')
      return
    }

    setIsEnviando(true)

    try {
      const resposta = await enviarFotoPerfil(arquivo)
      onAtualizado(resposta.data)
      toast.success(resposta.message || 'Foto atualizada.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar a foto.'))
    } finally {
      setIsEnviando(false)
    }
  }

  const remover = async () => {
    setIsRemovendo(true)

    try {
      const resposta = await removerFotoPerfil()
      onAtualizado(resposta.data)
      toast.success(resposta.message || 'Foto removida.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível remover a foto.'))
    } finally {
      setIsRemovendo(false)
    }
  }

  return { enviar, remover, isEnviando, isRemovendo }
}
