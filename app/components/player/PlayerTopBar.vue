<script setup lang="ts">
defineProps<{
  /** Preenchimento (0–1) de cada segmento, um por slide. */
  segments: number[]
  together: string | null
  muted: boolean
  closable: boolean
}>()

const emit = defineEmits<{ toggleMute: []; close: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="topbar">
    <div class="segments" aria-hidden="true">
      <span v-for="(fill, i) in segments" :key="i" class="segment">
        <span class="segment-fill" :style="{ transform: `scaleX(${fill})` }" />
      </span>
    </div>

    <div class="row">
      <p v-if="together" class="together">{{ together }}</p>
      <span v-else />

      <div class="actions">
        <button
          type="button"
          class="icon-button"
          :aria-label="muted ? t('player.unmute') : t('player.mute')"
          :aria-pressed="muted"
          @click.stop="emit('toggleMute')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" />
            <path v-if="muted" d="m16 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path v-else d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
          </svg>
        </button>
        <button v-if="closable" type="button" class="icon-button" :aria-label="t('player.close')" @click.stop="emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: calc(0.75rem + env(safe-area-inset-top)) 1rem 2.5rem;
  background: linear-gradient(rgb(29 14 22 / 0.55), transparent);
  color: white;
}

.segments {
  display: flex;
  gap: 4px;
}

.segment {
  flex: 1;
  height: 3px;
  border-radius: 3px;
  background: rgb(255 255 255 / 0.32);
  overflow: hidden;
}

.segment-fill {
  display: block;
  height: 100%;
  background: white;
  transform-origin: left;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  gap: 0.75rem;
}

.together {
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.16);
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.16);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
}

.icon-button svg {
  width: 1.375rem;
  height: 1.375rem;
}
</style>
