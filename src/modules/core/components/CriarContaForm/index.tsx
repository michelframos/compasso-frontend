import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';
import { Button } from '@/shared/components/ui/button';
import { AuthAlert } from '@/modules/core/components/auth/AuthAlert';
import { PasswordField } from '@/modules/core/components/auth/PasswordField';
import { useCriarContaForm } from './hooks/useCriarContaForm';

const STEP1_FIELDS = ['nome_fantasia', 'cnpj', 'responsavel_nome', 'email'] as const;

export const CriarContaForm: React.FC = () => {
  const { form, registerCnpj, onSubmit, isLoading, error } = useCriarContaForm();
  const { register, handleSubmit, trigger, watch, formState: { errors } } = form;
  const [step, setStep] = useState<1 | 2>(1);
  const passwordValue = watch('password') ?? '';

  const goNext = async () => {
    const ok = await trigger([...STEP1_FIELDS]);
    if (ok) setStep(2);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center md:text-left">
        <div className="auth-step-dots justify-center md:justify-start" aria-hidden>
          <span data-active={step === 1} />
          <span data-active={step === 2} />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--auth-navy)]">Criar nova conta</h2>
        <p className="text-zinc-500">
          {step === 1
            ? 'Dados da escola e do responsável. Enviaremos um código de ativação para o e-mail informado.'
            : 'Defina uma senha segura para proteger o acesso da sua escola.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <AuthAlert>
            <span>{error}</span>
          </AuthAlert>
        )}

        {step === 1 ? (
          <>
            <CustomInput
              id="nome_fantasia"
              label="Nome fantasia (nome da escola)"
              type="text"
              placeholder="Escola de Música Harmonia"
              register={register}
              errors={errors}
              disabled={isLoading}
            />

            <CustomInput
              id="cnpj"
              label="CNPJ"
              type="text"
              placeholder="00.000.000/0000-00"
              register={registerCnpj}
              errors={errors}
              disabled={isLoading}
            />

            <CustomInput
              id="responsavel_nome"
              label="Nome do responsável"
              type="text"
              placeholder="Maria Silva"
              register={register}
              errors={errors}
              disabled={isLoading}
            />

            <CustomInput
              id="email"
              label="E-mail"
              type="email"
              placeholder="contato@suaescola.com"
              register={register}
              errors={errors}
              disabled={isLoading}
            />

            <Button
              type="button"
              onClick={() => void goNext()}
              className="auth-cta h-12 w-full rounded-[10px] text-base font-bold text-white"
            >
              Continuar
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-1 inline-flex items-center text-sm font-medium text-zinc-500 transition hover:text-[var(--auth-navy)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos dados da escola
            </button>

            <PasswordField
              id="password"
              label="Senha"
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
              text="Criar conta"
              loadingText="Criando conta..."
              type="submit"
              disabled={isLoading}
              className="auth-cta"
            />
          </>
        )}
      </form>

      <p className="text-center text-sm text-zinc-500">
        Já tem uma conta?{' '}
        <Link to="/login" className="auth-link">
          Fazer login
        </Link>
      </p>
    </div>
  );
};
