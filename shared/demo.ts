import { sampleText, type SampleId } from './samples.ts'
import type { AppLocale, VoiceGender } from './types/declaration.ts'

/**
 * Demonstração do "Ver um exemplo" (/d/demo, /en/d/demo-en). Diferente dos exemplos do assistente,
 * aqui a voz fala o nome de quem recebe: é o que mostra o produto no seu melhor.
 * Por isso o áudio é gerado à parte (public/audio/demo) e os exemplos seguem sem nomes.
 */
export interface Demo {
  id: string
  locale: AppLocale
  authorName: string
  partnerName: string
  voice: VoiceGender
  sample: SampleId
}

export const DEMOS: Record<AppLocale, Demo> = {
  'pt-BR': { id: 'demo', locale: 'pt-BR', authorName: 'Rafael', partnerName: 'Helena', voice: 'male', sample: 'lugar-favorito' },
  en: { id: 'demo-en', locale: 'en', authorName: 'Olivia', partnerName: 'Noah', voice: 'female', sample: 'primavera' },
}

/** "Desde que você… infinitamente!" → "Helena, desde que você… infinitamente, Helena!" */
export function withPartnerName(text: string, name: string): string {
  const trimmed = text.trim()
  // "I" em inglês continua maiúsculo depois da vírgula.
  const body = /^I\b/.test(trimmed) ? trimmed : trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
  return `${name}, ${body.replace(/([.!?])$/, `, ${name}$1`)}`
}

export function demoText(demo: Demo): string {
  return withPartnerName(sampleText(demo.sample, demo.locale, demo.voice), demo.partnerName)
}

export function demoAudioPath(demo: Demo): string {
  return `/audio/demo/${demo.id}-${demo.voice}.mp3`
}
