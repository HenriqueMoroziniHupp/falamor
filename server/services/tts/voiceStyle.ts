import type { AppLocale } from '../../../shared/types/declaration.ts'

/**
 * Instrução de entrega enviada em `speech_metadata.style` (não é lida em voz alta).
 * Base: "voz romantica apaixonada em forma de declaração", testada no AI Studio.
 */
export const VOICE_STYLES: Record<AppLocale, string> = {
  'pt-BR':
    'voz romântica e apaixonada, em forma de declaração de amor, falando devagar, com ternura, um sorriso na voz e emoção sincera',
  en: 'romantic, passionate voice delivering a heartfelt love declaration, speaking slowly, tender and warm, with a smile in the voice and sincere emotion',
}

export const SPEECH_LANGUAGE: Record<AppLocale, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
}

/**
 * O texto vira transcrição literal. Removemos `< >` para a pessoa não injetar
 * tags de áudio sem querer e colocamos uma pausa curta entre parágrafos.
 */
export function buildTranscript(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join(' <short pause> ')
}
