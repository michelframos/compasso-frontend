import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import api from '@/shared/lib/axios'
import { emitirCertificado, listarCertificadosStaff, type CertificadoStaff } from '../../../api/certificados'

interface MatriculaOpcao {
  id: number
  status: string | null
  aluno?: { id: number; usuario?: { nome?: string } | null; nome?: string } | null
  turma?: { descricao?: string | null; curso?: { nome?: string } | null } | null
  curso?: { nome?: string } | null
}

export function useCertificados() {
  const [certificados, setCertificados] = useState<CertificadoStaff[]>([])
  const [matriculas, setMatriculas] = useState<MatriculaOpcao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [emitindoId, setEmitindoId] = useState<number | null>(null)

  const carregar = useCallback(() => {
    let ativo = true
    setIsLoading(true)
    Promise.all([
      listarCertificadosStaff(),
      api.get('/matriculas', { params: { status: 'completada', sort_by: 'id', sort_order: 'desc' } }),
    ])
      .then(([lista, matriculasRes]) => {
        if (!ativo) return
        setCertificados(lista)
        const payload = matriculasRes.data
        setMatriculas(payload.data ?? payload)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar os certificados.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => carregar(), [carregar])

  const emitidas = new Set(certificados.map((item) => item.id_matricula))
  const elegiveis = matriculas.filter((item) => item.status === 'completada' && !emitidas.has(item.id))

  const emitir = async (idMatricula: number) => {
    setEmitindoId(idMatricula)
    try {
      const criado = await emitirCertificado(idMatricula)
      setCertificados((atual) => [criado, ...atual])
      toast.success('Certificado emitido.')
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível emitir o certificado.'))
    } finally {
      setEmitindoId(null)
    }
  }

  return { certificados, elegiveis, isLoading, emitindoId, emitir }
}
