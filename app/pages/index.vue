<script setup lang="ts">
const { t, locale } = useI18n()
const { siteUrl } = useRuntimeConfig().public

// Imagem de compartilhamento: fonte em scripts/og/landing.html.
// URL absoluta: a landing é pré-renderizada, então NUXT_PUBLIC_SITE_URL precisa estar certo no build.
// Mudou a imagem? Suba o `v`: WhatsApp e Facebook guardam a prévia pela URL.
const ogImage = computed(() => new URL(`/og/falamor-${locale.value === 'en' ? 'en' : 'pt'}.jpg?v=2`, siteUrl).toString())
const pageUrl = computed(() => new URL(locale.value === 'en' ? '/en' : '/', siteUrl).toString())

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDescription'),
  ogType: 'website',
  ogUrl: pageUrl,
  ogSiteName: 'Falamor',
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: () => t('seo.homeImageAlt'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.homeTitle'),
  twitterDescription: () => t('seo.homeDescription'),
  twitterImage: ogImage,
  twitterImageAlt: () => t('seo.homeImageAlt'),
})
</script>

<template>
  <div>
    <LandingHero />
    <LandingSteps />
  </div>
</template>
