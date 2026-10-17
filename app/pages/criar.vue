<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({ title: () => t('seo.createTitle'), robots: 'noindex' })
</script>

<template>
  <!-- O rascunho vive no IndexedDB do navegador: o wizard só existe no cliente. -->
  <ClientOnly>
    <CreateWizard />
    <template #fallback>
      <WizardSkeleton />
    </template>
  </ClientOnly>
</template>
