import React from 'react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { FichaAluno } from '../../../types'

const somenteDigitos = (valor: string) => valor.replace(/\D/g, '')

const linkWhatsapp = (numero: string) => {
  const digitos = somenteDigitos(numero)
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`
}

const CONTATO_CLASSE =
  'inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-indigo-200 hover:text-indigo-600'

export const CabecalhoAluno: React.FC<{ aluno: FichaAluno['aluno'] }> = ({ aluno }) => {
  const nome = aluno.nome ?? 'Aluno'

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        {aluno.foto_url ? (
          <img src={aluno.foto_url} alt={nome} className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl font-black text-indigo-600 shrink-0">
            {nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 truncate">{nome}</h1>
          {aluno.idade !== null && <p className="text-sm text-zinc-500">{aluno.idade} anos</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {aluno.telefone && (
          <a href={`tel:${somenteDigitos(aluno.telefone)}`} className={CONTATO_CLASSE}>
            <Phone className="w-3.5 h-3.5" />
            {aluno.telefone}
          </a>
        )}
        {aluno.whatsapp && (
          <a href={linkWhatsapp(aluno.whatsapp)} target="_blank" rel="noreferrer" className={CONTATO_CLASSE}>
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        )}
        {aluno.email && (
          <a href={`mailto:${aluno.email}`} className={`${CONTATO_CLASSE} max-w-full`}>
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{aluno.email}</span>
          </a>
        )}
      </div>

      {aluno.responsaveis.length > 0 && (
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Responsáveis</p>
          {aluno.responsaveis.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-700 min-w-0 truncate">
                <span className="font-semibold">{r.nome ?? 'Responsável'}</span>
                {r.parentesco && <span className="text-zinc-400"> · {r.parentesco}</span>}
              </p>
              <div className="flex gap-1.5 shrink-0">
                {r.telefone && (
                  <a href={`tel:${somenteDigitos(r.telefone)}`} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500" aria-label={`Ligar para ${r.nome}`}>
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {r.whatsapp && (
                  <a href={linkWhatsapp(r.whatsapp)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-zinc-100 text-emerald-600" aria-label={`WhatsApp de ${r.nome}`}>
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
