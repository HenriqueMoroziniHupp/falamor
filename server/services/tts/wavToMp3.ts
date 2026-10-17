import { Mp3Encoder } from '@breezystack/lamejs'

interface PcmInfo {
  sampleRate: number
  channels: number
  samples: Int16Array
}

const FRAME_SIZE = 1152

function readAscii(view: DataView, offset: number, length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(offset + i))
  return out
}

/** Lê um WAV PCM 16-bit (RIFF). Sem cabeçalho, assume PCM cru (audio/l16). */
export function readPcm16(bytes: Uint8Array, fallback = { sampleRate: 24_000, channels: 1 }): PcmInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const isRiff = bytes.byteLength > 12 && readAscii(view, 0, 4) === 'RIFF' && readAscii(view, 8, 4) === 'WAVE'

  if (!isRiff) {
    const pcm = bytes.slice(0, bytes.byteLength - (bytes.byteLength % 2))
    return { ...fallback, samples: new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2) }
  }

  let offset = 12
  let sampleRate = fallback.sampleRate
  let channels = fallback.channels
  let bitsPerSample = 16

  while (offset + 8 <= bytes.byteLength) {
    const id = readAscii(view, offset, 4)
    const size = view.getUint32(offset + 4, true)
    const body = offset + 8

    if (id === 'fmt ') {
      channels = view.getUint16(body + 2, true)
      sampleRate = view.getUint32(body + 4, true)
      bitsPerSample = view.getUint16(body + 14, true)
    } else if (id === 'data') {
      if (bitsPerSample !== 16) throw new Error(`Unsupported WAV bit depth: ${bitsPerSample}`)
      const end = Math.min(body + size, bytes.byteLength)
      const pcm = bytes.slice(body, end - ((end - body) % 2))
      return { sampleRate, channels, samples: new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2) }
    }
    offset = body + size + (size % 2)
  }

  throw new Error('WAV without data chunk')
}

/** Converte WAV/PCM 16-bit em MP3 (~10× menor, bom para 4G e para o bucket). */
export function pcmToMp3(bytes: Uint8Array, options: { kbps?: number; sampleRate?: number; channels?: number } = {}): Uint8Array {
  const { sampleRate, channels, samples } = readPcm16(bytes, {
    sampleRate: options.sampleRate ?? 24_000,
    channels: options.channels ?? 1,
  })
  const encoder = new Mp3Encoder(channels, sampleRate, options.kbps ?? 64)
  const chunks: Uint8Array[] = []

  if (channels === 1) {
    for (let i = 0; i < samples.length; i += FRAME_SIZE) {
      const out = encoder.encodeBuffer(samples.subarray(i, i + FRAME_SIZE))
      if (out.length) chunks.push(out)
    }
  } else {
    const frames = Math.floor(samples.length / 2)
    const left = new Int16Array(frames)
    const right = new Int16Array(frames)
    for (let i = 0; i < frames; i++) {
      left[i] = samples[i * 2]!
      right[i] = samples[i * 2 + 1]!
    }
    for (let i = 0; i < frames; i += FRAME_SIZE) {
      const out = encoder.encodeBuffer(left.subarray(i, i + FRAME_SIZE), right.subarray(i, i + FRAME_SIZE))
      if (out.length) chunks.push(out)
    }
  }

  const tail = encoder.flush()
  if (tail.length) chunks.push(tail)

  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const mp3 = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    mp3.set(chunk, offset)
    offset += chunk.length
  }
  return mp3
}

/** Garante MP3 independente do formato que o provedor devolveu. */
export function ensureMp3(audio: { data: Uint8Array; mimeType: string; sampleRate?: number; channels?: number }): Uint8Array {
  const mime = audio.mimeType.toLowerCase()
  if (mime.includes('mp3') || mime.includes('mpeg')) return audio.data
  if (mime.includes('wav') || mime.includes('l16') || mime.includes('pcm')) {
    return pcmToMp3(audio.data, { sampleRate: audio.sampleRate, channels: audio.channels })
  }
  throw new Error(`Unsupported TTS audio format: ${audio.mimeType}`)
}
