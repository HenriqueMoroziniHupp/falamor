import { describe, expect, it } from 'vitest'
import { buildTranscript } from '../../server/services/tts/voiceStyle'
import { ensureMp3, pcmToMp3, readPcm16 } from '../../server/services/tts/wavToMp3'

/** WAV mono 16-bit com um tom de 440 Hz. */
function makeWav(seconds: number, sampleRate = 24_000): Uint8Array {
  const samples = Math.floor(seconds * sampleRate)
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  const ascii = (offset: number, text: string) => [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  ascii(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  ascii(36, 'data')
  view.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i++) view.setInt16(44 + i * 2, Math.sin((i / sampleRate) * 2 * Math.PI * 440) * 12_000, true)
  return new Uint8Array(buffer)
}

const isMp3Frame = (bytes: Uint8Array) => bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0

describe('wav → mp3', () => {
  it('reads the WAV header', () => {
    const pcm = readPcm16(makeWav(1))
    expect(pcm.sampleRate).toBe(24_000)
    expect(pcm.channels).toBe(1)
    expect(pcm.samples.length).toBe(24_000)
  })

  it('encodes a much smaller MP3', () => {
    const wav = makeWav(2)
    const mp3 = pcmToMp3(wav)
    expect(isMp3Frame(mp3)).toBe(true)
    expect(mp3.length).toBeLessThan(wav.length / 4)
  })

  it('passes MP3 through and converts WAV', () => {
    const mp3 = pcmToMp3(makeWav(1))
    expect(ensureMp3({ data: mp3, mimeType: 'audio/mp3' })).toBe(mp3)
    expect(isMp3Frame(ensureMp3({ data: makeWav(1), mimeType: 'audio/wav' }))).toBe(true)
    expect(() => ensureMp3({ data: mp3, mimeType: 'audio/ogg' })).toThrow()
  })
})

describe('buildTranscript', () => {
  it('removes angle brackets and pauses between paragraphs', () => {
    expect(buildTranscript('Oi <amor>.\n\nTe amo!')).toBe('Oi amor. <short pause> Te amo!')
  })
})
