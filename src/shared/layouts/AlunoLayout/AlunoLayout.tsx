import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Award, BookOpen, CalendarDays, ClipboardCheck, FileText, FolderOpen, GraduationCap, Guitar, Home, LogOut, Music, Ruler, Wallet } from 'lucide-react'
import { logout as logoutApi } from '@/modules/core/api/auth'
import { useDependentes } from '@/modules/aluno/hooks/useDependentes'
import { OfflineBanner } from '@/shared/components/OfflineBanner'
import { PwaInstallPrompt } from '@/shared/components/PwaInstallPrompt'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import { useAuthStore } from '@/shared/store/useAuthStore'

export const AlunoLayout: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const financeiro = useHasModulo('financeiro')
  const espetaculos = useHasModulo('espetaculos')
  const instrumentos = useHasModulo('instrumentos')
  const { responsavel, dependentes, idAluno, setIdAluno, pronto } = useDependentes()
  const nome = user?.nome || user?.name || 'Aluno'
  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')
  const itens = [
    { to: '/aluno/inicio', icon: Home, label: 'Início' },
    { to: '/aluno/agenda', icon: CalendarDays, label: 'Agenda' },
    { to: '/aluno/frequencia', icon: ClipboardCheck, label: 'Frequência' },
    { to: '/aluno/boletim', icon: BookOpen, label: 'Boletim' },
    { to: '/aluno/materiais', icon: FolderOpen, label: 'Materiais' },
    ...(financeiro ? [{ to: '/aluno/financeiro', icon: Wallet, label: 'Financeiro' }] : []),
    ...(espetaculos
      ? [
          { to: '/aluno/apresentacoes', icon: Music, label: 'Peças' },
          { to: '/aluno/medidas', icon: Ruler, label: 'Medidas' },
        ]
      : []),
    ...(instrumentos ? [{ to: '/aluno/instrumentos', icon: Guitar, label: 'Instrumentos' }] : []),
    { to: '/aluno/contratos', icon: FileText, label: 'Contratos' },
    { to: '/aluno/certificados', icon: Award, label: 'Certificados' },
    { to: '/aluno/matriculas', icon: GraduationCap, label: 'Matrículas' },
  ]

  const sair = async () => {
    try {
      await logoutApi()
    } catch {
      // A sessão local é encerrada mesmo se a rede falhar.
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <Link to="/aluno/perfil" className="flex min-w-0 items-center gap-2.5" title="Meu perfil">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
            {user?.foto_url ? <img src={user.foto_url} alt="" className="h-full w-full object-cover" /> : iniciais}
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Meu perfil</span>
            <span className="block truncate text-sm font-bold">{nome}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={sair}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {responsavel && (
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto px-4 py-2">
            {dependentes.length === 0 ? (
              <p className="py-1 text-sm text-zinc-500">Nenhum aluno vinculado.</p>
            ) : (
              dependentes.map((dependente) => (
                <button
                  key={dependente.id}
                  type="button"
                  onClick={() => setIdAluno(dependente.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    idAluno === dependente.id ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {dependente.nome}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <OfflineBanner />
      <PwaInstallPrompt />

      <main className="mx-auto w-full max-w-lg px-4 py-5 pb-24">
        {pronto ? <Outlet /> : <p className="py-16 text-center text-sm text-zinc-400">Carregando...</p>}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white">
        <ul className="mx-auto flex max-w-lg">
          {itens.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2 text-[11px] font-semibold ${
                    isActive ? 'text-indigo-600' : 'text-zinc-400'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
