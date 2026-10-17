import { createSharedComposable, watchDebounced } from '@vueuse/core'
import { revoiceSampleText, sampleText, type SampleId } from '#shared/samples'
import type { AppLocale, MusicStyle, VoiceGender } from '#shared/types/declaration'
import { randomId } from '#shared/utils/text'

interface DraftPhotoMeta {
  id: string
  width: number
  height: number
}

export interface DraftPhoto extends DraftPhotoMeta {
  url: string
}

export interface DraftState {
  authorName: string
  partnerName: string
  startDate: string | null
  textMode: 'sample' | 'custom'
  sampleId: SampleId
  customText: string
  voice: VoiceGender
  music: MusicStyle
  photos: DraftPhotoMeta[]
  /** Chave do último áudio gerado para este rascunho (para apagar o antigo quando o texto muda). */
  audioKey: string | null
  step: number
}

export interface AddPhotosResult {
  added: number
  failed: number
  overLimit: number
}

const DRAFT_KEY = 'draft:v1'
const photoKey = (id: string) => `photo:${id}`

function createDefaults(): DraftState {
  return {
    authorName: '',
    partnerName: '',
    startDate: null,
    textMode: 'sample',
    sampleId: 'lugar-favorito',
    customText: '',
    voice: 'male',
    music: 'piano_warm',
    photos: [],
    audioKey: null,
    step: 0,
  }
}

/**
 * Rascunho da declaração, salvo automaticamente no IndexedDB.
 * Compartilhado entre os passos do wizard (uma instância por aba). Só roda no cliente.
 */
export const useDraft = createSharedComposable(() => {
  const state = reactive<DraftState>(createDefaults())
  const ready = shallowRef(false)
  const processing = shallowRef(0)
  const urls = new Map<string, string>()

  const photos = computed<DraftPhoto[]>(() =>
    state.photos.map((p) => ({ ...p, url: urls.get(p.id) ?? '' })),
  )

  async function load() {
    const saved = await idb.get<DraftState>(DRAFT_KEY)
    if (saved) {
      const blobs = await Promise.all(saved.photos.map((p) => idb.get<Blob>(photoKey(p.id))))
      const kept = saved.photos.filter((p, i) => {
        const blob = blobs[i]
        if (blob) urls.set(p.id, URL.createObjectURL(blob))
        return Boolean(blob)
      })
      Object.assign(state, createDefaults(), saved, { photos: kept })
    }
    ready.value = true
  }

  watchDebounced(
    state,
    () => {
      if (ready.value) void idb.set(DRAFT_KEY, JSON.parse(JSON.stringify(state)))
    },
    { deep: true, debounce: 250 },
  )

  // Exemplo personalizado sem edição: acompanha a voz ("Obrigado" ↔ "Obrigada").
  watch(
    () => state.voice,
    (voice) => {
      if (state.textMode !== 'custom') return
      const revoiced = revoiceSampleText(state.customText, voice)
      if (revoiced) state.customText = revoiced
    },
  )

  function declarationText(locale: AppLocale): string {
    return state.textMode === 'sample' ? sampleText(state.sampleId, locale, state.voice) : state.customText
  }

  async function addPhotos(files: File[], maxPhotos: number): Promise<AddPhotosResult> {
    const free = Math.max(0, maxPhotos - state.photos.length)
    const accepted = files.slice(0, free)
    const result: AddPhotosResult = { added: 0, failed: 0, overLimit: files.length - accepted.length }

    // Uma por vez para não estourar a memória do celular.
    for (const file of accepted) {
      processing.value++
      try {
        const image = await compressImage(file)
        const id = randomId()
        await idb.set(photoKey(id), image.blob)
        urls.set(id, URL.createObjectURL(image.blob))
        state.photos.push({ id, width: image.width, height: image.height })
        result.added++
      } catch {
        result.failed++
      } finally {
        processing.value--
      }
    }
    return result
  }

  function removePhoto(id: string) {
    state.photos = state.photos.filter((p) => p.id !== id)
    const url = urls.get(id)
    if (url) URL.revokeObjectURL(url)
    urls.delete(id)
    void idb.del(photoKey(id))
  }

  function movePhoto(from: number, to: number) {
    if (from === to) return
    const list = [...state.photos]
    const [item] = list.splice(from, 1)
    if (!item) return
    list.splice(to, 0, item)
    state.photos = list
  }

  async function reset() {
    await idb.delMany([
      ...state.photos.map((p) => photoKey(p.id)),
      ...(state.audioKey ? [audioCacheKey(state.audioKey)] : []),
    ])
    urls.forEach((url) => URL.revokeObjectURL(url))
    urls.clear()
    Object.assign(state, createDefaults())
  }

  void load()

  return { state, photos, ready, processing, declarationText, addPhotos, removePhoto, movePhoto, reset }
})

export function audioCacheKey(hash: string): string {
  return `tts:${hash}`
}
