import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Loader2, MapPin, Save, UserRound } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import type { Cidade, Estado } from '@/modules/core/api/localidades'
import type { PerfilFormData } from '@/modules/core/types'
import { formatCep } from '@/shared/lib/utils'
import { CampoPerfil } from './CampoPerfil'

interface DadosPessoaisFormProps {
  form: UseFormReturn<PerfilFormData>
  onSalvar: () => void
  isSaving: boolean
  estados: Estado[]
  cidades: Cidade[]
  estadoSelecionado: string
  isLoadingCidades: boolean
  onBuscarCep: (cep: string) => void
  isBuscandoCep: boolean
}

const Secao: React.FC<{ icone: React.ReactNode; cor: string; titulo: string; descricao: string }> = ({ icone, cor, titulo, descricao }) => (
  <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
    <div className={`p-2 rounded-lg ${cor}`}>{icone}</div>
    <div>
      <h2 className="text-sm font-bold text-zinc-900">{titulo}</h2>
      <p className="text-xs text-zinc-500 mt-0.5">{descricao}</p>
    </div>
  </div>
)

export const DadosPessoaisForm: React.FC<DadosPessoaisFormProps> = ({
  form,
  onSalvar,
  isSaving,
  estados,
  cidades,
  estadoSelecionado,
  isLoadingCidades,
  onBuscarCep,
  isBuscandoCep,
}) => {
  const { register, setValue, watch, formState: { errors, isDirty } } = form

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSalvar()
      }}
      className="flex flex-col bg-white rounded-[24px] shadow-sm border border-zinc-100"
    >
      <div className="p-6 md:p-8 space-y-8">
        <div className="space-y-5">
          <Secao
            icone={<UserRound className="w-4 h-4 text-indigo-600" />}
            cor="bg-indigo-100"
            titulo="Dados pessoais"
            descricao="E-mail e CPF são alterados pela secretaria da escola."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CampoPerfil id="nome" label="Nome completo *" registro={register('nome')} erro={errors.nome} disabled={isSaving} className="md:col-span-2" />
            <CampoPerfil id="data_aniversario" label="Data de nascimento" type="date" registro={register('data_aniversario')} erro={errors.data_aniversario} disabled={isSaving} />
            <CampoPerfil id="telefone" label="Telefone" type="tel" inputMode="tel" placeholder="(00) 0000-0000" registro={register('telefone')} erro={errors.telefone} disabled={isSaving} />
            <CampoPerfil id="whatsapp" label="WhatsApp" type="tel" inputMode="tel" placeholder="(00) 00000-0000" registro={register('whatsapp')} erro={errors.whatsapp} disabled={isSaving} />
          </div>
        </div>

        <div className="space-y-5">
          <Secao
            icone={<MapPin className="w-4 h-4 text-amber-600" />}
            cor="bg-amber-100"
            titulo="Endereço"
            descricao="Usado pela escola para contato e documentos."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CampoPerfil
              id="cep"
              label={<>CEP {isBuscandoCep && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}</>}
              inputMode="numeric"
              placeholder="00000-000"
              maxLength={9}
              registro={register('cep', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const cep = formatCep(e.target.value)
                  setValue('cep', cep, { shouldDirty: true })
                  onBuscarCep(cep)
                },
                onBlur: (e: React.FocusEvent<HTMLInputElement>) => onBuscarCep(e.target.value),
              })}
              erro={errors.cep}
              disabled={isSaving}
            />
            <CampoPerfil id="rua" label="Rua / Logradouro" registro={register('rua')} erro={errors.rua} disabled={isSaving} className="md:col-span-2" />
            <CampoPerfil id="numero" label="Número" registro={register('numero')} erro={errors.numero} disabled={isSaving} />
            <CampoPerfil id="complemento" label="Complemento" registro={register('complemento')} erro={errors.complemento} disabled={isSaving} />
            <CampoPerfil id="bairro" label="Bairro" registro={register('bairro')} erro={errors.bairro} disabled={isSaving} />

            <div className="space-y-2">
              <Label htmlFor="id_estado" className="text-zinc-700 font-medium ml-1">Estado</Label>
              <Select
                value={estadoSelecionado || undefined}
                disabled={isSaving}
                onValueChange={(valor) => {
                  if (!valor || valor === estadoSelecionado) return
                  setValue('id_estado', valor, { shouldDirty: true })
                  setValue('id_cidade', '', { shouldDirty: true })
                }}
              >
                <SelectTrigger id="id_estado" className="h-11 rounded-xl border-zinc-200">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>
                      {estado.nome} ({estado.sigla})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="id_cidade" className={`font-medium ml-1 ${errors.id_cidade ? 'text-rose-500' : 'text-zinc-700'}`}>Cidade</Label>
              <Select
                value={watch('id_cidade') || undefined}
                onValueChange={(valor) => {
                  if (valor) setValue('id_cidade', valor, { shouldDirty: true, shouldValidate: true })
                }}
                disabled={isSaving || !estadoSelecionado || isLoadingCidades}
              >
                <SelectTrigger id="id_cidade" className={`h-11 rounded-xl ${errors.id_cidade ? 'border-rose-500' : 'border-zinc-200'}`}>
                  <SelectValue placeholder={isLoadingCidades ? 'Carregando...' : 'Selecione...'} />
                </SelectTrigger>
                <SelectContent>
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.id.toString()}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_cidade && <p className="text-[11px] text-rose-500 ml-1">{errors.id_cidade.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:px-8 border-t border-zinc-100 bg-zinc-50/30 flex justify-end rounded-b-[24px]">
        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-10 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
