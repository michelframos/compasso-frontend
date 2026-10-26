import { Download, Share, X } from 'lucide-react'
import { usePwaInstall } from '@/shared/hooks/usePwaInstall'

export function PwaInstallPrompt() {
  const { visivel, podePromptNativo, ios, instalar, dismiss } = usePwaInstall()

  if (!visivel) return null

  return (
    <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-3">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Download className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-indigo-950">Instalar o Compasso</p>
          {ios && !podePromptNativo ? (
            <p className="mt-1 text-xs leading-relaxed text-indigo-800">
              No iPhone ou iPad, toque em <Share className="inline h-3.5 w-3.5" aria-hidden /> Compartilhar e depois em
              “Adicionar à Tela de Início”.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-indigo-800">
              Use como app no celular: agenda, materiais e financeiro ficam disponíveis offline.
            </p>
          )}
          {podePromptNativo && (
            <button
              type="button"
              onClick={() => void instalar()}
              className="mt-2 h-8 rounded-full bg-indigo-600 px-3 text-xs font-bold text-white"
            >
              Instalar
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-indigo-700 hover:bg-indigo-100"
          aria-label="Dispensar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
