type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
type FullscreenDocument = Document & {
  webkitFullscreenEnabled?: boolean
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

/**
 * Tela cheia a partir de um gesto do usuário (precisa ser chamado antes de qualquer `await`).
 * Onde não há suporte (iPhone só permite em <video>), simplesmente não faz nada.
 */
export function enterFullscreen(el: HTMLElement | null | undefined): void {
  const target = el as FullscreenElement | null | undefined
  if (!target || fullscreenElement()) return
  try {
    const result = target.requestFullscreen
      ? target.requestFullscreen({ navigationUI: 'hide' })
      : target.webkitRequestFullscreen?.()
    Promise.resolve(result).catch(() => {})
  } catch {
    /* navegador sem suporte ou sem gesto */
  }
}

/** Se o navegador deixa a página entrar em tela cheia (no iPhone, não). */
export function canFullscreen(): boolean {
  const doc = document as FullscreenDocument
  return Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled)
}

/** Sai da tela cheia, se `el` (ou qualquer elemento, sem `el`) estiver nela. */
export function exitFullscreen(el?: HTMLElement | null): void {
  const current = fullscreenElement()
  if (!current || (el && current !== el)) return
  const doc = document as FullscreenDocument
  try {
    const result = doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen?.()
    Promise.resolve(result).catch(() => {})
  } catch {
    /* já saiu */
  }
}

function fullscreenElement(): Element | null {
  const doc = document as FullscreenDocument
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}
