import type { MaybeRefOrGetter } from 'vue'
import type { MusicStyle } from '#shared/types/declaration'
import { RomanticAudioEngine } from '~/lib/audio/RomanticAudioEngine'
import { buildTimeline, estimateSpeechDuration, type Timeline } from '~/lib/timeline'

export interface PlaybackSource {
  audioUrl: string | null
  text: string
  photoCount: number
  music: MusicStyle
}

export type PlaybackStatus = 'preparing' | 'ready' | 'playing' | 'paused' | 'ended'

/** Depois do fim, a trilha continua no encerramento e some devagar. */
const OUTRO_MUSIC_SECONDS = 35

/**
 * Orquestra trilha + voz + linha do tempo no MESMO AudioContext.
 * O tempo da apresentação é `ctx.currentTime`, então pausar (suspend) congela
 * fotos, legendas, voz e música juntas, sem dessincronizar.
 */
export function usePlayback(source: MaybeRefOrGetter<PlaybackSource>) {
  const status = shallowRef<PlaybackStatus>('preparing')
  const elapsed = shallowRef(0)
  const timeline = shallowRef<Timeline | null>(null)
  const muted = shallowRef(false)
  const hasVoice = shallowRef(false)

  let engine: RomanticAudioEngine | null = null
  let voiceBuffer: AudioBuffer | null = null
  let voiceNode: AudioBufferSourceNode | null = null
  let startAt = 0
  let frame = 0
  let outroTimer: ReturnType<typeof setTimeout> | null = null
  const sounds = new Map<string, Promise<AudioBuffer | null>>()

  async function prepare() {
    status.value = 'preparing'
    engine ??= new RomanticAudioEngine()
    const ctx = engine.ensureContext()
    const { audioUrl, text, photoCount } = toValue(source)

    voiceBuffer = null
    if (audioUrl) {
      try {
        const response = await fetch(audioUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        voiceBuffer = await ctx.decodeAudioData(await response.arrayBuffer())
      } catch (error) {
        // Sem voz (asset ainda não gerado, rede…): toca trilha + legendas no tempo estimado.
        console.warn('[player] voice unavailable, playing without it', error)
      }
    }

    hasVoice.value = Boolean(voiceBuffer)
    timeline.value = buildTimeline({
      photoCount,
      text,
      voiceDuration: voiceBuffer?.duration ?? estimateSpeechDuration(text),
    })
    status.value = 'ready'
  }

  function stopVoice() {
    try {
      voiceNode?.stop()
    } catch {
      /* já parou */
    }
    voiceNode?.disconnect()
    voiceNode = null
  }

  function tick() {
    const ctx = engine?.ctx
    if (!ctx) return
    elapsed.value = Math.max(0, ctx.currentTime - startAt)
    if (status.value === 'playing' && timeline.value && elapsed.value >= timeline.value.total) {
      status.value = 'ended'
      outroTimer = setTimeout(() => engine?.stop(6), OUTRO_MUSIC_SECONDS * 1000)
    }
    frame = requestAnimationFrame(tick)
  }

  /**
   * Precisa vir de um toque/clique (política de autoplay dos navegadores).
   * A trilha começa já; voz, fotos e legendas esperam `delay` segundos (a abertura do envelope).
   */
  async function start(delay = 0.15) {
    if (!engine || !timeline.value) return
    await engine.resume()
    const ctx = engine.ctx!
    const tl = timeline.value

    stopVoice()
    if (outroTimer) clearTimeout(outroTimer)
    startAt = ctx.currentTime + delay
    elapsed.value = 0

    engine.play(toValue(source).music)
    if (voiceBuffer) {
      const node = ctx.createBufferSource()
      node.buffer = voiceBuffer
      node.connect(engine.voiceOutput)
      node.start(startAt + tl.voiceStart)
      voiceNode = node
      engine.scheduleDuck(startAt + tl.voiceStart - 0.5, startAt + tl.voiceEnd + 0.3)
    }

    status.value = 'playing'
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(tick)
  }

  async function pause() {
    if (status.value !== 'playing') return
    await engine?.suspend()
    status.value = 'paused'
  }

  async function resume() {
    if (status.value !== 'paused') return
    await engine?.resume()
    status.value = 'playing'
  }

  async function replay() {
    stopVoice()
    engine?.stop(0.4)
    await new Promise((r) => setTimeout(r, 450))
    await start()
  }

  /** Baixa e decodifica um efeito curto antes do toque, para tocar sem atraso. */
  function preloadSound(url: string): Promise<AudioBuffer | null> {
    let buffer = sounds.get(url)
    if (!buffer) {
      engine ??= new RomanticAudioEngine()
      const ctx = engine.ensureContext()
      buffer = fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return response.arrayBuffer()
        })
        .then((data) => ctx.decodeAudioData(data))
        .catch((error) => {
          console.warn('[player] sound effect unavailable', url, error)
          return null
        })
      sounds.set(url, buffer)
    }
    return buffer
  }

  /** Efeito no mesmo AudioContext, `delay` segundos a partir de agora (respeita o mudo, sem ducking). */
  async function playSound(url: string, delay = 0) {
    const ctx = engine?.ctx
    if (!ctx) return
    const at = ctx.currentTime + delay
    const buffer = await preloadSound(url)
    if (!buffer || !engine?.ctx) return
    const node = ctx.createBufferSource()
    node.buffer = buffer
    node.connect(engine.voiceOutput)
    node.start(Math.max(at, ctx.currentTime))
  }

  function toggleMute() {
    muted.value = !muted.value
    engine?.setMuted(muted.value)
  }

  onScopeDispose(() => {
    cancelAnimationFrame(frame)
    if (outroTimer) clearTimeout(outroTimer)
    stopVoice()
    void engine?.dispose()
    engine = null
  })

  return { status, elapsed, timeline, muted, hasVoice, prepare, start, pause, resume, replay, toggleMute, preloadSound, playSound }
}
