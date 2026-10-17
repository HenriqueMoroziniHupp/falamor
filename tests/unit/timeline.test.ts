import { describe, expect, it } from 'vitest'
import {
  CROSSFADE,
  MAX_SLIDE,
  MIN_SLIDE,
  VOICE_START,
  VOICE_TAIL,
  activeCaptionIndex,
  buildTimeline,
  planCaptions,
  splitCaptions,
  visibleSlides,
} from '../../app/lib/timeline'

const TEXT =
  'Desde que você entrou na minha vida, cada dia ganhou uma cor diferente. Obrigado por tudo! Eu te amo infinitamente!'

describe('splitCaptions', () => {
  it('splits by sentence', () => {
    expect(splitCaptions(TEXT)).toEqual([
      'Desde que você entrou na minha vida, cada dia ganhou uma cor diferente.',
      'Obrigado por tudo!',
      'Eu te amo infinitamente!',
    ])
  })

  it('breaks long sentences at commas so they fit on screen', () => {
    const long = `${'Uma frase bem comprida, '.repeat(8)}que termina aqui.`
    const parts = splitCaptions(long)
    expect(parts.length).toBeGreaterThan(1)
    for (const part of parts) expect(part.length).toBeLessThanOrEqual(110)
    expect(parts.join(' ')).toBe(long.trim())
  })
})

describe('planCaptions', () => {
  it('covers the whole voice window without gaps', () => {
    const captions = planCaptions(TEXT, VOICE_START, 12)
    expect(captions[0]!.start).toBe(VOICE_START)
    expect(captions.at(-1)!.end).toBeCloseTo(VOICE_START + 12)
    for (let i = 1; i < captions.length; i++) expect(captions[i]!.start).toBeCloseTo(captions[i - 1]!.end)
  })

  it('gives longer sentences more time', () => {
    const [long, short] = planCaptions(TEXT, 0, 12)
    expect(long!.end - long!.start).toBeGreaterThan(short!.end - short!.start)
  })

  it('finds the active caption', () => {
    const captions = planCaptions(TEXT, VOICE_START, 12)
    expect(activeCaptionIndex(captions, 0)).toBe(-1)
    expect(activeCaptionIndex(captions, VOICE_START + 0.1)).toBe(0)
    expect(activeCaptionIndex(captions, VOICE_START + 12.5)).toBe(-1)
  })
})

describe('buildTimeline', () => {
  it('spreads photos across the voice when the pace is comfortable', () => {
    const tl = buildTimeline({ photoCount: 3, voiceDuration: 15, text: TEXT })
    const span = VOICE_START + 15 + VOICE_TAIL
    expect(tl.slides).toHaveLength(3)
    expect(tl.slides[0]!.duration).toBeCloseTo(span / 3)
    expect(tl.total).toBeCloseTo(span)
  })

  it('loops photos when there are few photos for a long voice', () => {
    const tl = buildTimeline({ photoCount: 2, voiceDuration: 40, text: TEXT })
    expect(tl.slides.length).toBeGreaterThan(2)
    for (const slide of tl.slides) expect(slide.duration).toBeLessThanOrEqual(MAX_SLIDE)
    expect(tl.slides.map((s) => s.photoIndex).slice(0, 4)).toEqual([0, 1, 0, 1])
  })

  it('keeps a minimum time per photo and extends past the voice when there are many photos', () => {
    const tl = buildTimeline({ photoCount: 10, voiceDuration: 10, text: TEXT })
    expect(tl.slides).toHaveLength(10)
    for (const slide of tl.slides) expect(slide.duration).toBe(MIN_SLIDE)
    expect(tl.total).toBe(10 * MIN_SLIDE)
    expect(tl.total).toBeGreaterThan(tl.voiceEnd)
  })
})

describe('visibleSlides', () => {
  const { slides } = buildTimeline({ photoCount: 3, voiceDuration: 15, text: TEXT })

  it('shows only the first slide at the start', () => {
    expect(visibleSlides(slides, 0).map((v) => v.index)).toEqual([0])
  })

  it('crossfades into the next slide', () => {
    const t = slides[1]!.start + CROSSFADE / 2
    const visible = visibleSlides(slides, t)
    expect(visible.map((v) => v.index)).toEqual([0, 1])
    expect(visible[1]!.opacity).toBeCloseTo(0.5)
  })

  it('keeps the last slide on screen after the end', () => {
    expect(visibleSlides(slides, 999).map((v) => v.index)).toEqual([2])
  })
})
