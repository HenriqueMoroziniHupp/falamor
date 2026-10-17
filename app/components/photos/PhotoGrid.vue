<script setup lang="ts">
import { insertNodeAt, removeNode, useSortable } from '@vueuse/integrations/useSortable'
import type { DraftPhoto } from '~/composables/useDraft'

const props = defineProps<{ photos: DraftPhoto[]; canAdd: boolean; max: number; busy: number }>()
const emit = defineEmits<{ remove: [id: string]; reorder: [from: number, to: number]; pick: [] }>()

const { t } = useI18n()
const grid = useTemplateRef<HTMLElement>('grid')

useSortable(grid, toRef(props, 'photos'), {
  animation: 220,
  draggable: '.tile',
  filter: '.tile-remove',
  preventOnFilter: false,
  delay: 140,
  delayOnTouchOnly: true,
  ghostClass: 'tile-ghost',
  chosenClass: 'tile-chosen',
  onUpdate: (event: { item: HTMLElement; from: HTMLElement; oldIndex?: number; newIndex?: number }) => {
    const { item, from, oldIndex, newIndex } = event
    if (oldIndex === undefined || newIndex === undefined) return
    // Devolve o DOM ao Vue: quem reordena é o estado (rascunho), não o Sortable.
    removeNode(item)
    insertNodeAt(from, item, oldIndex)
    emit('reorder', oldIndex, newIndex)
  },
})
</script>

<template>
  <ul ref="grid" class="grid">
    <li v-for="(photo, index) in photos" :key="photo.id" class="tile">
      <img :src="photo.url" :alt="t('photos.alt', { n: index + 1 })" class="tile-img" draggable="false" />
      <span v-if="index === 0" class="tile-cover">{{ t('photos.cover') }}</span>
      <button type="button" class="tile-remove" :aria-label="t('photos.remove', { n: index + 1 })" @click="emit('remove', photo.id)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
      </button>
    </li>

    <li v-for="n in busy" :key="`busy-${n}`" class="tile-busy" aria-hidden="true">
      <span class="busy-heart" />
    </li>

    <li v-if="canAdd" class="tile-add-wrap">
      <button type="button" class="tile-add" @click="emit('pick')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
        <span>{{ t('photos.addMore') }}</span>
        <span class="tile-add-count">{{ t('photos.count', { n: photos.length, max }) }}</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.tile,
.tile-busy,
.tile-add-wrap {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 1rem;
}

.tile {
  overflow: hidden;
  background: var(--color-petal);
  box-shadow: var(--shadow-soft);
  cursor: grab;
  touch-action: manipulation;
}

.tile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-touch-callout: none;
}

.tile-cover {
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-rose);
  color: white;
  font-size: 0.8125rem;
  font-weight: 800;
}

.tile-remove {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: rgb(29 14 22 / 0.55);
  color: white;
  cursor: pointer;
}

.tile-remove svg {
  width: 1.125rem;
  height: 1.125rem;
}

.tile-ghost {
  opacity: 0.35;
}

.tile-chosen {
  box-shadow: 0 18px 30px -12px rgb(158 36 71 / 0.5);
  scale: 1.03;
}

.tile-busy {
  display: grid;
  place-items: center;
  background: var(--color-petal);
}

.busy-heart {
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-rose);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 28.5 4.2 17.1A7.3 7.3 0 0 1 14.5 6.8L16 8.3l1.5-1.5a7.3 7.3 0 0 1 10.3 10.3Z'/%3E%3C/svg%3E") center / contain no-repeat;
  animation: beat 1s ease-in-out infinite;
}

@keyframes beat {
  50% {
    scale: 1.2;
  }
}

.tile-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  border: 2px dashed var(--color-blush);
  background: white;
  color: var(--color-rose-deep);
  font-weight: 800;
  font-size: 0.9375rem;
  cursor: pointer;
}

.tile-add svg {
  width: 1.75rem;
  height: 1.75rem;
}

.tile-add-count {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-ink-soft);
}
</style>
