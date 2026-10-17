<script setup lang="ts">
import type { PlayerMode } from '~/lib/player'

const props = defineProps<{
  authorName: string
  partnerName: string
  startDate: string | null
  mode: PlayerMode
}>()

const emit = defineEmits<{ replay: []; close: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { duration } = useTogetherCounter(() => props.startDate)

const units = computed(() => {
  const d = duration.value
  if (!d) return []
  return [
    { key: 'years', value: d.years, label: t('together.unit.years', d.years) },
    { key: 'months', value: d.months, label: t('together.unit.months', d.months) },
    { key: 'days', value: d.days, label: t('together.unit.days', d.days) },
    { key: 'hours', value: d.hours, label: t('together.unit.hours', d.hours) },
    { key: 'minutes', value: d.minutes, label: t('together.unit.minutes', d.minutes) },
    { key: 'seconds', value: d.seconds, label: t('together.unit.seconds', d.seconds) },
  ]
})
</script>

<template>
  <div class="outro" @click.stop>
    <p class="outro-names">
      <span>{{ authorName }}</span>
      <svg class="outro-heart" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 28.5 4.2 17.1A7.3 7.3 0 0 1 14.5 6.8L16 8.3l1.5-1.5a7.3 7.3 0 0 1 10.3 10.3Z" />
      </svg>
      <span>{{ partnerName }}</span>
    </p>

    <template v-if="units.length">
      <p class="outro-label">{{ t('player.outro.together') }}</p>
      <dl class="counter">
        <div v-for="unit in units" :key="unit.key" class="counter-cell">
          <dt class="counter-label">{{ unit.label }}</dt>
          <dd class="counter-value">{{ unit.value }}</dd>
        </div>
      </dl>
    </template>
    <p v-else class="outro-forever">{{ t('player.outro.forever') }}</p>

    <div class="outro-actions">
      <UiButton variant="soft" size="md" @click="emit('replay')">{{ t('player.outro.replay') }}</UiButton>
      <UiButton v-if="mode === 'preview'" size="md" @click="emit('close')">{{ t('player.outro.closePreview') }}</UiButton>
    </div>

    <NuxtLink v-if="mode === 'public'" :to="localePath('/')" class="outro-cta">
      {{ t('player.outro.createYours') }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.outro {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem calc(2rem + env(safe-area-inset-bottom));
  text-align: center;
  color: white;
  background: radial-gradient(circle at 50% 32%, #5a1f3a 0%, #2d1220 48%, var(--color-night) 100%);
}

.outro-names {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.25em 0.4em;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(2.5rem, 10vw, 4.5rem);
  line-height: 1.05;
}

.outro-heart {
  width: 0.5em;
  height: 0.5em;
  fill: #f07a9a;
}

.outro-label {
  margin-top: 2.25rem;
  font-weight: 700;
  color: var(--color-blush);
}

.counter {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 6.5rem));
  gap: 1rem 0.75rem;
  margin-top: 1rem;
}

.counter-cell {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  padding: 0.75rem 0.25rem;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.07);
}

.counter-value {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums lining-nums;
}

.counter-label {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgb(255 255 255 / 0.7);
}

.outro-forever {
  margin-top: 1.5rem;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.5rem;
  color: var(--color-blush);
}

.outro-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.outro-cta {
  margin-top: 1.5rem;
  font-weight: 700;
  color: var(--color-blush);
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
