import React, { useEffect, useState } from 'react'
import { Loader2, Ruler } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useAlunoMedidas } from '../hooks/useAlunoMedidas'

const CAMPOS = [
  { chave: 'medida_altura', label: 'Altura' },
  { chave: 'medida_torax', label: 'Tórax' },
  { chave: 'medida_cintura', label: 'Cintura' },
  { chave: 'medida_quadril', label: 'Quadril' },
] as const

type Valores = Record<(typeof CAMPOS)[number]['chave'], string>

function texto(valor: number | null | undefined) {
  return valor === null || valor === undefined ? '' : String(valor)
}

interface AlunoMedidasProps {
  alunoId: number | undefined
}

export const AlunoMedidas: React.FC<AlunoMedidasProps> = ({ alunoId }) => {
  const { medida, isLoading, salvando, salvar } = useAlunoMedidas(alunoId)
  const [valores, setValores] = useState<Valores>({
    medida_altura: '',
    medida_torax: '',
    medida_cintura: '',
    medida_quadril: '',
  })
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setValores({
      medida_altura: texto(medida?.medida_altura),
      medida_torax: texto(medida?.medida_torax),
      medida_cintura: texto(medida?.medida_cintura),
      medida_quadril: texto(medida?.medida_quadril),
    })
    setErro(null)
  }, [medida])

  if (!alunoId) {
    return (
      <p className="text-sm text-zinc-500">
        Salve o aluno primeiro para cadastrar as medidas.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando medidas...
      </div>
    )
  }

  const enviar = (event: React.FormEvent) => {
    event.preventDefault()
    const numero = (valor: string) => {
      const limpo = valor.trim().replace(',', '.')
      if (limpo === '') return null
      const parseado = Number(limpo)
      return Number.isFinite(parseado) ? parseado : NaN
    }

    const medida_altura = numero(valores.medida_altura)
    const medida_torax = numero(valores.medida_torax)
    const medida_cintura = numero(valores.medida_cintura)
    const medida_quadril = numero(valores.medida_quadril)

    if (
      medida_altura === null ||
      medida_torax === null ||
      medida_cintura === null ||
      medida_quadril === null
    ) {
      setErro('Preencha altura, tórax, cintura e quadril.')
      return
    }

    if ([medida_altura, medida_torax, medida_cintura, medida_quadril].some((v) => Number.isNaN(v))) {
      setErro('Informe apenas números válidos em centímetros.')
      return
    }

    setErro(null)
    void salvar({ medida_altura, medida_torax, medida_cintura, medida_quadril })
  }

  return (
    <form onSubmit={enviar} className="space-y-6 max-w-xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-indigo-50 p-2 text-indigo-600">
          <Ruler className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900">Medidas de figurino</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {medida
              ? 'Atualize as medidas usadas no figurino deste aluno.'
              : 'Cadastre as medidas usadas no figurino. Elas aparecem no painel do aluno.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPOS.map((campo) => (
          <div key={campo.chave} className="space-y-2">
            <Label htmlFor={campo.chave} className="font-medium ml-1 text-zinc-700">
              {campo.label} (cm) *
            </Label>
            <Input
              id={campo.chave}
              inputMode="decimal"
              value={valores[campo.chave]}
              onChange={(event) =>
                setValores((atuais) => ({ ...atuais, [campo.chave]: event.target.value }))
              }
              placeholder="0"
              className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
            />
          </div>
        ))}
      </div>

      {erro && <p className="text-sm text-rose-500">{erro}</p>}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={salvando}
          className="rounded-full px-6 h-9 font-bold bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer"
        >
          {salvando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : medida ? (
            'Atualizar medidas'
          ) : (
            'Salvar medidas'
          )}
        </Button>
      </div>
    </form>
  )
}
