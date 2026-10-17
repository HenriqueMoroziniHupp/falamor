import { GoogleGenAI } from '@google/genai'
import type { TtsProvider } from './TtsProvider.ts'

interface GeminiTtsOptions {
  apiKey: string
  model: string
}

/**
 * Gemini TTS via Interactions API.
 * Docs: https://ai.google.dev/gemini-api/docs/speech-generation
 */
export function createGeminiTtsProvider({ apiKey, model }: GeminiTtsOptions): TtsProvider {
  const ai = new GoogleGenAI({ apiKey })

  return {
    async synthesize({ text, voice, style, language }) {
      const interaction = await ai.interactions.create({
        model,
        input: [
          {
            type: 'user_input',
            content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style }] }],
          },
        ],
        // Pedimos MP3 direto (o modelo não aceita `bit_rate`); se vier WAV/PCM, o endpoint converte.
        response_format: { type: 'audio', mime_type: 'audio/mp3' },
        generation_config: { speech_config: [{ voice, language }] },
      })

      const audio = interaction.output_audio
      if (!audio?.data) throw new Error('Gemini TTS returned no audio')

      return {
        data: new Uint8Array(Buffer.from(audio.data, 'base64')),
        mimeType: audio.mime_type ?? 'audio/wav',
        sampleRate: audio.sample_rate,
        channels: audio.channels,
      }
    },
  }
}
