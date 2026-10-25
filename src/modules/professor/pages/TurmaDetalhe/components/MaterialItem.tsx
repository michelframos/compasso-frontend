import React from 'react'
import { EyeOff, ExternalLink, FileText, Film, Image, Link2, Music, Pencil, Trash2 } from 'lucide-react'
import type { MaterialDaTurma } from '../../../types'

interface MaterialItemProps {
  material: MaterialDaTurma
  onEditar: (material: MaterialDaTurma) => void
  onExcluir: (material: MaterialDaTurma) => void
}

const IconeMaterial: React.FC<{ material: MaterialDaTurma }> = ({ material }) => {
  const classe = 'w-5 h-5'
  const tipo = material.file_type ?? ''

  if (material.tipo === 'link') return <Link2 className={classe} />
  if (tipo.startsWith('image/')) return <Image className={classe} />
  if (tipo.startsWith('audio/')) return <Music className={classe} />
  if (tipo.startsWith('video/')) return <Film className={classe} />
  return <FileText className={classe} />
}

const botaoAcao = 'shrink-0 inline-flex items-center justify-center gap-1.5 h-9 min-w-9 px-2.5 rounded-full border text-xs font-bold transition-colors hover:cursor-pointer'

export const MaterialItem: React.FC<MaterialItemProps> = ({ material, onEditar, onExcluir }) => {
  const destino = material.link ?? material.file_url

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
          <IconeMaterial material={material} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-zinc-900 break-words">{material.titulo}</p>
            {!material.publico && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase">
                <EyeOff className="w-3 h-3" />
                Oculto
              </span>
            )}
          </div>
          {material.descricao && <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{material.descricao}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {destino && (
          <a
            href={destino}
            target="_blank"
            rel="noopener noreferrer"
            className={`${botaoAcao} bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir
          </a>
        )}
        <button
          type="button"
          onClick={() => onEditar(material)}
          aria-label={`Editar ${material.titulo}`}
          className={`${botaoAcao} bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100`}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editar</span>
        </button>
        <button
          type="button"
          onClick={() => onExcluir(material)}
          aria-label={`Excluir ${material.titulo}`}
          className={`${botaoAcao} bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>
    </div>
  )
}
