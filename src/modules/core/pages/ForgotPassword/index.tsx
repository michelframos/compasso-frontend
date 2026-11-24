import React from 'react';
import { ForgotPasswordForm } from '@/modules/core/components/ForgotPasswordForm';
import { AuthLayout } from '@/modules/core/components/AuthLayout';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      accent="escola"
      title={<>Recuperação<br />de acesso</>}
      subtitle="Não se preocupe — acontece com todo mundo. Enviamos um código para você voltar ao painel."
      footer="O código expira em breve. Verifique também a pasta de spam."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
