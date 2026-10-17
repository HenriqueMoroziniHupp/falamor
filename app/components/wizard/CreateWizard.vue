<script setup lang="ts">
import type { AppLocale } from '#shared/types/declaration'

const MIN_CHARS = 20

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const maxPhotos = Number(config.public.maxPhotos)
const maxChars = Number(config.public.maxDeclarationChars)

const draft = useDraft()
const { state, photos, ready, processing } = draft

const photoNotice = shallowRef<string | null>(null)

const labels = computed(() => [t('wizard.steps.names'), t('wizard.steps.photos'), t('wizard.steps.declaration'), t('wizard.steps.preview')])
const step = computed(() => Math.min(state.step, labels.value.length - 1))
const text = computed(() => draft.declarationText(locale.value as AppLocale))
const textLength = computed(() => text.value.trim().length)
const photoUrls = computed(() => photos.value.map((p) => p.url))

/** O que falta para continuar (null = pode seguir). */
const blocker = computed<string | null>(() => {
  switch (step.value) {
    case 0:
      return state.authorName.trim() && state.partnerName.trim() ? null : t('wizard.need.names')
    case 1:
      if (processing.value > 0) return t('wizard.need.processing')
      return photos.value.length ? null : t('wizard.need.photos')
    case 2:
      if (textLength.value < MIN_CHARS) return t('wizard.need.text', { min: MIN_CHARS })
      return textLength.value > maxChars ? t('wizard.need.textMax', { max: maxChars }) : null
    default:
      return null
  }
})

function go(to: number) {
  state.step = Math.max(0, Math.min(labels.value.length - 1, to))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function onAddPhotos(files: File[]) {
  photoNotice.value = null
  const result = await draft.addPhotos(files, maxPhotos)
  const notes: string[] = []
  if (result.overLimit) notes.push(t('photos.overLimit', { max: maxPhotos }))
  if (result.failed) notes.push(t('photos.failed', result.failed))
  photoNotice.value = notes.join(' ') || null
}

async function onRestart() {
  await draft.reset()
  photoNotice.value = null
  go(0)
}
</script>

<template>
  <div v-if="ready" class="wizard">
    <WizardProgress :step="step" :labels="labels" />

    <div class="wizard-body">
      <Transition name="step" mode="out-in">
        <StepNames
          v-if="step === 0"
          v-model:author-name="state.authorName"
          v-model:partner-name="state.partnerName"
          v-model:start-date="state.startDate"
        />
        <StepPhotos
          v-else-if="step === 1"
          :photos="photos"
          :max="maxPhotos"
          :busy="processing"
          :notice="photoNotice"
          @add="onAddPhotos"
          @remove="draft.removePhoto"
          @reorder="draft.movePhoto"
        />
        <StepDeclaration
          v-else-if="step === 2"
          v-model:text-mode="state.textMode"
          v-model:sample-id="state.sampleId"
          v-model:custom-text="state.customText"
          v-model:voice="state.voice"
          v-model:music="state.music"
          :min-chars="MIN_CHARS"
          :max-chars="maxChars"
        />
        <StepPreview
          v-else
          :author-name="state.authorName"
          :partner-name="state.partnerName"
          :start-date="state.startDate"
          :text="text"
          :voice="state.voice"
          :music="state.music"
          :photo-urls="photoUrls"
          :audio-key="state.audioKey"
          @audio-generated="state.audioKey = $event"
          @restart="onRestart"
        />
      </Transition>
    </div>

    <WizardNav v-if="step < 3" :can-back="step > 0" :can-continue="!blocker" :hint="blocker" @back="go(step - 1)" @next="go(step + 1)" />
    <div v-else class="wizard-back">
      <UiButton variant="ghost" size="md" @click="go(2)">{{ t('wizard.back') }}</UiButton>
    </div>
  </div>

  <WizardSkeleton v-else />
</template>

<style scoped>
.wizard {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
  padding: 0.5rem 1.25rem 0;
}

.wizard-body {
  flex: 1;
  padding: 2rem 0 2.5rem;
}

.wizard-back {
  padding: 0 0 2rem;
}

.step-enter-active,
.step-leave-active {
  transition: opacity 0.25s ease, transform 0.25s var(--ease-gentle);
}

.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
