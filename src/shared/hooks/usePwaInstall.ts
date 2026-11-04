import { useCallback, useEffect, useState } from 'react'

const DISMISS_KEY = 'compasso:pwa-install-dismissed'

function jaInstalado() {
  if (typeof window === 'undefined') return false
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return standalone || iosStandalone
}

function ehIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function usePwaInstall() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const [instalado, setInstalado] = useState(jaInstalado)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setEvento(e)
    }
    const onInstalled = () => {
      setInstalado(true)
      setEvento(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!evento) return false
    await evento.prompt()
    const escolha = await evento.userChoice
    setEvento(null)
    if (escolha.outcome === 'accepted') {
      setInstalado(true)
      return true
    }
    return false
  }, [evento])

  const ios = ehIos()
  const visivel = !instalado && !dismissed && (evento !== null || ios)

  return {
    visivel,
    podePromptNativo: evento !== null,
    ios,
    instalar,
    dismiss,
  }
}
