/**
 * Linha do tempo da apresentação (estilo "Recordações" do Google Fotos).
 * Funções puras: recebem a duração da voz e a quantidade de fotos, devolvem quando
 * cada foto e cada legenda aparecem. Tudo em segundos, a partir do início do player.
 */

export const TITLE_DURATION = 3.5
export const VOICE_START = 3
export const VOICE_TAIL = 1.8
export const MIN_SLIDE = 3.5
export const MAX_SLIDE = 8
export const CROSSFADE = 1.2
/** Fala média usada quando não há áudio (sem chave de API ou erro de rede). */
export const FALLBACK_CHARS_PER_SECOND = 14

export interface Slide {
  photoIndex: number
  start: number
  duration: number
}

export interface Caption {
  text: string
  start: number
  end: number
}

export interface Timeline {
  voiceStart: number
  voiceEnd: number
  slides: Slide[]
  captions: Caption[]
  /** Quando o encerramento começa. */
  total: number
}

export function estimateSpeechDuration(text: string): number {
  return Math.max(6, text.trim().length / FALLBACK_CHARS_PER_SECOND)
}

function planSlides(photoCount: number, span: number): { slides: Slide[]; total: number } {
  if (photoCount <= 0) return { slides: [], total: span }

  const ideal = span / photoCount
  let count = photoCount
  let duration = ideal

  if (ideal < MIN_SLIDE) {
    duration = MIN_SLIDE
  } else if (ideal > MAX_SLIDE) {
    // Poucas fotos para muita fala: as fotos repetem em loop.
    count = Math.ceil(span / MAX_SLIDE)
    duration = span / count
  }

  const slides = Array.from({ length: count }, (_, i) => ({
    photoIndex: i % photoCount,
    start: i * duration,
    duration,
  }))
  return { slides, total: Math.max(span, count * duration) }
}

const SENTENCE_END = /(?<=[.!?…])\s+/
const MAX_CAPTION_CHARS = 110

/** Divide em frases e quebra as longas em vírgulas/ponto e vírgula para caberem na tela. */
export function splitCaptions(text: string): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(SENTENCE_END)
    .filter(Boolean)

  return sentences.flatMap((sentence) => {
    if (sentence.length <= MAX_CAPTION_CHARS) return [sentence]
    const parts = sentence.split(/(?<=[,;:])\s+/)
    const chunks: string[] = []
    let current = ''
    for (const part of parts) {
      const candidate = current ? `${current} ${part}` : part
      if (candidate.length > MAX_CAPTION_CHARS && current) {
        chunks.push(current)
        current = part
      } else {
        current = candidate
      }
    }
    if (current) chunks.push(current)
    return chunks
  })
}

/** Distribui as legendas ao longo da voz, proporcional ao tamanho (+ peso fixo de pausa). */
export function planCaptions(text: string, voiceStart: number, voiceDuration: number): Caption[] {
  const parts = splitCaptions(text)
  const PAUSE_WEIGHT = 6
  const weights = parts.map((p) => p.length + PAUSE_WEIGHT)
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1

  let cursor = voiceStart
  return parts.map((part, i) => {
    const length = (weights[i]! / totalWeight) * voiceDuration
    const caption = { text: part, start: cursor, end: cursor + length }
    cursor += length
    return caption
  })
}

export function buildTimeline({
  photoCount,
  voiceDuration,
  text,
}: {
  photoCount: number
  voiceDuration: number
  text: string
}): Timeline {
  const voiceEnd = VOICE_START + voiceDuration
  const { slides, total } = planSlides(photoCount, voiceEnd + VOICE_TAIL)
  return {
    voiceStart: VOICE_START,
    voiceEnd,
    slides,
    captions: planCaptions(text, VOICE_START, voiceDuration),
    total,
  }
}

export function activeCaptionIndex(captions: Caption[], time: number): number {
  return captions.findIndex((c) => time >= c.start && time < c.end)
}

/** Slides visíveis num instante: o atual e o anterior enquanto o atual entra em crossfade. */
export function visibleSlides(slides: Slide[], time: number): { slide: Slide; index: number; opacity: number; progress: number }[] {
  const result: { slide: Slide; index: number; opacity: number; progress: number }[] = []
  slides.forEach((slide, index) => {
    const end = slide.start + slide.duration + CROSSFADE
    const isLast = index === slides.length - 1
    if (time < slide.start || (time >= end && !isLast)) return
    const opacity = index === 0 ? 1 : Math.min(1, (time - slide.start) / CROSSFADE)
    const progress = Math.min(1, Math.max(0, (time - slide.start) / (slide.duration + CROSSFADE)))
    result.push({ slide, index, opacity, progress })
  })
  return result
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
