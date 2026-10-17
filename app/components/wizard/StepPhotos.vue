<script setup lang="ts">
import type { DraftPhoto } from '~/composables/useDraft'

const props = defineProps<{ photos: DraftPhoto[]; max: number; busy: number; notice: string | null }>()
const emit = defineEmits<{ add: [files: File[]]; remove: [id: string]; reorder: [from: number, to: number] }>()

const { t } = useI18n()
const input = useTemplateRef<HTMLInputElement>('input')
const dragging = shallowRef(false)

const canAdd = computed(() => props.photos.length + props.busy < props.max)
const isEmpty = computed(() => props.photos.length === 0 && props.busy === 0)

function pick() {
  input.value?.click()
}

function onFiles(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  target.value = ''
  if (files.length) emit('add', files)
}

function onDrop(event: DragEvent) {
  dragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
  if (files.length) emit('add', files)
}
</script>

<template>
  <div>
    <StepHeading :title="t('photos.title')" :subtitle="t('photos.subtitle', { max })" />

    <input ref="input" type="file" accept="image/*" multiple class="sr-only" tabindex="-1" aria-hidden="true" @change="onFiles" />

    <button
      v-if="isEmpty"
      type="button"
      class="dropzone"
      :class="{ 'dropzone-over': dragging }"
      @click="pick"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="6" y="10" width="36" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="2.5" />
        <circle cx="17" cy="20" r="3.5" fill="currentColor" />
        <path d="m10 34 9-9 6 6 5-5 8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
      </svg>
      <span class="dropzone-title">{{ t('photos.pick') }}</span>
      <span class="dropzone-hint">{{ t('photos.pickHint', { max }) }}</span>
    </button>

    <div v-else @dragover.prevent @drop.prevent="onDrop">
      <PhotoGrid
        :photos="photos"
        :can-add="canAdd"
        :max="max"
        :busy="busy"
        @pick="pick"
        @remove="emit('remove', $event)"
        @reorder="(from, to) => emit('reorder', from, to)"
      />
      <p class="field-hint mt-4">{{ t('photos.reorderHint') }}</p>
    </div>

    <p v-if="notice" class="notice" role="status">{{ notice }}</p>
  </div>
</template>

<style scoped>
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 16rem;
  padding: 2rem;
  border-radius: 1.5rem;
  border: 2px dashed var(--color-blush);
  background: white;
  color: var(--color-rose);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.dropzone:hover,
.dropzone-over {
  background: var(--color-petal);
  border-color: var(--color-rose);
}

.dropzone svg {
  width: 3.5rem;
  height: 3.5rem;
}

.dropzone-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-rose-deep);
}

.dropzone-hint {
  color: var(--color-ink-soft);
}

.notice {
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: var(--color-petal);
  color: var(--color-rose-deep);
  font-weight: 700;
}
</style>
