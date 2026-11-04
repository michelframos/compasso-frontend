/**
 * Converte path/URL do disco `public` do Laravel para uma URL carregável no frontend.
 * APP_URL do backend costuma diferir de VITE_API_URL (ex.: localhost vs 127.0.0.1:8000).
 */
export function urlArquivoPublico(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null
  if (
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('local:')
  ) {
    return pathOrUrl.startsWith('local:') ? null : pathOrUrl
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  let origin: string
  try {
    origin = new URL(apiBase).origin
  } catch {
    origin = 'http://127.0.0.1:8000'
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const atual = new URL(pathOrUrl)
      const idx = atual.pathname.indexOf('/storage/')
      if (idx >= 0) {
        return `${origin}${atual.pathname.slice(idx)}${atual.search}`
      }
      return pathOrUrl
    } catch {
      return pathOrUrl
    }
  }

  const path = pathOrUrl.replace(/^\/+/, '').replace(/^storage\//, '')
  return `${origin}/storage/${path}`
}
