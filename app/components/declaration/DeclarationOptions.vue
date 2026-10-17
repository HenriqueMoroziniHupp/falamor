<script setup lang="ts">
import { DECLARATION_SAMPLES, type SampleId } from '#shared/samples'
import type { AppLocale, VoiceGender } from '#shared/types/declaration'

/** 'custom' = escrever a própria declaração. */
const selected = defineModel<SampleId | 'custom'>({ required: true })
const props = defineProps<{ locale: AppLocale; voice: VoiceGender; allowCustom: boolean }>()
const emit = defineEmits<{ customize: [id: SampleId] }>()

const { t } = useI18n()

const options = computed(() =>
  DECLARATION_SAMPLES.map((sample) => ({
    id: sample.id,
    title: sample.title[props.locale],
    text: sample.text[props.locale][props.voice],
  })),
)
</script>

<template>
  <fieldset class="options">
    <legend class="sr-only">{{ t('declaration.optionsLabel') }}</legend>

    <label v-for="option in options" :key="option.id" class="option" :class="{ 'option-selected': selected === option.id }">
      <input v-model="selected" type="radio" name="declaration" :value="option.id" class="sr-only" />
      <span class="option-title">{{ option.title }}</span>
      <span class="option-text" :class="{ 'option-text-full': selected === option.id }">{{ option.text }}</span>
      <button
        v-if="allowCustom && selected === option.id"
        type="button"
        class="option-edit"
        @click.prevent="emit('customize', option.id)"
      >
        {{ t('declaration.editSample') }}
      </button>
    </label>

    <label v-if="allowCustom" class="option option-custom" :class="{ 'option-selected': selected === 'custom' }">
      <input v-model="selected" type="radio" name="declaration" value="custom" class="sr-only" />
      <span class="option-title">{{ t('declaration.writeOwn') }}</span>
      <span class="option-hint">{{ t('declaration.writeOwnHint') }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.options {
  display: grid;
  gap: 0.75rem;
}

.option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.125rem 1.25rem;
  border-radius: 1.25rem;
  border: 1.5px solid var(--color-line);
  background: white;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}

.option:has(:focus-visible) {
  outline: 3px solid color-mix(in oklab, var(--color-rose) 70%, white);
  outline-offset: 3px;
}

.option-selected {
  border-color: var(--color-rose);
  background: #fffafb;
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-rose) 14%, transparent);
}

.option-title {
  font-weight: 800;
  color: var(--color-ink);
}

.option-selected .option-title {
  color: var(--color-rose-deep);
}

.option-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--color-ink-soft);
}

.option-text-full {
  display: block;
  -webkit-line-clamp: unset;
  color: var(--color-ink);
}

.option-edit {
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0.375rem 0;
  font-weight: 800;
  color: var(--color-rose);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.option-custom {
  border-style: dashed;
}

.option-hint {
  color: var(--color-ink-soft);
  font-size: 0.9375rem;
}
</style>
