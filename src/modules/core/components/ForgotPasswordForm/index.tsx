import React from 'react';
import { useForgotPassword } from './hooks/useForgotPassword';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ForgotPasswordForm: React.FC = () => {
  const { form, onSubmit, isLoading, success } = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = form;
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left space-y-2">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o login
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Esqueceu a senha?</h2>
        <p className="text-zinc-500">
          Informe seu e-mail abaixo. Se houver uma conta associada, enviaremos um código de recuperação com 6 dígitos.
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1 text-emerald-800">
              <p className="font-medium">Código enviado!</p>
              <p className="text-sm">Verifique sua caixa de entrada e a pasta de spam. O e-mail deve chegar em alguns instantes.</p>
            </div>
          </div>
          <Button 
            type="button" 
            onClick={() => navigate('/redefinir-senha', { state: { email: form.getValues('email') } })}
            className="w-full h-12 rounded-[10px] bg-indigo-600 hover:bg-indigo-700 text-base font-bold shadow-lg shadow-indigo-200 transition-all hover:cursor-pointer"
          >
            Já tenho o código
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700 font-medium ml-1">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@compasso.com"
              className={`h-12 px-5 rounded-[10px] border-zinc-200 bg-white focus-visible:ring-indigo-600 transition-all ${errors.email ? 'border-destructive ring-destructive' : ''}`}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium ml-4">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 rounded-[10px] bg-indigo-600 hover:bg-indigo-700 text-base font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] hover:cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar código de recuperação'
            )}
          </Button>
        </form>
      )}
    </div>
  );
};
