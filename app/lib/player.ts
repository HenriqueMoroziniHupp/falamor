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
