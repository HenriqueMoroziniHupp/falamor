<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <header class="heading">
    <h1 class="heading-title">{{ title }}</h1>
    <p v-if="subtitle" class="heading-subtitle">{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.heading {
  margin-bottom: 1.75rem;
}

.heading-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(2rem, 7.5vw, 2.75rem);
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  text-wrap: balance;
}

.heading-subtitle {
  margin-top: 0.75rem;
  max-width: 40ch;
  color: var(--color-ink-soft);
}
</style>
