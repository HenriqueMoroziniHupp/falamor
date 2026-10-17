import { matchSample, sampleAudioPath } from '#shared/samples'
import type { AppLocale, VoiceGender } from '#shared/types/declaration'
import { normalizeDeclarationText, sha256Hex } from '#shared/utils/text'

export type AudioSource = 'sample' | 'cache' | 'api'

export interface ResolvedAudio {
  url: string
  source: AudioSource
}

interface ResolveOptions {
  text: string
  voice: VoiceGender
  locale: AppLocale
  /** Chave do áudio anterior do rascunho; é apagada se o texto mudou. */
  previousKey: string | null
}

/** Mapeia o erro do servidor para a mensagem traduzida mostrada na prévia. */
function errorKey(error: unknown): string {
  const status = (error as { statusCode?: number; status?: number })?.statusCode ?? (error as { status?: number })?.status
  if (status === 503) return 'preview.errors.notConfigured'
  if (status === 429) return 'preview.errors.rateLimited'
  return 'preview.errors.generic'
}

/**
 * Resolve o áudio da declaração gastando o mínimo de crédito:
 * 1. texto de exemplo → asset estático pré-gerado;
 * 2. já gerado antes neste navegador → IndexedDB;
 * 3. senão → POST /api/tts (que ainda tem o próprio cache no servidor).
 * Com `public.customText` desligado, só o passo 1: nada é gerado.
 */
export function useDeclarationAudio() {
  const status = shallowRef<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const error = shallowRef<string | null>(null)
  const audioKey = shallowRef<string | null>(null)
  const canGenerate = Boolean(useRuntimeConfig().public.customText)
  let objectUrl: string | null = null

  function releaseUrl() {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }

  async function resolve({ text, voice, locale, previousKey }: ResolveOptions): Promise<ResolvedAudio | null> {
    status.value = 'loading'
    error.value = null
    releaseUrl()

    try {
      const sampleId = matchSample(text, locale, voice)
      if (sampleId) {
        const url = sampleAudioPath(sampleId, locale, voice)
        const head = await fetch(url, { method: 'HEAD' }).catch(() => null)
        if (head?.ok) {
          status.value = 'ready'
          return { url, source: 'sample' }
        }
      }

      if (!canGenerate) {
        error.value = 'preview.errors.notConfigured'
        status.value = 'error'
        return null
      }

      const key = await sha256Hex(JSON.stringify(['v1', locale, voice, normalizeDeclarationText(text)]))
      audioKey.value = key

      let blob = await idb.get<Blob>(audioCacheKey(key))
      let source: AudioSource = 'cache'
      if (!blob) {
        blob = await $fetch<Blob>('/api/tts', {
          method: 'POST',
          body: { text, voice, locale },
          responseType: 'blob',
        })
        source = 'api'
        await idb.set(audioCacheKey(key), blob)
      }
      if (previousKey && previousKey !== key) void idb.del(audioCacheKey(previousKey))

      objectUrl = URL.createObjectURL(blob)
      status.value = 'ready'
      return { url: objectUrl, source }
    } catch (e) {
      console.error('[audio] could not resolve declaration audio', e)
      error.value = errorKey(e)
      status.value = 'error'
      return null
    }
  }

  onScopeDispose(releaseUrl)

  return { status, error, audioKey, resolve }
}
