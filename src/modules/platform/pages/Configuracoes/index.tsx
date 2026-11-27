import { useCallback, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Clock, CreditCard, Loader2, Mail } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor'
import { useConfiguracoesPlataforma } from './hooks/useConfiguracoesPlataforma'

type Aba = 'gratuidade' | 'email' | 'pagamentos'

export function PlatformConfiguracoesPage() {
  const {
    form,
    isLoading,
    isSubmitting,
    isTesting,
    onSubmit,
    onTestBilling,
    variaveis,
    billingConfigured,
    keyMasked,
  } = useConfiguracoesPlataforma()
  const { register, watch, setValue, formState: { errors } } = form
  const [aba, setAba] = useState<Aba>('gratuidade')
  const editorRef = useRef<Editor | null>(null)

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor
  }, [])

  const inserirVariavel = (chave: string) => {
    const token = `{{${chave}}}`
    const editor = editorRef.current

    if (editor) {
      editor.chain().focus().insertContent(token).run()
      return
    }

    setValue('email_cadastro_corpo', `${watch('email_cadastro_corpo')}${token}`, { shouldDirty: true })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabClass = (ativa: boolean) =>
    `px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${ativa
      ? 'border-indigo-600 text-indigo-600'
      : 'border-transparent text-zinc-400 hover:text-zinc-600'}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          <span className="text-indigo-600">Configurações</span> da Plataforma
        </h1>
        <p className="text-zinc-500 text-sm">
          Gratuidade, e-mail de cadastro e integração com o centralizador de pagamentos.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col bg-white rounded-[24px] shadow-sm border border-zinc-100 overflow-hidden">
        <div className="flex items-center gap-1 px-6 pt-4 bg-zinc-50/30 border-b border-zinc-100">
          <button type="button" onClick={() => setAba('gratuidade')} className={tabClass(aba === 'gratuidade')}>
            <Clock className="w-4 h-4" />
            Gratuidade
          </button>
          <button type="button" onClick={() => setAba('email')} className={tabClass(aba === 'email')}>
            <Mail className="w-4 h-4" />
            E-mail de cadastro
          </button>
          <button type="button" onClick={() => setAba('pagamentos')} className={tabClass(aba === 'pagamentos')}>
            <CreditCard className="w-4 h-4" />
            Pagamentos
          </button>
        </div>

        <div className="p-6 space-y-6">
          {aba === 'gratuidade' ? (
            <div className="max-w-sm space-y-2">
              <Label htmlFor="default_trial_days">Dias de gratuidade para novas escolas *</Label>
              <Input id="default_trial_days" type="number" min={1} max={3650} {...register('default_trial_days', { valueAsNumber: true })} />
              {errors.default_trial_days && (
                <p className="text-xs text-rose-500">{errors.default_trial_days.message}</p>
              )}
              <p className="text-xs text-zinc-500">
                Aplicado às contas criadas pela tela de login, pelo site e às escolas cadastradas aqui com a opção
                &quot;usar padrão&quot;. Escolas existentes não são alteradas.
              </p>
            </div>
          ) : aba === 'email' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email_cadastro_assunto">Assunto *</Label>
                <Input id="email_cadastro_assunto" {...register('email_cadastro_assunto')} />
                {errors.email_cadastro_assunto && (
                  <p className="text-xs text-rose-500">{errors.email_cadastro_assunto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Variáveis disponíveis</Label>
                <p className="text-xs text-zinc-500">
                  Clique para inserir no texto. Elas também podem ser usadas no assunto. Se o texto não contiver
                  {' '}<code className="text-indigo-600">{'{{codigo_ativacao}}'}</code>, o código é adicionado ao final do e-mail.
                </p>
                <div className="flex flex-wrap gap-2">
                  {variaveis.map((variavel) => (
                    <button
                      key={variavel.chave}
                      type="button"
                      title={variavel.descricao}
                      onClick={() => inserirVariavel(variavel.chave)}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      {`{{${variavel.chave}}}`}
                      <span className="ml-1 text-zinc-500 font-normal">— {variavel.descricao}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Texto do e-mail *</Label>
                <RichTextEditor
                  value={watch('email_cadastro_corpo')}
                  onChange={(html) => setValue('email_cadastro_corpo', html, { shouldDirty: true, shouldValidate: true })}
                  onEditorReady={handleEditorReady}
                  placeholder="Escreva o e-mail de boas-vindas..."
                />
                {errors.email_cadastro_corpo && (
                  <p className="text-xs text-rose-500">{errors.email_cadastro_corpo.message}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-xl space-y-5">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                Status:{' '}
                <strong className={billingConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                  {billingConfigured ? 'Configurado' : 'Incompleto'}
                </strong>
                {keyMasked ? ` · Key: ${keyMasked}` : ''}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_gateway_url">URL do centralizador</Label>
                <Input
                  id="billing_gateway_url"
                  placeholder="http://127.0.0.1:8001"
                  {...register('billing_gateway_url')}
                />
                {errors.billing_gateway_url && (
                  <p className="text-xs text-rose-500">{errors.billing_gateway_url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_gateway_api_key">API Key (`cpk_...`)</Label>
                <Input
                  id="billing_gateway_api_key"
                  type="password"
                  autoComplete="new-password"
                  placeholder={keyMasked || 'Cole a API Key do System Compasso'}
                  {...register('billing_gateway_api_key')}
                />
                <p className="text-xs text-zinc-500">
                  Deixe o valor mascarado para manter a key atual. Informe uma nova key completa apenas para
                  substituir.
                </p>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watch('billing_enabled')}
                  onChange={(e) => setValue('billing_enabled', e.target.checked, { shouldDirty: true })}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-zinc-800">Billing online ativo</span>
              </label>

              <Button
                type="button"
                variant="outline"
                onClick={() => void onTestBilling()}
                disabled={isTesting}
                className="rounded-full"
              >
                {isTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Testar conexão
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100">
          <Button type="submit" disabled={isSubmitting} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PlatformConfiguracoesPage
