import React, { useRef } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import type { Perfil } from '@/modules/core/types'
import { FOTO_ACCEPT, useFotoPerfil } from '../hooks/useFotoPerfil'

const PAPEIS: Record<string, string> = {
  admin: 'Administrador',
  secretaria: 'Secretaria',
  professor: 'Professor',
  aluno: 'Aluno',
  responsavel: 'Responsável',
}

const iniciais = (nome: string) =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')

interface FotoPerfilCardProps {
  perfil: Perfil
  onAtualizado: (perfil: Perfil) => void
}

export const FotoPerfilCard: React.FC<FotoPerfilCardProps> = ({ perfil, onAtualizado }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { enviar, remover, isEnviando, isRemovendo } = useFotoPerfil(onAtualizado)
  const ocupado = isEnviando || isRemovendo

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 p-6 bg-white rounded-[24px] shadow-sm border border-zinc-100">
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center">
          {perfil.foto_url ? (
            <img src={perfil.foto_url} alt={perfil.nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-indigo-600">{iniciais(perfil.nome)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={ocupado}
          aria-label="Trocar foto"
          className="absolute -bottom-1 -right-1 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 disabled:opacity-60 hover:cursor-pointer"
        >
          {isEnviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={FOTO_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            enviar(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h2 className="text-lg font-bold text-zinc-900 truncate">{perfil.nome}</h2>
        <p className="text-sm text-zinc-500 truncate">{perfil.email}</p>
        <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase">
          {PAPEIS[perfil.role] ?? perfil.role}
        </span>
      </div>

      <div className="flex sm:flex-col gap-2 shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={ocupado}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-60 hover:cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          {perfil.foto_url ? 'Trocar foto' : 'Enviar foto'}
        </button>
        {perfil.foto_url && (
          <button
            type="button"
            onClick={remover}
            disabled={ocupado}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-60 hover:cursor-pointer"
          >
            {isRemovendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Remover
          </button>
        )}
      </div>
    </div>
  )
}
