import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { IngressoCanvasEditor } from '../components/IngressoCanvasEditor'
import {
  atualizarTemplateIngresso,
  criarTemplateIngresso,
  obterTemplateIngresso,
  uploadFundoTemplateIngresso,
} from '../api/templates'
import {
  encodeLayoutIngresso,
  layoutIngressoPadrao,
  parseLayoutIngresso,
  type LayoutIngresso,
  type UnidadeTemplate,
} from '../types'
import { LoadingBlock, PageHeader } from '../components/ui'

export const TemplateFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNovo = !id || id === 'novo'
  const [nome, setNome] = useState('Ingresso padrão')
  const [largura, setLargura] = useState(15)
  const [altura, setAltura] = useState(7)
  const [unidade, setUnidade] = useState<UnidadeTemplate>('cm')
  const [layout, setLayout] = useState<LayoutIngresso>(layoutIngressoPadrao())
  const [fundoUrl, setFundoUrl] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState<number | null>(isNovo ? null : Number(id))
  const [loading, setLoading] = useState(!isNovo)
  const [saving, setSaving] = useState(false)
  const [uploadingFundo, setUploadingFundo] = useState(false)

  useEffect(() => {
    if (isNovo) return
    void (async () => {
      try {
        const res = await obterTemplateIngresso(Number(id))
        const t = res.data
        setNome(t.nome)
        setLargura(t.largura)
        setAltura(t.altura)
        setUnidade(t.unidade)
        setLayout(parseLayoutIngresso(t.conteudo, t.layout))
        setFundoUrl(t.fundo_url ?? null)
        setTemplateId(t.id)
      } catch (err) {
        toast.error(getErrorMessage(err, 'Erro ao carregar template.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isNovo])

  const salvar = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do template.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        nome: nome.trim(),
        largura,
        altura,
        unidade,
        conteudo: encodeLayoutIngresso(layout),
      }
      if (templateId) {
        await atualizarTemplateIngresso(templateId, payload)
        toast.success('Template salvo.')
      } else {
        const res = await criarTemplateIngresso(payload)
        setTemplateId(res.data.id)
        toast.success('Template criado. Agora você pode enviar um fundo.')
        navigate(`/bilheteria/templates/${res.data.id}`, { replace: true })
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar.'))
    } finally {
      setSaving(false)
    }
  }

  const onFundo = async (file: File) => {
    if (!templateId) {
      toast.error('Salve o template antes de enviar o fundo.')
      return
    }
    setUploadingFundo(true)
    try {
      const res = await uploadFundoTemplateIngresso(templateId, file)
      setFundoUrl(res.data.fundo_url ?? null)
      toast.success('Fundo atualizado.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro no upload.'))
    } finally {
      setUploadingFundo(false)
    }
  }

  if (loading) return <LoadingBlock />

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNovo ? 'Novo' : 'Editar'}
        highlight="template"
        description="Ajuste dimensões, fundo e elementos do ingresso."
        actions={
          <>
            <Button asChild variant="ghost" className="h-9 rounded-full font-bold text-zinc-500">
              <Link to="/bilheteria/templates">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button
              onClick={salvar}
              disabled={saving}
              className="h-9 rounded-full bg-indigo-600 px-5 font-bold hover:bg-indigo-700"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </>
        }
      />

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-zinc-500">Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500">Largura</Label>
            <Input
              type="number"
              min={1}
              value={largura}
              onChange={(e) => setLargura(Number(e.target.value))}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500">Altura</Label>
            <Input
              type="number"
              min={1}
              value={altura}
              onChange={(e) => setAltura(Number(e.target.value))}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500">Unidade</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value as UnidadeTemplate)}
            >
              <option value="cm">Centímetros</option>
              <option value="px">Pixels</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500">Fundo</Label>
            <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 text-xs font-bold text-zinc-600 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700">
              {uploadingFundo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {fundoUrl ? 'Trocar' : 'Enviar'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void onFundo(f)
                  e.target.value = ''
                }}
              />
            </label>
            {!templateId && (
              <p className="text-[10px] text-zinc-400">Salve o template antes do fundo.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-4 md:p-5">
          <IngressoCanvasEditor
            layout={layout}
            onChange={setLayout}
            largura={largura}
            altura={altura}
            unidade={unidade}
            fundoUrl={fundoUrl}
          />
        </CardContent>
      </Card>
    </div>
  )
}
