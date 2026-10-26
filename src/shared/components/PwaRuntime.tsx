import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

/** Registra o service worker em toda a aplicação e oferece atualização quando houver nova versão. */
export function PwaRuntime() {
  const {
    needRefresh: [precisaAtualizar, setPrecisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      setInterval(() => {
        void registration.update()
      }, 60 * 60 * 1000)
    },
  })

  if (!precisaAtualizar) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 print:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
        <RefreshCw className="h-4 w-4 shrink-0 text-indigo-600" />
        <p className="min-w-0 flex-1 text-xs font-semibold text-zinc-700">Há uma nova versão do app.</p>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="h-8 shrink-0 rounded-full bg-indigo-600 px-3 text-xs font-bold text-white"
        >
          Atualizar
        </button>
        <button
          type="button"
          onClick={() => setPrecisaAtualizar(false)}
          className="h-8 shrink-0 rounded-full px-2 text-xs font-bold text-zinc-500"
        >
          Depois
        </button>
      </div>
    </div>
  )
}
