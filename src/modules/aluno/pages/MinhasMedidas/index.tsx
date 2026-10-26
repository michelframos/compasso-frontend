import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { MedidaDoAluno } from '../../types'
import { useMinhasMedidas } from './hooks/useMinhasMedidas'

const CAMPOS: { chave: keyof Pick<MedidaDoAluno, 'medida_torax' | 'medida_cintura' | 'medida_quadril' | 'medida_altura'>; label: string }[] = [
  { chave: 'medida_altura', label: 'Altura' },
  { chave: 'medida_torax', label: 'Tórax' },
  { chave: 'medida_cintura', label: 'Cintura' },
  { chave: 'medida_quadril', label: 'Quadril' },
]

function texto(valor: number | null) {
  return valor === null ? '' : String(valor)
}

export const MinhasMedidasPage: React.FC = () => {
  const { medidas, podeEditar, isLoading, salvando, aguardandoDependente, salvar } = useMinhasMedidas()
  const atual = medidas[0] ?? null
  const [valores, setValores] = useState({ medida_torax: '', medida_cintura: '', medida_quadril: '', medida_altura: '' })

  useEffect(() => {
    if (!atual) return
    setValores({
      medida_torax: texto(atual.medida_torax),
      medida_cintura: texto(atual.medida_cintura),
      medida_quadril: texto(atual.medida_quadril),
      medida_altura: texto(atual.medida_altura),
    })
  }, [atual])

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Medidas</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver as medidas dele.</p>
      </section>
    )
  }

  const enviar = (event: React.FormEvent) => {
    event.preventDefault()
    const numero = (valor: string) => (valor.trim() === '' ? null : Number(valor.replace(',', '.')))
    void salvar({
      medida_torax: numero(valores.medida_torax),
      medida_cintura: numero(valores.medida_cintura),
      medida_quadril: numero(valores.medida_quadril),
      medida_altura: numero(valores.medida_altura),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Medidas</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {podeEditar
            ? 'Você pode corrigir as medidas usadas no figurino.'
            : 'A secretaria atualiza as medidas usadas no figurino.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : !atual ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
          A secretaria ainda não cadastrou as medidas.
        </section>
      ) : (
        <form onSubmit={enviar} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            {CAMPOS.map((campo) => (
              <div key={campo.chave} className="space-y-1.5">
                <Label htmlFor={campo.chave}>{campo.label} (cm)</Label>
                <Input
                  id={campo.chave}
                  inputMode="decimal"
                  disabled={!podeEditar}
                  value={valores[campo.chave]}
                  onChange={(event) => setValores((atualValores) => ({ ...atualValores, [campo.chave]: event.target.value }))}
                />
              </div>
            ))}
          </div>
          {podeEditar && (
            <Button type="submit" disabled={salvando} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
              {salvando ? 'Salvando...' : 'Salvar medidas'}
            </Button>
          )}
        </form>
      )}
    </div>
  )
}
