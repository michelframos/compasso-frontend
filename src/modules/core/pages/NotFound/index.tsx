import React from 'react'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex p-3 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-100">
          <Compass className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Página não encontrada</h1>
        <p className="text-zinc-500 text-sm">O endereço acessado não existe ou foi movido.</p>
        <Link to="/" className="inline-block text-indigo-600 hover:text-indigo-700 font-medium text-sm">
          Ir para a página inicial
        </Link>
      </div>
    </div>
  )
}
