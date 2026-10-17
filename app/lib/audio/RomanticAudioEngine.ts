import type { MusicStyle } from '#shared/types/declaration'

type Chord = readonly number[]

interface StyleBus {
  /** Entrada do estilo atual; fazer fade nela faz o crossfade entre trilhas. */
  input: GainNode
}

interface NoteOptions {
  bus: StyleBus
  type?: OscillatorType
  gain: number
  filter?: number
  detuneCents?: number
}

/** Duração de cada acorde por estilo (andamento lento, romântico). */
const BAR_SECONDS: Record<MusicStyle, number> = {
  piano_warm: 4,
  cinema_strings: 5,
  starlight_box: 4,
  serenade_pad: 4.5,
}

/** Quanto de reverb/eco cada estilo manda para os efeitos. */
const SENDS: Record<MusicStyle, { reverb: number; echo: number }> = {
  piano_warm: { reverb: 0.35, echo: 0 },
  cinema_strings: { reverb: 0.55, echo: 0 },
  starlight_box: { reverb: 0.4, echo: 0.32 },
  serenade_pad: { reverb: 0.45, echo: 0.08 },
}

/** Agenda com folga para aguentar o timer lento de abas em segundo plano. */
const SCHEDULE_AHEAD = 1.6
const TICK_MS = 200
/** Volume da trilha enquanto a voz fala. */
const DUCK_RATIO = 0.5

function enablePlaybackSession() {
  // iOS: toca mesmo com a chave de silencioso ligada (Safari 16.4+).
  const nav = navigator as Navigator & { audioSession?: { type: string } }
  try {
    if (nav.audioSession) nav.audioSession.type = 'playback'
  } catch {
    /* navegador sem suporte */
  }
}

function createImpulse(ctx: BaseAudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds)
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
  }
  return impulse
}

/**
 * Trilha de fundo sem direitos autorais, gerada ao vivo com Web Audio API.
 * Baseada no motor original do prompt (mesmas progressões), completada com
 * agendamento antecipado, timbre por estilo, reverb, eco, crossfade e ducking.
 */
export class RomanticAudioEngine {
  ctx: AudioContext | null = null
  isPlaying = false
  style: MusicStyle = 'piano_warm'
  userVolume = 0.96
  isDucked = false

  private masterGain: GainNode | null = null
  private output: GainNode | null = null
  private reverbInput: GainNode | null = null
  private echoInput: GainNode | null = null
  private bus: StyleBus | null = null
  private loopTimer: ReturnType<typeof setInterval> | null = null
  private step = 0
  private nextBarTime = 0

  readonly progressions: Record<MusicStyle, Chord[]> = {
    piano_warm: [
      [174.61, 220.0, 261.63, 349.23, 440.0], // F maj7
      [130.81, 196.0, 246.94, 329.63, 392.0], // C maj7
      [146.83, 220.0, 261.63, 349.23, 523.25], // Dm7
      [116.54, 174.61, 220.0, 293.66, 440.0], // Bb maj7
    ],
    cinema_strings: [
      [130.81, 196.0, 261.63, 329.63, 493.88], // Cmaj7
      [164.81, 246.94, 329.63, 392.0, 587.33], // Em7
      [174.61, 220.0, 261.63, 349.23, 523.25], // Fmaj9
      [196.0, 246.94, 293.66, 392.0, 587.33], // G6
    ],
    starlight_box: [
      [261.63, 329.63, 392.0, 523.25, 659.25],
      [220.0, 261.63, 329.63, 440.0, 659.25],
      [174.61, 261.63, 349.23, 440.0, 523.25],
      [196.0, 293.66, 392.0, 493.88, 587.33],
    ],
    serenade_pad: [
      [110.0, 164.81, 220.0, 277.18, 329.63], // A maj
      [123.47, 185.0, 246.94, 329.63, 369.99], // B sus
      [146.83, 220.0, 277.18, 369.99, 440.0], // D maj7
      [164.81, 246.94, 329.63, 415.3, 493.88], // E maj
    ],
  }

  /** Cria o contexto (fica "suspended" até um toque do usuário chamar `resume`). */
  ensureContext(): AudioContext {
    if (this.ctx) return this.ctx

    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtor()

    const output = ctx.createGain()
    output.connect(ctx.destination)

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.ratio.value = 3
    compressor.connect(output)

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(compressor)

    const reverb = ctx.createConvolver()
    reverb.buffer = createImpulse(ctx, 3, 2.4)
    const reverbInput = ctx.createGain()
    reverbInput.connect(reverb).connect(master)

    const echoInput = ctx.createGain()
    const delay = ctx.createDelay(2)
    delay.delayTime.value = 0.375
    const feedback = ctx.createGain()
    feedback.gain.value = 0.32
    const echoTone = ctx.createBiquadFilter()
    echoTone.type = 'lowpass'
    echoTone.frequency.value = 2800
    echoInput.connect(delay)
    delay.connect(echoTone)
    echoTone.connect(feedback).connect(delay)
    echoTone.connect(master)

    this.ctx = ctx
    this.output = output
    this.masterGain = master
    this.reverbInput = reverbInput
    this.echoInput = echoInput
    return ctx
  }

