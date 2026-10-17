export const SUPPORTED_LOCALES = ['pt-BR', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const VOICE_GENDERS = ['female', 'male'] as const
export type VoiceGender = (typeof VOICE_GENDERS)[number]

export const MUSIC_STYLES = ['piano_warm', 'cinema_strings', 'starlight_box', 'serenade_pad'] as const
export type MusicStyle = (typeof MUSIC_STYLES)[number]

/** O que a pessoa escreve/escolhe no wizard (sem fotos nem áudio). */
export interface DeclarationContent {
  authorName: string
  partnerName: string
  /** `yyyy-mm-dd` ou null quando a pessoa não informou. */
  startDate: string | null
  text: string
  voice: VoiceGender
  music: MusicStyle
  locale: AppLocale
}

/** Declaração publicada, como a página pública `/d/[id]` recebe. */
export interface PublicDeclaration extends DeclarationContent {
  id: string
  photoUrls: string[]
  /** Capa 1200×630 para o og:image. */
  coverUrl: string
  /** Null quando a voz ainda não existe (o player toca só trilha + legendas). */
  audioUrl: string | null
  createdAt: string
  expiresAt: string
}

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function isVoiceGender(value: unknown): value is VoiceGender {
  return typeof value === 'string' && (VOICE_GENDERS as readonly string[]).includes(value)
}

export function isMusicStyle(value: unknown): value is MusicStyle {
  return typeof value === 'string' && (MUSIC_STYLES as readonly string[]).includes(value)
}
