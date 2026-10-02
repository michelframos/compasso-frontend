import React from 'react';
import { useResetPassword } from './hooks/useResetPassword';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';

export const ResetPasswordForm: React.FC = () => {
  const location = useLocation();
  const stateEmail = location.state?.email || '';

  const { form, onSubmit, isLoading } = useResetPassword(stateEmail);
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left space-y-2">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o login
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Nova senha</h2>
        <p className="text-zinc-500">
          Insira o código enviado para o seu e-mail e crie uma nova senha de acesso.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <CustomInput
            id="email"
            label="E-mail"
            type="email"
            placeholder="usuario@compasso.com"
            register={register}
            errors={errors}
            disabled={isLoading || !!stateEmail}
          />
        </div>

        <div className="space-y-2">
          <CustomInput
            id="token"
            label="Código de 6 dígitos"
            type="text"
            placeholder="123456"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <CustomInput
            id="password"
            label="Nova senha"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <CustomInput
            id="password_confirmation"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
        </div>

        <CustomLoadingButton
          isLoading={isLoading}
          text="Redefinir senha"
          loadingText="Processando..."
          type="submit"
          disabled={isLoading}
        />
      </form>
    </div>
  );
};
