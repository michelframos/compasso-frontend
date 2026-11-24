import React from 'react';
import { useLoginForm, type LoginMode } from './hooks/useLoginForm';
import { AlertCircle, Building2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomInput } from '@/shared/components/CustomInput';
import { CustomLoadingButton } from '@/shared/components/CustomLoadingButton';

interface LoginFormProps {
  mode?: LoginMode;
}

export const LoginForm: React.FC<LoginFormProps> = ({ mode = 'escola' }) => {
  const {
    form,
    registerCnpj,
    registerActivationCode,
    onSubmit,
    onResendCode,
    selecionarEscola,
    isLoading,
    isResending,
    needsActivation,
    escolasPendentes,
    error,
  } = useLoginForm(mode);
  const { register, handleSubmit, formState: { errors } } = form;
  const isPlatform = mode === 'platform';
  const isAluno = mode === 'aluno';
  const isBilheteria = mode === 'bilheteria';
  const mostrarSeletorEscolas = isAluno && escolasPendentes.length > 1;

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
      <div className="text-center md:text-left space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{titulo}</h2>
        <p className="text-zinc-500">{subtitulo}</p>
      </div>

      {mostrarSeletorEscolas ? (
        <div className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-indigo-50 text-indigo-900 text-sm flex items-start gap-3">
              <Building2 className="w-5 h-5 shrink-0 text-indigo-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {escolasPendentes.map((escola) => (
              <button
                key={escola.id}
                type="button"
                disabled={isLoading}
                onClick={() => selecionarEscola(escola.slug)}
                className="w-full flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-60"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-zinc-900 truncate">{escola.nome_fantasia}</span>
                  {escola.razao_social && (
                    <span className="block text-xs text-zinc-500 mt-0.5 truncate">{escola.razao_social}</span>
                  )}
                </span>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
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

          {!isPlatform && !isAluno && needsActivation && (
            <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="text-sm text-zinc-600">
                Primeiro acesso: informe o código de ativação enviado para o e-mail do responsável.
              </p>
              <CustomInput
                id="activation_code"
                label="Código de ativação"
                type="text"
                placeholder="000000"
                register={registerActivationCode}
                errors={errors}
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onResendCode}
                  disabled={isResending || isLoading}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
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
          />
        </form>
      )}

      {!isPlatform && !isAluno && !isBilheteria && (
        <p className="text-center text-sm text-zinc-500">
          Ainda não tem conta?{' '}
          <Link to="/criar-conta" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Criar nova conta
          </Link>
        </p>
      )}

      <p className="text-center text-xs text-zinc-400 space-y-1">
        {isPlatform ? (
          <Link to="/login" className="hover:text-zinc-600">Voltar ao login da escola</Link>
        ) : isAluno ? (
          <Link to="/login" className="hover:text-zinc-600">Acesso da escola / equipe</Link>
        ) : isBilheteria ? (
          <Link to="/login" className="hover:text-zinc-600">Voltar ao login da escola</Link>
        ) : (
          <>
            <Link to="/aluno/login" className="block hover:text-zinc-600">Sou aluno ou responsável</Link>
            <Link to="/bilheteria/login" className="block hover:text-zinc-600">Painel de bilheteria</Link>
            <Link to="/platform/login" className="block hover:text-zinc-600">Acesso da plataforma</Link>
          </>
        )}
      </p>
    </div>
  );
};
