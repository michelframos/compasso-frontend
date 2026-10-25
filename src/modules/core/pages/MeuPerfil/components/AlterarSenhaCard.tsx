import React from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAlterarSenha } from '../hooks/useAlterarSenha'
import { CampoPerfil } from './CampoPerfil'

export const AlterarSenhaCard: React.FC = () => {
  const { form, salvar, isSaving } = useAlterarSenha()
  const { register, formState: { errors } } = form

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        salvar()
      }}
      className="flex flex-col bg-white rounded-[24px] shadow-sm border border-zinc-100"
    >
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
          <div className="p-2 rounded-lg bg-emerald-100">
            <KeyRound className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Senha de acesso</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Ao trocar, os outros dispositivos conectados são desconectados.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CampoPerfil id="senha_atual" label="Senha atual" type="password" autoComplete="current-password" registro={register('senha_atual')} erro={errors.senha_atual} disabled={isSaving} />
          <CampoPerfil id="password" label="Nova senha" type="password" autoComplete="new-password" registro={register('password')} erro={errors.password} disabled={isSaving} />
          <CampoPerfil id="password_confirmation" label="Confirmar nova senha" type="password" autoComplete="new-password" registro={register('password_confirmation')} erro={errors.password_confirmation} disabled={isSaving} />
        </div>
      </div>

      <div className="p-6 md:px-8 border-t border-zinc-100 bg-zinc-50/30 flex justify-end rounded-b-[24px]">
        <Button
          type="submit"
          disabled={isSaving}
          variant="outline"
          className="w-full sm:w-auto rounded-full px-8 h-10 font-bold border-zinc-200 hover:cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Alterando...
            </>
          ) : (
            'Alterar senha'
          )}
        </Button>
      </div>
    </form>
  )
}
