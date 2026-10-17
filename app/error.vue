<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()

const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: () => (notFound.value ? t('error.notFoundTitle') : t('error.genericTitle')), robots: 'noindex' })

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <div class="error-page">
    <HeartsBackground />
    <div class="error-card">
      <p class="error-code">{{ error.statusCode }}</p>
      <h1 class="error-title">{{ notFound ? t('error.notFoundTitle') : t('error.genericTitle') }}</h1>
      <p class="error-text">{{ notFound ? t('error.notFoundText') : t('error.genericText') }}</p>
      <UiButton @click="goHome">{{ t('error.cta') }}</UiButton>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: 1.5rem;
}

.error-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 28rem;
  text-align: center;
}

.error-code {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 4rem;
  line-height: 1;
  color: var(--color-rose);
}

.error-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 2rem;
  line-height: 1.1;
}

.error-text {
  color: var(--color-ink-soft);
  margin-bottom: 0.5rem;
}
</style>
