import React from 'react'
import { format } from 'date-fns'
import { CalendarClock, ChevronRight, Mail, MessageCircle, Users } from 'lucide-react'
import { CANAL_AVISO, ORIGEM_AVISO, PUBLICO_AVISO } from '../../constants'
import type { AvisoTurma } from '../../types'

interface AvisoCardProps {
  aviso: AvisoTurma
  mostrarAutor?: boolean
  onAbrir: (aviso: AvisoTurma) => void
}

export const AvisoCard: React.FC<AvisoCardProps> = ({ aviso, mostrarAutor = false, onAbrir }) => {
  const totais = aviso.totais
  const automatico = aviso.origem === 'aula_alterada'
  const exibirAutor = mostrarAutor || (aviso.autor.role !== null && aviso.autor.role !== 'professor')

  return (
    <button
      type="button"
      onClick={() => onAbrir(aviso)}
      className="w-full text-left p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-3 hover:border-indigo-200 hover:shadow-md transition-all hover:cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              automatico ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}
          >
            {automatico && <CalendarClock className="inline w-3 h-3 mr-1 -mt-0.5" />}
            {ORIGEM_AVISO[aviso.origem]}
          </span>
          <span className="text-xs font-bold text-zinc-500">{aviso.turma?.nome ?? 'Alunos escolhidos'}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
      </div>

      <div>
        <p className="font-bold text-zinc-900">{aviso.titulo}</p>
        <p className="text-sm text-zinc-600 line-clamp-2 whitespace-pre-line break-words mt-1">{aviso.mensagem}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {totais?.alunos ?? 0} aluno(s) · {PUBLICO_AVISO[aviso.publico].label.toLowerCase()}
        </span>
        <span className="flex items-center gap-1">
          {aviso.canais.includes('email') && <Mail className="w-3.5 h-3.5" />}
          {aviso.canais.includes('whatsapp') && <MessageCircle className="w-3.5 h-3.5" />}
          {aviso.canais.map((c) => CANAL_AVISO[c]).join(' + ')}
        </span>
      </div>

      {totais && (
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{totais.enviados} enviado(s)</span>
          {totais.pendentes > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{totais.pendentes} na fila</span>}
          {totais.erros > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">{totais.erros} falha(s)</span>}
          {totais.sem_contato > 0 && <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{totais.sem_contato} sem contato</span>}
        </div>
      )}

      <p className="text-[11px] text-zinc-400">
        {aviso.enviado_em && `Enviado em ${format(new Date(aviso.enviado_em), "dd/MM 'às' HH:mm")}`}
        {exibirAutor && aviso.autor.nome && ` por ${aviso.autor.nome}`}
      </p>
    </button>
  )
}
