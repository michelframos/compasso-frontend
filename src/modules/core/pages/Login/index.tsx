import React from 'react';
import { LoginForm } from '@/modules/core/components/LoginForm';
import type { LoginMode } from '@/modules/core/components/LoginForm/hooks/useLoginForm';
import { AuthLayout } from '@/modules/core/components/AuthLayout';

interface LoginPageProps {
  mode?: LoginMode;
}

const copyByMode: Record<LoginMode, { title: React.ReactNode; subtitle: string; footer: string }> = {
  escola: {
    title: <>Olá,<br />seja bem-vindo!</>,
    subtitle: 'Gestão simplificada para escolas de música e dança. Acesse seu painel e continue sua jornada artística.',
    footer: 'Tudo o que sua escola precisa — em um só compasso.',
  },
  aluno: {
    title: <>Olá,<br />vamos começar?</>,
    subtitle: 'Acompanhe agenda, frequência, materiais e boletim em um só lugar.',
    footer: 'Feito para alunos e responsáveis acompanharem a rotina da escola.',
  },
  bilheteria: {
    title: <>Gestão de<br />ingressos</>,
    subtitle: 'Gere, venda e valide ingressos por espetáculo com cupons, templates e QR Code.',
    footer: 'Módulo Bilheteria — acesso para secretaria e administração.',
  },
  platform: {
    title: <>Acesso<br />plataforma</>,
    subtitle: 'Área restrita aos administradores do Compasso.',
    footer: 'Operações internas da plataforma.',
  },
};

export const LoginPage: React.FC<LoginPageProps> = ({ mode = 'escola' }) => {
  const copy = copyByMode[mode];

  return (
    <AuthLayout
      accent={mode}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={copy.footer}
    >
      <LoginForm mode={mode} />
    </AuthLayout>
  );
};

export const PlatformLoginPage: React.FC = () => <LoginPage mode="platform" />;

export const AlunoLoginPage: React.FC = () => <LoginPage mode="aluno" />;

export const BilheteriaLoginPage: React.FC = () => <LoginPage mode="bilheteria" />;