  /** Destino da voz: não sofre ducking, mas respeita o mudo. */
  get voiceOutput(): AudioNode {
    this.ensureContext()
    return this.output!
  }

  /** Precisa ser chamado dentro de um gesto do usuário (política de autoplay). */
  async resume(): Promise<void> {
    enablePlaybackSession()
    const ctx = this.ensureContext()
    if (ctx.state !== 'running') await ctx.resume()
  }

  async suspend(): Promise<void> {
    if (this.ctx?.state === 'running') await this.ctx.suspend()
  }

  play(style: MusicStyle = this.style): void {
    const ctx = this.ensureContext()
    if (this.isPlaying) {
      this.setStyle(style)
      return
    }
    this.style = style
    this.isPlaying = true
    this.bus = this.createBus(style, 1)
    this.step = 0
    this.nextBarTime = ctx.currentTime + 0.08

    const gain = this.masterGain!.gain
    const now = ctx.currentTime
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(this.targetVolume(), now + 2.5)

    this.tick()
    this.loopTimer = setInterval(() => this.tick(), TICK_MS)
  }

  stop(fadeSeconds = 1.2): void {
    if (!this.ctx || !this.isPlaying) return
    this.isPlaying = false
    if (this.loopTimer) clearInterval(this.loopTimer)
    this.loopTimer = null

    const now = this.ctx.currentTime
    const gain = this.masterGain!.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(0, now + Math.max(0.02, fadeSeconds))

    const bus = this.bus
    this.bus = null
    setTimeout(() => bus?.input.disconnect(), (fadeSeconds + 0.3) * 1000)
  }

  /** Troca de trilha com crossfade, sem parar a música. */
  setStyle(style: MusicStyle): void {
    if (style === this.style && this.bus) return
    this.style = style
    if (!this.ctx || !this.isPlaying) return

    const now = this.ctx.currentTime
    const old = this.bus
    if (old) {
      old.input.gain.setTargetAtTime(0, now, 0.4)
      setTimeout(() => old.input.disconnect(), 2600)
    }
    this.bus = this.createBus(style, 0)
    this.bus.input.gain.setTargetAtTime(1, now, 0.5)
    this.step = 0
    this.nextBarTime = now + 0.05
    this.tick()
  }

  setVolume(volume: number): void {
    this.userVolume = Math.min(1, Math.max(0, volume))
    this.rampVolume()
  }

  /** Abaixa a trilha enquanto a voz fala. `at` permite agendar no relógio do áudio. */
  duck(on: boolean, at?: number): void {
    this.isDucked = on
    this.rampVolume(at)
  }

  /** Agenda o ducking para toda a fala de uma vez (início e fim no relógio do áudio). */
  scheduleDuck(start: number, end: number): void {
    if (!this.masterGain) return
    const gain = this.masterGain.gain
    gain.setTargetAtTime(this.userVolume * DUCK_RATIO, start, 0.35)
    gain.setTargetAtTime(this.userVolume, end, 0.6)
  }

