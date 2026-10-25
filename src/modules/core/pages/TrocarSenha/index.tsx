import React from 'react'
import { KeyRound } from 'lucide-react'
import { CustomInput } from '@/shared/components/CustomInput'
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton'
import { useTrocarSenha } from './hooks/useTrocarSenha'

export const TrocarSenhaPage: React.FC = () => {
  const { form, onSubmit, isLoading, handleSair, nome } = useTrocarSenha()
  const { register, handleSubmit, formState: { errors } } = form

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-100">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Defina uma nova senha</h1>
          <p className="text-zinc-500 text-sm">
            {nome ? `Olá, ${nome}! ` : ''}
            Por segurança, troque a senha recebida da escola antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-[24px] shadow-sm border border-zinc-100">
          <CustomInput
            id="senha_atual"
            label="Senha atual"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <CustomInput
            id="password"
            label="Nova senha"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <CustomInput
            id="password_confirmation"
            label="Confirmar nova senha"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <CustomLoadingButton
            isLoading={isLoading}
            text="Salvar nova senha"
            loadingText="Salvando..."
            type="submit"
            disabled={isLoading}
          />
        </form>

        <p className="text-center text-sm text-zinc-500">
          <button type="button" onClick={handleSair} className="text-indigo-600 hover:text-indigo-700 font-medium hover:cursor-pointer">
            Sair
          </button>
        </p>
      </div>
    </div>
  )
}
