import api from '@/shared/lib/axios'
import type { Perfil, PerfilFormData } from '@/modules/core/types'

type PerfilResponse = { data: Perfil; message?: string }

const vazioParaNull = (valor: string) => (valor.trim() === '' ? null : valor.trim())

export async function getPerfil() {
  const { data } = await api.get<PerfilResponse>('/me/perfil')
  return data.data
}

export async function updatePerfil(form: PerfilFormData) {
  const { data } = await api.put<PerfilResponse>('/me/perfil', {
    nome: form.nome.trim(),
    telefone: vazioParaNull(form.telefone),
    whatsapp: vazioParaNull(form.whatsapp),
    data_aniversario: vazioParaNull(form.data_aniversario),
    cep: vazioParaNull(form.cep),
    rua: vazioParaNull(form.rua),
    numero: vazioParaNull(form.numero),
    complemento: vazioParaNull(form.complemento),
    bairro: vazioParaNull(form.bairro),
    id_estado: form.id_estado ? Number(form.id_estado) : null,
    id_cidade: form.id_cidade ? Number(form.id_cidade) : null,
  })
  return data
}

export async function enviarFotoPerfil(foto: File) {
  const form = new FormData()
  form.append('foto', foto)

  const { data } = await api.post<PerfilResponse>('/me/perfil/foto', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function removerFotoPerfil() {
  const { data } = await api.delete<PerfilResponse>('/me/perfil/foto')
  return data
}
