import React from 'react';
import { CriarContaForm } from '@/modules/core/components/CriarContaForm';
import { Music2 } from 'lucide-react';

export const CriarContaPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Lado Esquerdo - Boas Vindas */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="p-2 bg-white/20 rounded-full">
              <Music2 className="w-8 h-8" />
            </div>
            <span className="text-3xl font-black italic tracking-tighter">Compasso</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-bold leading-tight">Comece <br />agora mesmo!</h1>
            <p className="text-xl text-indigo-100 max-w-md font-light leading-relaxed">
              Crie a conta da sua escola em poucos minutos e aproveite o período gratuito com todos os módulos liberados.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-indigo-200">
          Oferecemos todas as ferramentas para simplificar a gestão da sua escola sem burocracia.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-zinc-50 md:bg-white">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-700">
          <CriarContaForm />
        </div>
      </div>
    </div>
  );
};
