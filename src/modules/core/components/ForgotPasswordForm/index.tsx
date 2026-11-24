import React from 'react';
import { useForgotPassword } from './hooks/useForgotPassword';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';
import { AuthAlert } from '@/modules/core/components/auth/AuthAlert';

export const ForgotPasswordForm: React.FC = () => {
  const { form, onSubmit, isLoading, success, error } = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = form;
  const navigate = useNavigate();

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
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--auth-navy)]">Esqueceu a senha?</h2>
        <p className="text-zinc-500">
          Informe seu e-mail abaixo. Se houver uma conta associada, enviaremos um código de recuperação com 6 dígitos.
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <AuthAlert variant="success">
            <div className="space-y-1">
              <p className="font-medium">Código enviado!</p>
              <p className="text-sm">
                Verifique sua caixa de entrada e a pasta de spam. O e-mail deve chegar em alguns instantes.
              </p>
            </div>
          </AuthAlert>
          <Button
            type="button"
            onClick={() => navigate('/redefinir-senha', { state: { email: form.getValues('email') } })}
            className="auth-cta h-12 w-full rounded-[10px] text-base font-bold text-white"
          >
            Já tenho o código
          </Button>
        </div>
      ) : (
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
            disabled={isLoading}
          />

          <CustomLoadingButton
            isLoading={isLoading}
            text="Enviar código de recuperação"
            loadingText="Enviando..."
            type="submit"
            disabled={isLoading}
            className="auth-cta"
          />
        </form>
      )}
    </div>
  );
};
