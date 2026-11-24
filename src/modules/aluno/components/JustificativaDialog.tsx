import React, { useState } from 'react'
import { toast } from 'sonner'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
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

  const enviar = async () => {
    if (!idAula || motivo.trim() === '') return

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
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && fechar()}
      onClose={fechar}
      onConfirm={() => void enviar()}
      isLoading={enviando}
      firsChunkTitle={aviso ? 'Avisar' : 'Justificar'}
      secondChunkTitle={aviso ? 'ausência' : 'falta'}
      colorSecondChunkTitle="text-indigo-600"
      titleDescription={titulo}
      textConfirmButton={enviando ? 'Enviando...' : 'Enviar'}
      loadingText="Enviando..."
    >
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="motivo-falta" className="text-zinc-700 font-medium ml-1">Motivo</Label>
          <Textarea
            id="motivo-falta"
            required
            maxLength={2000}
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            placeholder={aviso ? 'Por que você não poderá ir?' : 'O que aconteceu nesta aula?'}
            className="rounded-xl min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="anexo-falta" className="text-zinc-700 font-medium ml-1">Anexo (opcional)</Label>
          <input
            id="anexo-falta"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="block w-full text-sm text-zinc-600"
            onChange={(event) => setAnexo(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </CustomModalGlobal>
  )
}
