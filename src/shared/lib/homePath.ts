const HOME_POR_ROLE: Record<string, string> = {
  professor: '/professor/inicio',
  aluno: '/aluno/inicio',
  responsavel: '/aluno/inicio',
}

/** Página inicial de cada papel após login, troca de instituição ou acesso negado. */
export function getHomePath(role?: string | null): string {
  return (role && HOME_POR_ROLE[role]) || '/dashboard'
}
