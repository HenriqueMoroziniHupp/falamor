<script setup lang="ts">
const { t, locale } = useI18n()
const { siteUrl } = useRuntimeConfig().public

// Imagem de compartilhamento: fonte em scripts/og/landing.html.
// URL absoluta: a landing é pré-renderizada, então NUXT_PUBLIC_SITE_URL precisa estar certo no build.
const ogImage = computed(() => new URL(`/og/falamor-${locale.value === 'en' ? 'en' : 'pt'}.jpg`, siteUrl).toString())

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDescription'),
  ogType: 'website',
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
