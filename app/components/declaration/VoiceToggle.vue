<script setup lang="ts">
import { VOICE_GENDERS, type VoiceGender } from '#shared/types/declaration'

const voice = defineModel<VoiceGender>({ required: true })
const { t } = useI18n()
</script>

<template>
  <fieldset>
    <legend class="field-label">{{ t('declaration.voiceLabel') }}</legend>
    <div class="segmented">
      <label v-for="option in VOICE_GENDERS" :key="option" class="segment" :class="{ 'segment-on': voice === option }">
        <input v-model="voice" type="radio" name="voice" :value="option" class="sr-only" />
        {{ t(`declaration.voice.${option}`) }}
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--color-petal);
}

.segment {
  display: grid;
  place-items: center;
  min-height: 3rem;
  border-radius: 999px;
  font-weight: 800;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
}

.segment:has(:focus-visible) {
  outline: 3px solid color-mix(in oklab, var(--color-rose) 70%, white);
  outline-offset: 2px;
}

.segment-on {
  background: white;
  color: var(--color-rose-deep);
  box-shadow: var(--shadow-soft);
}
</style>
