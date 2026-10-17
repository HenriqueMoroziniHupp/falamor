<script setup lang="ts">
defineProps<{ authorName: string; partnerName: string }>()

const { t } = useI18n()
</script>

<template>
  <div class="title">
    <p class="title-to">{{ t('player.titleTo') }}</p>
    <p class="title-name">{{ partnerName }}</p>
    <p class="title-from">{{ t('player.titleFrom', { name: authorName }) }}</p>
  </div>
</template>

<style scoped>
.title {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: white;
  background: radial-gradient(ellipse at center, rgb(29 14 22 / 0.45), transparent 70%);
  pointer-events: none;
}

.title-to {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.25rem;
  opacity: 0.9;
}

.title-name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(3rem, 14vw, 6.5rem);
  line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 30px rgb(29 14 22 / 0.5);
}

.title-from {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
}
</style>
