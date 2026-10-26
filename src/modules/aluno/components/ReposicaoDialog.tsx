import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarOpcoesReposicao, solicitarReposicao } from '../api/reposicoes'
import { useAlunoAtivo } from '../hooks/useAlunoAtivo'
import type { AulaReposicao, RegrasReposicao } from '../types'

interface ReposicaoDialogProps {
  aberto: boolean
  idAula: number | null
  titulo: string
  regras: RegrasReposicao
  onFechar: () => void
  onEnviada: () => void
}

function textoRegras(regras: RegrasReposicao) {
  const partes: string[] = []
  if (regras.limite_periodo !== null) {
    partes.push(`${regras.usados_no_periodo} de ${regras.limite_periodo} pedidos neste mês`)
  }
  if (regras.prazo_dias !== null) {
    partes.push(`até ${regras.prazo_dias} ${regras.prazo_dias === 1 ? 'dia' : 'dias'} depois da falta`)
  }
  return partes.join(' · ')
}

function rotuloAula(aula: AulaReposicao) {
  const data = format(new Date(`${aula.data}T00:00:00`), "d 'de' MMM", { locale: ptBR })
  return `${data} · ${aula.hora_inicio}–${aula.hora_termino}${aula.turma ? ` · ${aula.turma}` : ''}`
}

export const ReposicaoDialog: React.FC<ReposicaoDialogProps> = ({
  aberto,
  idAula,
  titulo,
  regras,
  onFechar,
  onEnviada,
}) => {
  const { params } = useAlunoAtivo()
  const [motivo, setMotivo] = useState('')
  const [destino, setDestino] = useState('')
  const [opcoes, setOpcoes] = useState<AulaReposicao[]>([])
  const [enviando, setEnviando] = useState(false)
  const aviso = textoRegras(regras)

  const fechar = () => {
    setMotivo('')
    setDestino('')
    setOpcoes([])
    onFechar()
  }

  useEffect(() => {
    if (!aberto || !idAula) return
    let ativo = true
    listarOpcoesReposicao(idAula, params.id_aluno)
      .then((lista) => {
        if (ativo) setOpcoes(lista)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as aulas disponíveis.'))
      })
    return () => {
      ativo = false
    }
  }, [aberto, idAula, params.id_aluno])

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!idAula) return

    setEnviando(true)
    try {
      await solicitarReposicao({
        idAulaPerdida: idAula,
        idAulaDestino: destino === '' ? null : Number(destino),
        motivo,
        idAluno: params.id_aluno,
      })
      toast.success('Pedido de reposição enviado.')
      fechar()
      onEnviada()
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível enviar o pedido.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(estaAberto) => !estaAberto && fechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pedir reposição</DialogTitle>
          <DialogDescription>
            {titulo}
            {aviso ? ` · ${aviso}` : ''}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void enviar(event)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="motivo-reposicao">Motivo</Label>
            <Textarea
              id="motivo-reposicao"
              required
              maxLength={2000}
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Por que você quer repor esta aula?"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="destino-reposicao">Aula para repor</Label>
            <select
              id="destino-reposicao"
              value={destino}
              onChange={(event) => setDestino(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800"
            >
              <option value="">A escola escolhe</option>
              {opcoes.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  {rotuloAula(aula)}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={enviando || motivo.trim() === ''} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
            {enviando ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
