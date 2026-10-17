import { APP_CONFIG } from '#shared/config'
import { isAppLocale, isVoiceGender } from '#shared/types/declaration'
import { normalizeDeclarationText, sha256Hex } from '#shared/utils/text'
import type { TtsProvider } from '../services/tts/TtsProvider'
import { createGeminiTtsProvider } from '../services/tts/gemini'
import { SPEECH_LANGUAGE, VOICE_STYLES, buildTranscript } from '../services/tts/voiceStyle'
import { ensureMp3 } from '../services/tts/wavToMp3'

const MIN_CHARS = 20
const HOUR_MS = 60 * 60 * 1000

let provider: { key: string; instance: TtsProvider } | null = null
/** Pedidos idênticos simultâneos esperam a mesma geração (um crédito só). */
const inflight = new Map<string, Promise<Uint8Array>>()

function getProvider(apiKey: string, model: string): TtsProvider {
  const key = `${apiKey}:${model}`
  if (provider?.key !== key) provider = { key, instance: createGeminiTtsProvider({ apiKey, model }) }
  return provider.instance
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  // Deploy de demonstração: só exemplos com áudio pronto em public/, nenhuma geração.
  if (!config.public.customText) throw createError({ statusCode: 403, statusMessage: 'custom_text_disabled' })
  const body = await readBody<{ text?: unknown; voice?: unknown; locale?: unknown }>(event)

  if (typeof body?.text !== 'string') throw createError({ statusCode: 400, statusMessage: 'invalid_text' })
  const text = normalizeDeclarationText(body.text)
  if (text.length < MIN_CHARS || text.length > APP_CONFIG.declaration.maxChars) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_text_length' })
  }
  if (!isVoiceGender(body.voice)) throw createError({ statusCode: 400, statusMessage: 'invalid_voice' })
  if (!isAppLocale(body.locale)) throw createError({ statusCode: 400, statusMessage: 'invalid_locale' })

  const locale = body.locale
  const voiceName = APP_CONFIG.tts.voices[body.voice]
  const style = VOICE_STYLES[locale]
  // Qualquer mudança de texto, voz, estilo ou modelo gera outra chave → outro áudio.
  const cacheKey = await sha256Hex(JSON.stringify([APP_CONFIG.tts.model, voiceName, style, locale, text]))
  const itemKey = `${cacheKey}.mp3`
  const storage = useStorage('tts')

  const cached = await storage.getItemRaw<Uint8Array>(itemKey)
  if (cached) {
    setResponseHeaders(event, { 'Content-Type': 'audio/mpeg', 'X-TTS-Cache': 'HIT' })
    return Buffer.from(cached)
  }

  // Só gerar exige a chave; o que já está em cache continua sendo servido.
  if (!config.geminiApiKey) throw createError({ statusCode: 503, statusMessage: 'tts_not_configured' })

  let job = inflight.get(cacheKey)
  if (!job) {
    consumeRateLimit(event, { limit: APP_CONFIG.tts.rateLimitPerHour, windowMs: HOUR_MS })
    job = (async () => {
      const audio = await getProvider(config.geminiApiKey, APP_CONFIG.tts.model).synthesize({
        text: buildTranscript(text),
        voice: voiceName,
        style,
        language: SPEECH_LANGUAGE[locale],
      })
      const mp3 = ensureMp3(audio)
      await storage.setItemRaw(itemKey, mp3)
      return mp3
    })().finally(() => inflight.delete(cacheKey))
    inflight.set(cacheKey, job)
  }

  try {
    const mp3 = await job
    setResponseHeaders(event, { 'Content-Type': 'audio/mpeg', 'X-TTS-Cache': 'MISS' })
    return Buffer.from(mp3)
  } catch (error) {
    console.error('[tts] generation failed', error)
    throw createError({ statusCode: 502, statusMessage: 'tts_failed' })
  }
})
