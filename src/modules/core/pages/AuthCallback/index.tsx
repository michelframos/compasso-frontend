import { Link } from 'react-router-dom'
import { Loader2, Music2 } from 'lucide-react'
import { useAuthCallback } from './hooks/useAuthCallback'

export const AuthCallbackPage: React.FC = () => {
  const { error } = useAuthCallback()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="p-2 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-200">
          <Music2 className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-zinc-900">Compasso</span>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 max-w-sm w-full text-center">
        {error ? (
          <>
            <p className="text-sm text-rose-600 font-medium mb-4">{error}</p>
            <Link
              to="/login"
              className="inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              Ir para o login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-zinc-700">Preparando seu acesso...</p>
            <p className="text-xs text-zinc-400 mt-1">Aguarde um instante.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallbackPage
