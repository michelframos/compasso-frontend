import React, { useCallback, useEffect, useState } from 'react'
import { Gift, Loader2, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  gerarIngressos,
  listarIngressos,
  marcarCortesia,
} from '@/modules/bilheteria/api/ingressos'
import type { Ingresso } from '@/modules/bilheteria/types'
import type { Espetaculo } from '../types'

interface Props {
  espetaculo: Espetaculo | null
}

export const EspetaculoIngressos: React.FC<Props> = ({ espetaculo }) => {
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState('10')
  const [gerando, setGerando] = useState(false)

  const carregar = useCallback(async () => {
    if (!espetaculo?.id) return
    setLoading(true)
    try {
      const res = await listarIngressos({ id_espetaculo: espetaculo.id, per_page: 200 })
      setIngressos(res.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar ingressos.'))
    } finally {
      setLoading(false)
    }
  }, [espetaculo?.id])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const handleGerar = async () => {
    if (!espetaculo?.id) return
    setGerando(true)
    try {
      await gerarIngressos(espetaculo.id, {
        quantidade: Number(quantidade) || 1,
        valor: espetaculo.valor_ingresso_padrao ?? undefined,
        id_template_ingresso: espetaculo.id_template_ingresso ?? undefined,
      })
      toast.success('Ingressos gerados.')
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao gerar ingressos.'))
    } finally {
      setGerando(false)
    }
  }

  const handleCortesia = async (ingresso: Ingresso) => {
    try {
      await marcarCortesia(ingresso.id)
      toast.success(`Ingresso ${ingresso.numero} marcado como cortesia.`)
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao marcar cortesia.'))
    }
  }

  if (!espetaculo) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-500">Quantidade a gerar</label>
          <Input
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-28 h-9 rounded-xl"
          />
        </div>
        <Button
          type="button"
          onClick={handleGerar}
          disabled={gerando}
          className="bg-indigo-600 hover:bg-indigo-700 h-9 rounded-full"
        >
          {gerando ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Ticket className="h-4 w-4 mr-1" />}
          Gerar ingressos
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-100">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nº</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Pagamento</th>
                <th className="px-3 py-2 font-medium">Valor</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {ingressos.map((ing) => (
                <tr key={ing.id} className="border-t border-zinc-50">
                  <td className="px-3 py-2 font-mono">{ing.numero}</td>
                  <td className="px-3 py-2">{ing.status_rotulo}</td>
                  <td className="px-3 py-2">{ing.status_pagamento ?? '—'}</td>
                  <td className="px-3 py-2">
                    {Number(ing.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-2">
                    {ing.status === 'disponivel' && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => handleCortesia(ing)}>
                        <Gift className="h-3.5 w-3.5 mr-1" />
                        Cortesia
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {ingressos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-zinc-400">
                    Nenhum ingresso gerado para este espetáculo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
