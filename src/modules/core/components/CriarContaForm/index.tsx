import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';
import { useCriarContaForm } from './hooks/useCriarContaForm';

export const CriarContaForm: React.FC = () => {
  const { form, registerCnpj, onSubmit, isLoading, error } = useCriarContaForm();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Criar nova conta</h2>
        <p className="text-zinc-500">
          Cadastre sua escola e comece o período gratuito. Enviaremos um código de ativação para o seu e-mail.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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

        <CustomInput
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          register={register}
          errors={errors}
          disabled={isLoading}
        />

        <CustomInput
          id="password_confirmation"
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
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
        />
      </form>

      <p className="text-center text-sm text-zinc-500">
        Já tem uma conta?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
};
