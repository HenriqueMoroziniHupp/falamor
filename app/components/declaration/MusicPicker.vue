<script setup lang="ts">
import { MUSIC_STYLES, type MusicStyle } from '#shared/types/declaration'
import { RomanticAudioEngine } from '~/lib/audio/RomanticAudioEngine'

const music = defineModel<MusicStyle>({ required: true })
const { t } = useI18n()

const PREVIEW_SECONDS = 9

const previewing = shallowRef<MusicStyle | null>(null)
let engine: RomanticAudioEngine | null = null
let stopTimer: ReturnType<typeof setTimeout> | undefined

function stopPreview() {
  clearTimeout(stopTimer)
  engine?.stop(0.8)
  previewing.value = null
}

/** Selecionar uma trilha também toca um trechinho dela (toque de novo para parar). */
async function choose(style: MusicStyle) {
  music.value = style
  if (previewing.value === style) {
    stopPreview()
    return
  }
  engine ??= new RomanticAudioEngine()
  await engine.resume()
  engine.play(style)
  previewing.value = style
  clearTimeout(stopTimer)
  stopTimer = setTimeout(stopPreview, PREVIEW_SECONDS * 1000)
}

onBeforeUnmount(() => {
  clearTimeout(stopTimer)
  void engine?.dispose()
})
</script>

<template>
  <fieldset>
    <legend class="field-label">{{ t('declaration.musicLabel') }}</legend>
    <div class="chips" role="radiogroup">
      <button
        v-for="style in MUSIC_STYLES"
        :key="style"
        type="button"
        role="radio"
        class="chip"
        :class="{ 'chip-on': music === style }"
        :aria-checked="music === style"
        @click="choose(style)"
      >
        <span class="chip-eq" :class="{ 'chip-eq-playing': previewing === style }" aria-hidden="true">
          <i /><i /><i />
        </span>
        {{ t(`declaration.music.${style}`) }}
      </button>
    </div>
    <p class="field-hint mt-2">{{ t('declaration.musicHint') }}</p>
  </fieldset>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border-radius: 999px;
  border: 1.5px solid var(--color-line);
  background: white;
  font-weight: 800;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
}

.chip-on {
  border-color: var(--color-rose);
  background: #fffafb;
  color: var(--color-rose-deep);
}

.chip-eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 0.875rem;
}

.chip-eq i {
  width: 3px;
  height: 40%;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.6;
}

.chip-eq i:nth-child(2) {
  height: 75%;
}

.chip-eq-playing i {
  opacity: 1;
  animation: eq 0.9s ease-in-out infinite alternate;
}

.chip-eq-playing i:nth-child(2) {
  animation-delay: -0.3s;
}

.chip-eq-playing i:nth-child(3) {
  animation-delay: -0.6s;
}

@keyframes eq {
  from {
    height: 25%;
  }
  to {
    height: 100%;
  }
}
</style>
