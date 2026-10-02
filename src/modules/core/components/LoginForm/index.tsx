import React from 'react';
import { useLoginForm, type LoginMode } from './hooks/useLoginForm';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';

interface LoginFormProps {
  mode?: LoginMode;
}

export const LoginForm: React.FC<LoginFormProps> = ({ mode = 'escola' }) => {
  const { form, registerCnpj, onSubmit, isLoading, error } = useLoginForm(mode);
  const { register, handleSubmit, formState: { errors } } = form;
  const isPlatform = mode === 'platform';

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          {isPlatform ? 'Acesso da plataforma' : 'Bem-vindo de volta'}
        </h2>
        <p className="text-zinc-500">
          {isPlatform
            ? 'Área restrita aos administradores do Compasso.'
            : 'Informe o CNPJ da escola e suas credenciais para acessar.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isPlatform && (
          <CustomInput
            id="cnpj"
            label="CNPJ da escola"
            type="text"
            placeholder="00.000.000/0000-00"
            register={registerCnpj}
            errors={errors}
            disabled={isLoading}
          />
        )}

        <CustomInput
          id="email"
          label="E-mail"
          type="email"
          placeholder="usuario@compasso.com"
          register={register}
          errors={errors}
          disabled={isLoading}
        />

        <div className="space-y-2">
          <CustomInput
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          {!isPlatform && (
            <div className="flex justify-end mt-1">
              <Link to="/esqueci-minha-senha" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Esqueceu a senha?
              </Link>
            </div>
          )}
        </div>

        <CustomLoadingButton
          isLoading={isLoading}
          text="Entrar"
          loadingText="Entrando..."
          type="submit"
          disabled={isLoading}
        />
      </form>

      <p className="text-center text-xs text-zinc-400">
        {isPlatform ? (
          <Link to="/login" className="hover:text-zinc-600">Voltar ao login da escola</Link>
        ) : (
          <Link to="/platform/login" className="hover:text-zinc-600">Acesso da plataforma</Link>
        )}
      </p>
    </div>
  );
};
