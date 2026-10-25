import React from 'react'
import { Loader2 } from 'lucide-react'
import { AlterarSenhaCard } from './components/AlterarSenhaCard'
import { DadosPessoaisForm } from './components/DadosPessoaisForm'
import { FotoPerfilCard } from './components/FotoPerfilCard'
import { useMeuPerfil } from './hooks/useMeuPerfil'

export const MeuPerfilPage: React.FC = () => {
  const {
    perfil,
    isLoading,
    isSaving,
    form,
    salvar,
    estados,
    cidades,
    estadoSelecionado,
    isLoadingCidades,
    buscarCep,
    isBuscandoCep,
    aplicarPerfil,
  } = useMeuPerfil()

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Meu <span className="text-indigo-600">perfil</span>
        </h1>
        <p className="text-zinc-500 text-[14px]">Mantenha seus dados de contato e sua senha atualizados.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando perfil...</span>
        </div>
      ) : !perfil ? (
        <p className="text-sm text-zinc-500">Não foi possível carregar o seu perfil.</p>
      ) : (
        <>
          <FotoPerfilCard perfil={perfil} onAtualizado={aplicarPerfil} />
          <DadosPessoaisForm
            form={form}
            onSalvar={salvar}
            isSaving={isSaving}
            estados={estados}
            cidades={cidades}
            estadoSelecionado={estadoSelecionado}
            isLoadingCidades={isLoadingCidades}
            onBuscarCep={buscarCep}
            isBuscandoCep={isBuscandoCep}
          />
          <AlterarSenhaCard />
        </>
      )}
    </div>
  )
}

export default MeuPerfilPage
