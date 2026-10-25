import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { concluirAula, getAula } from '../../../api/aulas'
import type { AulaDoProfessor, PresencaStatus } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export interface AlunoDaChamada {
  id: number
  nome: string
}

const alunosDaAula = (aula: AulaDoProfessor): AlunoDaChamada[] => {
  if (aula.aluno_especifico) {
    return [{ id: aula.aluno_especifico.id, nome: aula.aluno_especifico.usuario.nome }]
  }

  return (aula.turma?.matriculas ?? [])
    .filter((m) => m.aluno)
    .map((m) => ({ id: m.aluno!.id, nome: m.aluno!.usuario.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

interface RascunhoChamada {
  marcacoes: Record<number, PresencaStatus>
  observacoes: Record<number, string>
  conteudo: string
}

/** Preserva a chamada em andamento enquanto o professor consulta a ficha de um aluno. */
const chaveRascunho = (idAula: number) => `chamada-rascunho:${idAula}`

const consumirRascunho = (idAula: number): RascunhoChamada | null => {
  const chave = chaveRascunho(idAula)
  const salvo = sessionStorage.getItem(chave)
  sessionStorage.removeItem(chave)

  try {
    return salvo ? (JSON.parse(salvo) as RascunhoChamada) : null
  } catch {
    return null
  }
}

const hojeIso = () => {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}

export const useChamada = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [aula, setAula] = useState<AulaDoProfessor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [marcacoes, setMarcacoes] = useState<Record<number, PresencaStatus>>({})
  const [observacoes, setObservacoes] = useState<Record<number, string>>({})
  const [conteudo, setConteudo] = useState('')

  const aplicarAula = useCallback((dados: AulaDoProfessor) => {
    setAula(dados)
    setConteudo(dados.conteudo_dado ?? '')
    setMarcacoes(Object.fromEntries((dados.presencas ?? []).map((p) => [p.id_aluno, p.status])))
    setObservacoes(Object.fromEntries((dados.presencas ?? []).map((p) => [p.id_aluno, p.observacao ?? ''])))
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getAula(id)
      .then((dados) => {
        if (cancelled) return
        aplicarAula(dados)

        const rascunho = consumirRascunho(dados.id)
        if (rascunho && dados.status === 'agendada') {
          setMarcacoes(rascunho.marcacoes)
          setObservacoes(rascunho.observacoes)
          setConteudo(rascunho.conteudo)
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar a aula.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, aplicarAula])

  const alunos = useMemo(() => (aula ? alunosDaAula(aula) : []), [aula])

  const bloqueio = useMemo(() => {
    if (!aula) return null
    if (aula.status === 'concluida') return 'Aula concluída. Somente administradores podem alterar a chamada.'
    if (aula.status === 'cancelada') return 'Aula cancelada. Não há chamada a registrar.'
    if (aula.data > hojeIso()) return 'Esta aula ainda não aconteceu. A chamada fica disponível no dia da aula.'
    if (aula.turma && ['concluida', 'cancelada'].includes(aula.turma.status)) return 'A turma está encerrada.'
    return null
  }, [aula])

  const totalMarcados = alunos.filter((a) => marcacoes[a.id]).length
  const contagem = useMemo(() => {
    const valores = alunos.map((a) => marcacoes[a.id]).filter(Boolean)
    return {
      presente: valores.filter((s) => s === 'presente').length,
      ausente: valores.filter((s) => s === 'ausente').length,
      justificado: valores.filter((s) => s === 'justificado').length,
    }
  }, [alunos, marcacoes])

  const marcar = (idAluno: number, status: PresencaStatus) =>
    setMarcacoes((atual) => ({ ...atual, [idAluno]: status }))

  const marcarTodosPresentes = () =>
    setMarcacoes((atual) => ({ ...atual, ...Object.fromEntries(alunos.map((a) => [a.id, 'presente' as const])) }))

  const alterarObservacao = (idAluno: number, texto: string) =>
    setObservacoes((atual) => ({ ...atual, [idAluno]: texto }))

  const recarregar = () => {
    if (!id) return
    getAula(id)
      .then(aplicarAula)
      .catch((err) => toast.error(getErrorMessage(err, 'Não foi possível atualizar a aula.')))
  }

  const voltar = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate('/professor/inicio')
  }

  const abrirFicha = (idAluno: number) => {
    if (!aula) return
    if (!bloqueio) {
      const rascunho: RascunhoChamada = { marcacoes, observacoes, conteudo }
      sessionStorage.setItem(chaveRascunho(aula.id), JSON.stringify(rascunho))
    }
    navigate(`/professor/alunos/${idAluno}${aula.id_turma ? `?turma=${aula.id_turma}` : ''}`)
  }

  const concluir = async () => {
    if (!aula || bloqueio || totalMarcados < alunos.length) return

    setIsSaving(true)
    try {
      const { message, data } = await concluirAula(aula.id, {
        conteudo_dado: conteudo.trim() || null,
        presencas: alunos.map((a) => ({
          id_aluno: a.id,
          status: marcacoes[a.id],
          observacao: observacoes[a.id]?.trim() || null,
        })),
      })
      toast.success(message)
      aplicarAula(data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível concluir a aula.'))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    aula,
    alunos,
    isLoading,
    isSaving,
    bloqueio,
    marcacoes,
    observacoes,
    conteudo,
    setConteudo,
    contagem,
    totalMarcados,
    marcar,
    marcarTodosPresentes,
    alterarObservacao,
    concluir,
    voltar,
    abrirFicha,
    recarregar,
  }
}
