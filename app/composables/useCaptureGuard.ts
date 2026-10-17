import type { MaybeRefOrGetter } from 'vue'
import { useEventListener } from '@vueuse/core'

interface CaptureGuardOptions {
  /** Prévia: proteção completa. Página publicada: só pausa ao sair da aba. */
  strict: MaybeRefOrGetter<boolean>
  /** Chamado quando a tela deve ser escondida/pausada. */
  onConceal: () => void
}

/**
 * Barreiras contra print/gravação da prévia.
 * Limite honesto: o navegador não enxerga o gravador de tela do sistema
 * (iOS/Android/OBS) nem uma câmera apontada — por isso a marca d'água existe.
 */
export function useCaptureGuard({ strict, onConceal }: CaptureGuardOptions) {
  const veiled = shallowRef(false)
  const flash = shallowRef(false)
  let flashTimer: ReturnType<typeof setTimeout> | undefined

  function conceal() {
    if (toValue(strict)) veiled.value = true
    onConceal()
  }

  function reveal() {
    veiled.value = false
  }

  function blackout() {
    navigator.clipboard?.writeText('').catch(() => {})
    flash.value = true
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => (flash.value = false), 1200)
    conceal()
  }

  function onKey(event: KeyboardEvent) {
    if (!toValue(strict)) return
    const key = event.key.toLowerCase()
    if (key === 'printscreen') {
      event.preventDefault()
      blackout()
      return
    }
    // Imprimir / salvar página.
    if ((event.ctrlKey || event.metaKey) && (key === 'p' || key === 's')) {
      event.preventDefault()
      return
    }
    // Atalhos de captura do macOS (Cmd+Shift+3/4/5) e Win+Shift+S chegam às vezes antes do SO agir.
    if (event.shiftKey && (event.metaKey || event.ctrlKey) && ['3', '4', '5', 's'].includes(key)) blackout()
  }

  if (import.meta.client) {
    useEventListener(window, 'keydown', onKey, { capture: true })
    useEventListener(window, 'keyup', (e: KeyboardEvent) => {
      if (toValue(strict) && e.key === 'PrintScreen') blackout()
    })
    useEventListener(window, 'blur', () => {
      if (toValue(strict)) conceal()
    })
    useEventListener(document, 'visibilitychange', () => {
      if (document.hidden) conceal()
    })

    watchEffect(() => document.documentElement.classList.toggle('capture-guard', toValue(strict)))
    onScopeDispose(() => {
      clearTimeout(flashTimer)
      document.documentElement.classList.remove('capture-guard')
    })
  }

  return { veiled, flash, reveal }
}
