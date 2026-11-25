import React, { useEffect, useState } from 'react'
import { Loader2, Percent, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/shared/lib/axios'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { atualizarCupom, criarCupom, excluirCupom, listarCupons } from '../api/cupons'
import type { CupomIngresso } from '../types'
import { EmptyState, LoadingBlock, PageHeader } from '../components/ui'

type EspetaculoOpcao = { id: number; titulo: string }

function formatarValidade(cupom: CupomIngresso): string {
  if (!cupom.valido_de && !cupom.valido_ate) return 'Sem prazo de validade'
  if (cupom.valido_de && cupom.valido_ate) return `Válido de ${cupom.valido_de} até ${cupom.valido_ate}`
  if (cupom.valido_de) return `Válido a partir de ${cupom.valido_de}`
  return `Válido até ${cupom.valido_ate}`
}

function formatarEspetaculos(cupom: CupomIngresso): string {
  const lista = cupom.espetaculos ?? []
  if (lista.length === 0) return 'Todos os espetáculos'
  if (lista.length === 1) return lista[0].titulo
  if (lista.length <= 3) return lista.map((e) => e.titulo).join(', ')
  return `${lista.slice(0, 2).map((e) => e.titulo).join(', ')} e mais ${lista.length - 2}`
}

export const CuponsPage: React.FC = () => {
  const [cupons, setCupons] = useState<CupomIngresso[]>([])
  const [espetaculos, setEspetaculos] = useState<EspetaculoOpcao[]>([])
  const [loading, setLoading] = useState(true)
  const [codigo, setCodigo] = useState('')
  const [tipo, setTipo] = useState<'percentual' | 'valor_fixo'>('percentual')
  const [valor, setValor] = useState('10')
  const [usoMaximo, setUsoMaximo] = useState('')
  const [validoDe, setValidoDe] = useState('')
  const [validoAte, setValidoAte] = useState('')
  const [idsEspetaculos, setIdsEspetaculos] = useState<number[]>([])
  const [criando, setCriando] = useState(false)

  const carregar = async () => {
    setLoading(true)
    try {
      const [cuponsRes, espetaculosRes] = await Promise.all([
        listarCupons(),
        api.get('/espetaculos'),
      ])
      setCupons(cuponsRes.data ?? [])
      const lista = espetaculosRes.data?.data ?? espetaculosRes.data ?? []
      setEspetaculos(lista)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao listar cupons.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregar()
  }, [])

  const toggleEspetaculo = (id: number, checked: boolean) => {
    setIdsEspetaculos((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)))
  }

  const limparFormulario = () => {
    setCodigo('')
    setTipo('percentual')
    setValor('10')
    setUsoMaximo('')
    setValidoDe('')
    setValidoAte('')
    setIdsEspetaculos([])
  }

  const handleCriar = async () => {
    if (!codigo.trim()) {
      toast.error('Informe o código do cupom.')
      return
    }
    if (validoDe && validoAte && validoAte < validoDe) {
      toast.error('A data de término deve ser igual ou posterior ao início.')
      return
    }

    setCriando(true)
    try {
      await criarCupom({
        codigo: codigo.trim(),
        tipo,
        valor: Number(valor),
        ativo: true,
        uso_maximo: usoMaximo.trim() ? Number(usoMaximo) : null,
        valido_de: validoDe || null,
        valido_ate: validoAte || null,
        ids_espetaculos: idsEspetaculos,
      })
      toast.success('Cupom criado.')
      limparFormulario()
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
        description="Defina código, limite de usos, validade e espetáculos liberados."
      />

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold text-zinc-900">Novo cupom</p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Código</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="EX: PROMO10"
                className="h-10 rounded-xl uppercase"
              />
            </div>
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Valor</Label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Limite de utilizações</Label>
              <Input
                type="number"
                min={1}
                value={usoMaximo}
                onChange={(e) => setUsoMaximo(e.target.value)}
                placeholder="Ilimitado"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Início da validade</Label>
              <Input
                type="date"
                value={validoDe}
                onChange={(e) => setValidoDe(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Término da validade</Label>
              <Input
                type="date"
                value={validoAte}
                onChange={(e) => setValidoAte(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-xs text-zinc-500">Espetáculos permitidos</Label>
              <p className="text-[11px] text-zinc-400">
                Sem seleção = válido para todos os espetáculos.
              </p>
            </div>
            {espetaculos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-3 text-xs text-zinc-500">
                Nenhum espetáculo cadastrado.
              </p>
            ) : (
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 p-3">
                {espetaculos.map((esp) => {
                  const checked = idsEspetaculos.includes(esp.id)
                  return (
                    <label key={esp.id} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggleEspetaculo(esp.id, value === true)}
                      />
                      <span className="truncate">{esp.titulo}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end">
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
                    {c.uso_maximo != null ? ` de ${c.uso_maximo}` : ' (ilimitado)'}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{formatarValidade(c)}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{formatarEspetaculos(c)}</p>
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
