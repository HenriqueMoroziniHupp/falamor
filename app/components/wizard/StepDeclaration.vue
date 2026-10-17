<script setup lang="ts">
import { sampleText, type SampleId } from '#shared/samples'
import type { AppLocale, MusicStyle, VoiceGender } from '#shared/types/declaration'

const textMode = defineModel<'sample' | 'custom'>('textMode', { required: true })
const sampleId = defineModel<SampleId>('sampleId', { required: true })
const customText = defineModel<string>('customText', { required: true })
const voice = defineModel<VoiceGender>('voice', { required: true })
const music = defineModel<MusicStyle>('music', { required: true })

defineProps<{ minChars: number; maxChars: number }>()

const { t, locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)

const choice = computed<SampleId | 'custom'>({
  get: () => (textMode.value === 'custom' ? 'custom' : sampleId.value),
  set: (value) => {
    if (value === 'custom') {
      textMode.value = 'custom'
    } else {
      textMode.value = 'sample'
      sampleId.value = value
    }
  },
})

/** "Editar este texto": copia o exemplo para o editor e passa para o modo próprio. */
function customize(id: SampleId) {
  customText.value = sampleText(id, currentLocale.value, voice.value)
  textMode.value = 'custom'
}
</script>

<template>
  <div class="step">
    <StepHeading :title="t('declaration.title')" :subtitle="t('declaration.subtitle')" />

    <DeclarationOptions v-model="choice" :locale="currentLocale" :voice="voice" @customize="customize" />

    <DeclarationEditor v-if="textMode === 'custom'" v-model="customText" :min="minChars" :max="maxChars" />

    <VoiceToggle v-model="voice" />

    <MusicPicker v-model="music" />
  </div>
</template>

<style scoped>
.step {
  display: grid;
  gap: 2rem;
}

.step > :first-child {
  margin-bottom: -0.25rem;
}
</style>
