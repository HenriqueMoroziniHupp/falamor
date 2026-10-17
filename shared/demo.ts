import { sampleText } from './samples.ts'

/**
 * Demonstração do "Ver um exemplo" (/d/demo). Diferente dos exemplos do assistente,
 * aqui a voz fala o nome de quem recebe: é o que mostra o produto no seu melhor.
 * Por isso o áudio é gerado à parte (public/audio/demo) e os exemplos seguem sem nomes.
 */
export const DEMO_PARTNER_NAME = 'Helena'
export const DEMO_AUDIO_PATH = '/audio/demo/demo-pt-BR-male.mp3'

/** "Desde que você… infinitamente!" → "Helena, desde que você… infinitamente, Helena!" */
export function withPartnerName(text: string, name: string): string {
  const trimmed = text.trim()
  const body = trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
  return `${name}, ${body.replace(/([.!?])$/, `, ${name}$1`)}`
}

export function demoText(): string {
  return withPartnerName(sampleText('lugar-favorito', 'pt-BR', 'male'), DEMO_PARTNER_NAME)
}
