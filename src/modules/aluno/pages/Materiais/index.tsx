import React, { useState } from 'react'
import { Download, ExternalLink, FileText, Film, FolderOpen, Image, Link2, Loader2, Music } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import type { MaterialDoAluno } from '../../types'
import { useMateriais } from './hooks/useMateriais'

function Icone({ material }: { material: MaterialDoAluno }) {
  const classe = 'h-5 w-5'
  const tipo = material.file_type ?? ''
  if (material.tipo === 'link') return <Link2 className={classe} />
  if (tipo.startsWith('image/')) return <Image className={classe} />
  if (tipo.startsWith('audio/')) return <Music className={classe} />
  if (tipo.startsWith('video/')) return <Film className={classe} />
  return <FileText className={classe} />
}

function agrupar(materiais: MaterialDoAluno[]) {
  const grupos: { turma: MaterialDoAluno['turma']; materiais: MaterialDoAluno[] }[] = []

  for (const material of materiais) {
    const grupo = grupos.find((item) => item.turma.id === material.turma.id)
    if (grupo) grupo.materiais.push(material)
    else grupos.push({ turma: material.turma, materiais: [material] })
  }

  return grupos
}

function MaterialLinha({ material }: { material: MaterialDoAluno }) {
  const destino = material.tipo === 'link' ? material.link : material.file_url
  const arquivo = material.tipo === 'arquivo'

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icone material={material} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-zinc-900">{material.titulo}</p>
        {material.descricao && <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{material.descricao}</p>}
      </div>
      {destino && (
        <a
          href={destino}
          target="_blank"
          rel="noopener noreferrer"
          download={arquivo ? true : undefined}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-zinc-50 px-3 text-xs font-bold text-zinc-600 ring-1 ring-zinc-200"
        >
          {arquivo ? <Download className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
          {arquivo ? 'Baixar' : 'Abrir'}
        </a>
      )}
    </li>
  )
}

export const MateriaisPage: React.FC = () => {
  const { materiais, isLoading, aguardandoDependente, offline, doCache } = useMateriais()
  const [idTurma, setIdTurma] = useState<number | null>(null)
  const somenteLeitura = offline || doCache

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Materiais</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver os materiais dele.</p>
      </section>
    )
  }

  const turmas = agrupar(materiais).map((grupo) => grupo.turma)
  const visiveis = idTurma === null ? materiais : materiais.filter((material) => material.turma.id === idTurma)
  const grupos = agrupar(visiveis)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Materiais</h1>
        <p className="mt-1 text-sm text-zinc-500">Apostilas, partituras e links publicados para as suas turmas.</p>
        {somenteLeitura && (
          <p className="mt-1 text-xs font-semibold text-amber-700">Somente leitura (lista em cache). Downloads dependem da rede.</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : materiais.length === 0 ? (
        <NoData
          title="Nenhum material"
          description="Quando o professor publicar um arquivo ou um link, ele aparece aqui."
          icon={<FolderOpen className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <>
          {turmas.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setIdTurma(null)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  idTurma === null ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                }`}
              >
                Todas
              </button>
              {turmas.map((turma) => (
                <button
                  key={turma.id}
                  type="button"
                  onClick={() => setIdTurma(turma.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    idTurma === turma.id ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                  }`}
                >
                  {turma.nome}
                </button>
              ))}
            </div>
          )}
          {grupos.map((grupo) => (
            <section key={grupo.turma.id} className="rounded-2xl border border-zinc-200 bg-white px-4">
              <header className="border-b border-zinc-100 py-3">
                <h2 className="text-base font-bold text-zinc-900">{grupo.turma.nome}</h2>
                {grupo.turma.curso && grupo.turma.curso !== grupo.turma.nome && (
                  <p className="text-sm text-zinc-500">{grupo.turma.curso}</p>
                )}
              </header>
              <ul className="divide-y divide-zinc-100">
                {grupo.materiais.map((material) => (
                  <MaterialLinha key={material.id} material={material} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
