import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { getErrorMessage } from '@/shared/lib/utils'
import { registrarJustificativa } from '../api/justificativas'
import { useAlunoAtivo } from '../hooks/useAlunoAtivo'

interface JustificativaDialogProps {
  aberto: boolean
  tipo: 'aviso_previo' | 'justificativa'
  idAula: number | null
  titulo: string
  onFechar: () => void
  onEnviada: () => void
}

export const JustificativaDialog: React.FC<JustificativaDialogProps> = ({
  aberto,
  tipo,
  idAula,
  titulo,
  onFechar,
  onEnviada,
}) => {
  const { params } = useAlunoAtivo()
  const [motivo, setMotivo] = useState('')
  const [anexo, setAnexo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const aviso = tipo === 'aviso_previo'

  const fechar = () => {
    setMotivo('')
    setAnexo(null)
    onFechar()
  }

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!idAula) return

    setEnviando(true)
    try {
      await registrarJustificativa({
        idAula,
        tipo,
        motivo,
        anexo,
        idAluno: params.id_aluno,
      })
      toast.success(aviso ? 'Ausência avisada.' : 'Justificativa enviada.')
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
          <DialogTitle>{aviso ? 'Avisar ausência' : 'Justificar falta'}</DialogTitle>
          <DialogDescription>{titulo}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void enviar(event)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="motivo-falta">Motivo</Label>
            <Textarea
              id="motivo-falta"
              required
              maxLength={2000}
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder={aviso ? 'Por que você não poderá ir?' : 'O que aconteceu nesta aula?'}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="anexo-falta">Anexo (opcional)</Label>
            <input
              id="anexo-falta"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="block w-full text-sm text-zinc-600"
              onChange={(event) => setAnexo(event.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={enviando || motivo.trim() === ''} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
            {enviando ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
