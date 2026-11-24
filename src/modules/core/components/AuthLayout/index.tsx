import type { ReactNode } from 'react'
import { AppLogo } from '@/shared/components/AppLogo'
import { APP_NAME } from '@/shared/constants/app'
import { cn } from '@/shared/lib/utils'

export type AuthAccent = 'escola' | 'aluno' | 'bilheteria' | 'platform'

interface AuthLayoutProps {
  title: ReactNode
  subtitle: string
  footer?: string
  accent?: AuthAccent
  children: ReactNode
}

const accentChip: Record<AuthAccent, string | null> = {
  escola: null,
  aluno: 'Área do aluno',
  bilheteria: 'Bilheteria',
  platform: 'Plataforma',
}

export function AuthLayout({
  title,
  subtitle,
  footer,
  accent = 'escola',
  children,
}: AuthLayoutProps) {
  const chip = accentChip[accent]

  return (
    <div
      className={cn(
        'auth-shell min-h-dvh w-full',
        accent === 'bilheteria' && 'auth-shell--bilheteria',
      )}
    >
      <div className="flex min-h-dvh w-full flex-col lg:flex-row">
        {/* Painel brand — desktop */}
        <aside className="auth-panel relative hidden min-h-dvh w-full self-stretch overflow-hidden lg:flex lg:w-[48%] lg:flex-col lg:justify-between">
          <div className="auth-panel__visual" aria-hidden />
          <div className="auth-panel__glow" aria-hidden />

          <div className="relative z-10 flex min-h-dvh flex-1 flex-col justify-between p-10 xl:p-14">
            <div className="auth-panel__brand flex items-center gap-3.5 animate-in fade-in duration-700">
              <AppLogo size="xl" variant="glass" />
              <span className="text-3xl font-semibold tracking-tight text-white">
                {APP_NAME}
              </span>
            </div>

            <div className="relative z-10 max-w-md space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
              {chip && (
                <span className="auth-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white/95">
                  {chip}
                </span>
              )}
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white xl:text-6xl">
                {title}
              </h1>
              <p className="max-w-sm text-lg font-light leading-relaxed text-white/80">
                {subtitle}
              </p>
            </div>

            <p className="relative z-10 max-w-sm text-sm text-white/55 animate-in fade-in duration-700 delay-200">
              {footer ?? 'Gestão para escolas de música e dança — sem burocracia.'}
            </p>
          </div>
        </aside>

        {/* Coluna do formulário */}
        <main className="auth-form-col relative flex flex-1 flex-col">
          {/* Header mobile */}
          <header className="auth-mobile-header flex items-center gap-3 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))] lg:hidden">
            <AppLogo size="md" variant="badge" />
            <div className="min-w-0">
              <p className="text-xl font-semibold tracking-tight text-[var(--auth-navy)]">
                {APP_NAME}
              </p>
              {chip && (
                <p className="text-xs font-medium text-[var(--auth-magenta)]">{chip}</p>
              )}
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div className="auth-form-card w-full max-w-md animate-in fade-in slide-in-from-right-3 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
