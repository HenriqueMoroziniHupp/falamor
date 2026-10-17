<script setup lang="ts">
const head = useLocaleHead()

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
