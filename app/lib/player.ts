import type { MusicStyle } from '#shared/types/declaration'

/** O que o player precisa para tocar uma declaração (prévia ou publicada). */
export interface PlayerDeclaration {
  authorName: string
  partnerName: string
  startDate: string | null
  text: string
  music: MusicStyle
  photoUrls: string[]
  audioUrl: string | null
}

export type PlayerMode = 'preview' | 'public'

/**
 * Duração da abertura do envelope (lacre → aba → carta → capa some).
 * Tem que bater com as transições de `PlayerCover.vue`; a apresentação começa depois dela.
 */
export const COVER_OPEN_MS = 5800

/** Espera depois de pedir tela cheia: no celular a troca de modo dá uma travada e comeria o começo da animação. */
export const FULLSCREEN_SETTLE_MS = 500

/** Som da carta saindo do envelope ("Paper slide", Mixkit, licença gratuita sem atribuição). */
export const PAPER_SOUND_URL = '/audio/sfx/paper-slide.mp3'

/** Quando o som toca, em segundos desde o início da animação: junto com a carta subindo. */
export const PAPER_SOUND_AT = 1.3

export interface SlideLayer {
  key: string
  url: string
  opacity: number
  /** 0 → 1 ao longo do slide; dirige o zoom lento (Ken Burns). */
  progress: number
  origin: string
}

/** Pontos de origem do zoom, alternados por slide para cada foto "andar" para um lado. */
const KEN_BURNS_ORIGINS = ['30% 35%', '70% 30%', '50% 70%', '25% 65%', '75% 60%', '50% 40%']

export function kenBurnsOrigin(slideIndex: number): string {
  return KEN_BURNS_ORIGINS[slideIndex % KEN_BURNS_ORIGINS.length]!
}
