import React from 'react';
import { useResetPassword } from './hooks/useResetPassword';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';
import { AuthAlert } from '@/modules/core/components/auth/AuthAlert';
import { PasswordField } from '@/modules/core/components/auth/PasswordField';
import { OtpInput } from '@/modules/core/components/auth/OtpInput';

export const ResetPasswordForm: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateEmail = location.state?.email || searchParams.get('email') || '';

  const { form, onSubmit, isLoading, error } = useResetPassword(stateEmail);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const token = watch('token') ?? '';
  const passwordValue = watch('password') ?? '';

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center md:text-left">
        <Link
          to="/login"
          className="mb-4 inline-flex items-center text-sm font-medium text-zinc-500 transition-colors hover:text-[var(--auth-navy)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o login
        </Link>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--auth-navy)]">Nova senha</h2>
        <p className="text-zinc-500">
          Insira o código enviado para o seu e-mail e crie uma nova senha de acesso.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <AuthAlert>
            <span>{error}</span>
          </AuthAlert>
        )}

        <CustomInput
          id="email"
          label="E-mail"
          type="email"
          placeholder="usuario@compasso.com"
          register={register}
          errors={errors}
          disabled={isLoading || !!stateEmail}
        />

        <OtpInput
          id="token"
          label="Código de 6 dígitos"
          value={token}
          onChange={(value) => setValue('token', value, { shouldValidate: true, shouldDirty: true })}
          error={(errors.token as { message?: string } | undefined)?.message}
          disabled={isLoading}
        />

        <PasswordField
          id="password"
          label="Nova senha"
          register={register}
          errors={errors}
          disabled={isLoading}
          showRequirements
          value={passwordValue}
        />

        <PasswordField
          id="password_confirmation"
          label="Confirmar senha"
          register={register}
          errors={errors}
          disabled={isLoading}
        />

        <CustomLoadingButton
          isLoading={isLoading}
          text="Redefinir senha"
          loadingText="Processando..."
          type="submit"
          disabled={isLoading}
          className="auth-cta"
        />
      </form>
    </div>
  );
};
