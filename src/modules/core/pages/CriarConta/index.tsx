import React from 'react';
import { CriarContaForm } from '@/modules/core/components/CriarContaForm';
import { AuthLayout } from '@/modules/core/components/AuthLayout';

export const CriarContaPage: React.FC = () => {
  return (
    <AuthLayout
      accent="escola"
      title={<>Comece<br />agora mesmo!</>}
      subtitle="Crie a conta da sua escola em poucos minutos e aproveite o período gratuito com todos os módulos liberados."
      footer="Sem burocracia — cadastro rápido e ativação por e-mail."
    >
      <CriarContaForm />
    </AuthLayout>
  );
};
