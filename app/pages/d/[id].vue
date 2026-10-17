<script setup lang="ts">
import type { PlayerDeclaration } from '~/lib/player'

definePageMeta({ layout: false })

const route = useRoute()
const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()

const id = String(route.params.id)
const { data: declaration, error } = await useFetch(`/api/declarations/${encodeURIComponent(id)}`, {
  key: `declaration-${id}`,
})

const expired = computed(() => error.value?.statusCode === 410)
if (error.value && !expired.value) {
  throw createError({ statusCode: error.value.statusCode ?? 404, statusMessage: 'Not found', fatal: true })
}
if (expired.value && import.meta.server) setResponseStatus(410)

const absoluteUrl = (path: string) => new URL(path, config.public.siteUrl).toString()

const player = computed<PlayerDeclaration | null>(() => {
  const d = declaration.value
  if (!d) return null
  return {
    authorName: d.authorName,
    partnerName: d.partnerName,
    startDate: d.startDate,
    text: d.text,
    music: d.music,
    photoUrls: d.photoUrls,
    audioUrl: d.audioUrl,
  }
})

// O preview do WhatsApp/Telegram/iMessage lê estas tags no HTML do servidor.
const ogTitle = computed(() => (declaration.value ? t('og.title', { name: declaration.value.partnerName }) : t('expired.title')))
const ogDescription = computed(() =>
  declaration.value ? t('og.description', { name: declaration.value.authorName }) : t('expired.text', { days: config.public.declarationTtlDays }),
)

useSeoMeta({
  title: ogTitle,
  description: ogDescription,
  ogTitle,
  ogDescription,
  ogType: 'website',
  ogSiteName: 'Falamor',
  ogUrl: absoluteUrl(route.fullPath),
  ogImage: declaration.value ? absoluteUrl(declaration.value.coverUrl) : undefined,
  ogImageWidth: declaration.value ? 1200 : undefined,
  ogImageHeight: declaration.value ? 630 : undefined,
  ogImageType: declaration.value ? 'image/jpeg' : undefined,
  ogImageAlt: ogTitle,
  twitterCard: 'summary_large_image',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <main>
    <DeclarationPlayer v-if="player" :declaration="player" mode="public" />

    <div v-else-if="expired" class="expired">
      <HeartsBackground />
      <div class="expired-card">
        <h1 class="expired-title">{{ t('expired.title') }}</h1>
        <p class="expired-text">{{ t('expired.text', { days: config.public.declarationTtlDays }) }}</p>
        <UiButton :to="localePath('/criar')">{{ t('expired.cta') }}</UiButton>
      </div>
    </div>
  </main>
</template>

<style scoped>
.expired {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: 1.5rem;
}

.expired-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  max-width: 30rem;
  text-align: center;
}

.expired-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(2rem, 7vw, 2.75rem);
  line-height: 1.1;
  text-wrap: balance;
}

.expired-text {
  color: var(--color-ink-soft);
}
</style>