  setMuted(muted: boolean): void {
    if (!this.ctx || !this.output) return
    this.output.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05)
  }

  async dispose(): Promise<void> {
    this.stop(0)
    const ctx = this.ctx
    this.ctx = null
    this.masterGain = null
    this.output = null
    this.bus = null
    if (ctx && ctx.state !== 'closed') await ctx.close()
  }

  // ── agendamento ────────────────────────────────────────────────────────────

  private targetVolume(): number {
    return this.userVolume * (this.isDucked ? DUCK_RATIO : 1)
  }

  private rampVolume(at?: number): void {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return
    const when = Math.max(at ?? 0, this.ctx.currentTime)
    this.masterGain.gain.setTargetAtTime(this.targetVolume(), when, 0.35)
  }

  private createBus(style: MusicStyle, initialGain: number): StyleBus {
    const ctx = this.ctx!
    const input = ctx.createGain()
    input.gain.value = initialGain
    input.connect(this.masterGain!)

    const reverbSend = ctx.createGain()
    reverbSend.gain.value = SENDS[style].reverb
    input.connect(reverbSend).connect(this.reverbInput!)

    if (SENDS[style].echo > 0) {
      const echoSend = ctx.createGain()
      echoSend.gain.value = SENDS[style].echo
      input.connect(echoSend).connect(this.echoInput!)
    }
    return { input }
  }

  private tick(): void {
    const ctx = this.ctx
    if (!ctx || !this.isPlaying || !this.bus) return

    // Aba ficou congelada: não agenda notas no passado (sairiam todas de uma vez).
    if (this.nextBarTime < ctx.currentTime - 0.1) this.nextBarTime = ctx.currentTime + 0.05

    const bar = BAR_SECONDS[this.style]
    const chords = this.progressions[this.style]
    while (this.nextBarTime < ctx.currentTime + SCHEDULE_AHEAD) {
      const chord = chords[this.step % chords.length]!
      this.scheduleBar(chord, this.nextBarTime, bar, this.bus)
      this.nextBarTime += bar
      this.step++
    }
  }

  private scheduleBar(chord: Chord, t: number, bar: number, bus: StyleBus): void {
    const n = (i: number) => chord[i]!
    const human = () => (Math.random() - 0.5) * 0.02
    const velocity = () => 0.8 + Math.random() * 0.2

    switch (this.style) {
      case 'piano_warm': {
        this.pluck(n(0), t, 3.6, { bus, type: 'triangle', gain: 0.3, filter: 900 })
        this.pluck(n(1), t, 3, { bus, type: 'sine', gain: 0.09 })
        this.pluck(n(2), t, 3, { bus, type: 'sine', gain: 0.08 })
        const pattern = [1, 2, 3, 4, 3, 2, 3, 4]
        pattern.forEach((idx, i) => {
          const at = t + i * (bar / pattern.length) + human()
          const v = velocity()
          this.pluck(n(idx), at, 2.2, { bus, type: 'triangle', gain: 0.14 * v, filter: 2400 })
          this.pluck(n(idx) * 2, at, 0.9, { bus, type: 'sine', gain: 0.025 * v })
        })
        break
      }
      case 'cinema_strings': {
        for (let i = 0; i < 4; i++) {
          this.pad(n(i), t, bar, { bus, type: 'sawtooth', gain: 0.032, filter: 1100, detuneCents: 7 })
          this.pad(n(i), t, bar, { bus, type: 'sawtooth', gain: 0.032, filter: 1100, detuneCents: -7 })
        }
        this.pad(n(0) / 2, t, bar, { bus, type: 'sine', gain: 0.12 })
        this.pad(n(4), t + bar * 0.45, bar * 0.55, { bus, type: 'sine', gain: 0.05 })
        break
      }
      case 'starlight_box': {
        const pattern = [0, 2, 4, 2, 3, 1, 2, 4]
        pattern.forEach((idx, i) => {
          const at = t + i * (bar / pattern.length) + human()
          const v = velocity()
          this.pluck(n(idx) * 2, at, 1.7, { bus, type: 'sine', gain: 0.1 * v })
          this.pluck(n(idx) * 8, at, 0.35, { bus, type: 'sine', gain: 0.012 * v })
        })
        this.pad(n(0) / 2, t, bar, { bus, type: 'sine', gain: 0.05 })
        break
      }
      case 'serenade_pad': {
        for (let i = 0; i < 3; i++) {
          this.pad(n(i), t, bar, { bus, type: 'sine', gain: 0.055 })
          this.pad(n(i), t, bar, { bus, type: 'triangle', gain: 0.025, filter: 1200 })
        }
        const steps = [2, 3, 4, 3, 2, 3]
        steps.forEach((idx, i) => {
          const swing = i % 2 === 1 ? 0.06 : 0
          const at = t + i * (bar / steps.length) + swing + human()
          this.pluck(n(idx), at, 1.4, { bus, type: 'triangle', gain: 0.11 * velocity(), filter: 1800 })
        })
        break
      }
    }
  }

  /** Nota com ataque rápido e decaimento (piano, caixinha, violão). */
  private pluck(freq: number, t: number, decay: number, { bus, type = 'sine', gain, filter, detuneCents = 0 }: NoteOptions): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = detuneCents

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(gain, t + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay)

    this.route(osc, env, bus.input, filter)
    osc.start(t)
    osc.stop(t + decay + 0.05)
  }

  /** Nota com ataque e soltura lentos (cordas, pads); sobrepõe o próximo acorde. */
  private pad(freq: number, t: number, hold: number, { bus, type = 'sine', gain, filter, detuneCents = 0 }: NoteOptions): void {
    const ctx = this.ctx!
    const attack = Math.min(1.6, hold * 0.4)
    const release = 2
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = detuneCents

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(gain, t + attack)
    env.gain.setValueAtTime(gain, t + hold)
    env.gain.exponentialRampToValueAtTime(0.0001, t + hold + release)

    this.route(osc, env, bus.input, filter)
    osc.start(t)
    osc.stop(t + hold + release + 0.05)
  }

  private route(osc: OscillatorNode, env: GainNode, destination: AudioNode, filter?: number): void {
    if (filter) {
      const lp = this.ctx!.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = filter
      osc.connect(lp).connect(env)
    } else {
      osc.connect(env)
    }
    env.connect(destination)
  }
}
