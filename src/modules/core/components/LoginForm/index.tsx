import React from 'react';
import { useLoginForm, type LoginMode } from './hooks/useLoginForm';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';
import { AuthAlert } from '@/modules/core/components/auth/AuthAlert';
import { PasswordField } from '@/modules/core/components/auth/PasswordField';
import { OtpInput } from '@/modules/core/components/auth/OtpInput';

interface LoginFormProps {
  mode?: LoginMode;
}

export const LoginForm: React.FC<LoginFormProps> = ({ mode = 'escola' }) => {
  const {
    form,
    registerCnpj,
    onSubmit,
    onResendCode,
    selecionarEscola,
    isLoading,
    isResending,
    needsActivation,
    escolasPendentes,
    error,
  } = useLoginForm(mode);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const isPlatform = mode === 'platform';
  const isAluno = mode === 'aluno';
  const isBilheteria = mode === 'bilheteria';
  const mostrarSeletorEscolas = isAluno && escolasPendentes.length > 1;
  const activationCode = watch('activation_code') ?? '';

  const titulo = isPlatform
    ? 'Acesso da plataforma'
    : isAluno
      ? 'Área do aluno'
      : isBilheteria
        ? 'Bilheteria'
        : 'Bem-vindo de volta';

  const subtitulo = isPlatform
    ? 'Área restrita aos administradores do Compasso.'
    : isAluno
      ? 'Entre com seu e-mail e senha para acessar aulas, boletim e financeiro.'
      : isBilheteria
        ? 'Painel de gestão de ingressos. Informe o CNPJ da escola e suas credenciais.'
        : 'Informe o CNPJ da escola e suas credenciais para acessar.';

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--auth-navy)]">{titulo}</h2>
        <p className="text-zinc-500">{subtitulo}</p>
      </div>

      {mostrarSeletorEscolas ? (
        <div className="space-y-4">
          {error && (
            <AuthAlert variant="info">
              <span>{error}</span>
            </AuthAlert>
          )}

          <div className="space-y-3">
            {escolasPendentes.map((escola) => (
              <button
                key={escola.id}
                type="button"
                disabled={isLoading}
                onClick={() => selecionarEscola(escola.slug)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-left transition hover:border-[color-mix(in_srgb,var(--auth-magenta)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--auth-magenta)_6%,white)] disabled:opacity-60"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-zinc-900">{escola.nome_fantasia}</span>
                  {escola.razao_social && (
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">{escola.razao_social}</span>
                  )}
                </span>
                {isLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--auth-magenta)]" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <AuthAlert>
              <span>{error}</span>
            </AuthAlert>
          )}

          {!isPlatform && !isAluno && (
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
            <PasswordField
              id="password"
              label="Senha"
              register={register}
              errors={errors}
              disabled={isLoading}
            />
            {!isPlatform && (
              <div className="mt-1 flex justify-end">
                <Link to="/esqueci-minha-senha" className="auth-link text-xs">
                  Esqueceu a senha?
                </Link>
              </div>
            )}
          </div>

          {!isPlatform && !isAluno && needsActivation && (
            <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--auth-magenta)_18%,transparent)] bg-[color-mix(in_srgb,var(--auth-magenta)_6%,white)] p-4">
              <p className="text-sm text-zinc-600">
                Primeiro acesso: informe o código de ativação enviado para o e-mail do responsável.
              </p>
              <OtpInput
                id="activation_code"
                label="Código de ativação"
                value={activationCode}
                onChange={(value) => setValue('activation_code', value, { shouldValidate: true, shouldDirty: true })}
                error={(errors.activation_code as { message?: string } | undefined)?.message}
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onResendCode}
                  disabled={isResending || isLoading}
                  className="auth-link text-xs disabled:opacity-50"
                >
                  {isResending ? 'Reenviando...' : 'Reenviar código'}
                </button>
              </div>
            </div>
          )}

          <CustomLoadingButton
            isLoading={isLoading}
            text={needsActivation && !isPlatform && !isAluno ? 'Ativar e entrar' : 'Entrar'}
            loadingText="Entrando..."
            type="submit"
            disabled={isLoading}
            className="auth-cta"
          />
        </form>
      )}

      {!isPlatform && !isAluno && !isBilheteria && (
        <p className="text-center text-sm text-zinc-500">
          Ainda não tem conta?{' '}
          <Link to="/criar-conta" className="auth-link">
            Criar nova conta
          </Link>
        </p>
      )}

      <nav className="auth-persona" aria-label="Outros acessos">
        {isPlatform ? (
          <Link to="/login">Voltar ao login da escola</Link>
        ) : isAluno ? (
          <Link to="/login">Acesso da escola / equipe</Link>
        ) : isBilheteria ? (
          <Link to="/login">Voltar ao login da escola</Link>
        ) : (
          <>
            <Link to="/aluno/login">Aluno ou responsável</Link>
            <Link to="/bilheteria/login">Bilheteria</Link>
            <Link to="/platform/login">Plataforma</Link>
          </>
        )}
      </nav>
    </div>
  );
};
