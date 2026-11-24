import React from 'react';
import { ResetPasswordForm } from '@/modules/core/components/ResetPasswordForm';
import { AuthLayout } from '@/modules/core/components/AuthLayout';

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      accent="escola"
      title={<>Nova senha,<br />mesmo ritmo</>}
      subtitle="Informe o código recebido por e-mail e escolha uma senha forte. Seu acesso é pessoal e intransferível."
      footer="Dica: use uma senha que você ainda não usa em outros sistemas."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};
