<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

const { t } = useI18n()

// O selo troca de canto a cada poucos segundos para não dar para cortar no recorte do vídeo.
const SPOTS = ['spot-a', 'spot-b', 'spot-c', 'spot-d'] as const
const spot = shallowRef(0)
useIntervalFn(() => (spot.value = (spot.value + 1) % SPOTS.length), 4500)

const tiles = Array.from({ length: 48 }, (_, i) => i)
</script>

<template>
  <div class="watermark" aria-hidden="true">
    <div class="tiles">
      <span v-for="i in tiles" :key="i" class="tile">{{ t('watermark.text') }}</span>
    </div>
    <div class="badge" :class="SPOTS[spot]">
      <strong>{{ t('watermark.badge') }}</strong>
      <span>{{ t('watermark.hint') }}</span>
    </div>
  </div>
</template>

<style scoped>
.watermark {
  position: absolute;
  inset: 0;
  z-index: 40;
  overflow: hidden;
  pointer-events: none;
}

.tiles {
  position: absolute;
  inset: -50%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-content: space-around;
  row-gap: 4.5rem;
  rotate: -24deg;
}

.tile {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 2.25rem;
  text-align: center;
  white-space: nowrap;
  color: rgb(255 255 255 / 0.22);
  text-shadow: 0 0 1px rgb(29 14 22 / 0.25);
}

.tile:nth-child(12n + 7),
.tile:nth-child(12n + 8),
.tile:nth-child(12n + 9),
.tile:nth-child(12n + 10),
.tile:nth-child(12n + 11),
.tile:nth-child(12n + 12) {
  translate: 50% 0;
}

.badge {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.625rem 1rem;
  border-radius: 1rem;
  background: rgb(200 56 94 / 0.88);
  color: white;
  box-shadow: 0 10px 30px -10px rgb(29 14 22 / 0.6);
  transition: top 1.2s var(--ease-gentle), left 1.2s var(--ease-gentle), right 1.2s var(--ease-gentle), bottom 1.2s var(--ease-gentle);
}

.badge strong {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.375rem;
  line-height: 1;
}

.badge span {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.9;
}

.spot-a { top: 22%; left: 8%; }
.spot-b { top: 38%; left: 52%; }
.spot-c { top: 58%; left: 12%; }
.spot-d { top: 30%; left: 30%; }
</style>
