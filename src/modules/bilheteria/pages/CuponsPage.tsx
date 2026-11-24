import React, { useEffect, useState } from 'react'
import { Loader2, Percent, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { atualizarCupom, criarCupom, excluirCupom, listarCupons } from '../api/cupons'
import type { CupomIngresso } from '../types'
import { EmptyState, LoadingBlock, PageHeader } from '../components/ui'

export const CuponsPage: React.FC = () => {
  const [cupons, setCupons] = useState<CupomIngresso[]>([])
  const [loading, setLoading] = useState(true)
  const [codigo, setCodigo] = useState('')
  const [tipo, setTipo] = useState<'percentual' | 'valor_fixo'>('percentual')
  const [valor, setValor] = useState('10')
  const [criando, setCriando] = useState(false)

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await listarCupons()
      setCupons(res.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao listar cupons.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregar()
  }, [])

  const handleCriar = async () => {
    if (!codigo.trim()) {
      toast.error('Informe o código do cupom.')
      return
    }
    setCriando(true)
    try {
      await criarCupom({ codigo: codigo.trim(), tipo, valor: Number(valor), ativo: true })
      toast.success('Cupom criado.')
      setCodigo('')
      setValor('10')
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar cupom.'))
    } finally {
      setCriando(false)
    }
  }

  const toggleAtivo = async (cupom: CupomIngresso) => {
    try {
      await atualizarCupom(cupom.id, { ativo: !cupom.ativo })
      toast.success(cupom.ativo ? 'Cupom desativado.' : 'Cupom ativado.')
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao atualizar.'))
    }
  }

  const handleExcluir = async (id: number) => {
    if (!confirm('Excluir este cupom? Esta ação não pode ser desfeita.')) return
    try {
      await excluirCupom(id)
      toast.success('Cupom excluído.')
      await carregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao excluir.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cupons de"
        highlight="Desconto"
        description="Crie códigos percentuais ou de valor fixo para usar na venda."
      />

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="mb-4 text-sm font-bold text-zinc-900">Novo cupom</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-zinc-500">Código</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="EX: PROMO10"
                className="h-10 rounded-xl uppercase"
              />
            </div>
            <div className="space-y-1.5 md:w-44">
              <Label className="text-xs text-zinc-500">Tipo</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'percentual' | 'valor_fixo')}
              >
                <option value="percentual">Percentual (%)</option>
                <option value="valor_fixo">Valor fixo (R$)</option>
              </select>
            </div>
            <div className="space-y-1.5 md:w-28">
              <Label className="text-xs text-zinc-500">Valor</Label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <Button
              onClick={handleCriar}
              disabled={criando}
              className="h-10 rounded-full bg-indigo-600 px-5 font-bold hover:bg-indigo-700"
            >
              {criando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Criar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingBlock />
      ) : cupons.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="Nenhum cupom cadastrado"
          description="Crie o primeiro cupom para oferecer descontos na bilheteria."
        />
      ) : (
        <Card className="overflow-hidden border-none bg-white shadow-sm">
          <CardContent className="divide-y divide-zinc-100 p-0">
            {cupons.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-base font-bold text-zinc-900">{c.codigo}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        c.ativo
                          ? 'border-indigo-100 bg-indigo-50 text-indigo-700'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {c.tipo === 'percentual' ? `${c.valor}% de desconto` : `R$ ${Number(c.valor).toFixed(2)} de desconto`}
                    {' · '}
                    {c.usos} uso{c.usos === 1 ? '' : 's'}
                    {c.uso_maximo != null ? ` de ${c.uso_maximo}` : ''}
                    {c.espetaculo ? ` · ${c.espetaculo.titulo}` : ' · Todos os espetáculos'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAtivo(c)}
                    className="h-8 rounded-full px-3 text-xs font-bold"
                  >
                    {c.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExcluir(c.id)}
                    className="h-8 rounded-full px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
