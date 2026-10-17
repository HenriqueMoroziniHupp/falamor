import type { VoiceGender } from './types/declaration.ts'

/**
 * Configuração do produto. Não é segredo e não muda por ambiente, então fica no código
 * (e não no .env): app, servidor e o script de áudios leem daqui.
 * Segredos e o que muda por ambiente (chave do Gemini, URL do site) seguem no runtimeConfig.
 */
export const APP_CONFIG = {
  tts: {
    /** Modelo do Gemini TTS. Trocou? Rode `samples:generate -- --force` (a chave de cache inclui o modelo). */
    model: 'gemini-3.8-flash-lite-tts',
    /** Vozes pré-definidas do Gemini (não aparecem na interface). Trocou? Rode `samples:generate -- --force`. */
    voices: {
      female: 'Sulafat',
      male: 'Algieba',
    } satisfies Record<VoiceGender, string>,
    /** Gerações novas por IP por hora (cache não conta). */
    rateLimitPerHour: 20,
  },
  declaration: {
    /** Dias que uma declaração publicada fica no ar (ADR 0010). */
    ttlDays: 7,
    maxPhotos: 10,
    maxChars: 1000,
  },
} as const
