const HOME_POR_ROLE: Record<string, string> = {
  professor: '/professor/inicio',
  aluno: '/aluno/inicio',
  responsavel: '/aluno/inicio',
}

const LOGIN_POR_ROLE: Record<string, string> = {
  aluno: '/aluno/login',
  responsavel: '/aluno/login',
}

/** Página inicial de cada papel após login, troca de instituição ou acesso negado. */
export function getHomePath(role?: string | null): string {
  return (role && HOME_POR_ROLE[role]) || '/dashboard'
}

/** Tela de login adequada ao papel (aluno/responsável usam rota própria). */
export function getLoginPath(role?: string | null): string {
  return (role && LOGIN_POR_ROLE[role]) || '/login'
}
