<script setup lang="ts">
defineProps<{ text: string | null }>()
</script>

<template>
  <div class="captions" aria-live="polite">
    <Transition name="caption" mode="out-in">
      <p v-if="text" :key="text" class="caption">{{ text }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.captions {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 0 1.5rem calc(2.5rem + env(safe-area-inset-bottom));
  pointer-events: none;
}

.caption {
  max-width: 34ch;
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.25rem, 4.6vw, 2rem);
  line-height: 1.35;
  text-align: center;
  color: white;
  text-shadow: 0 2px 18px rgb(29 14 22 / 0.65), 0 1px 3px rgb(29 14 22 / 0.5);
  text-wrap: balance;
}

.caption-enter-active,
.caption-leave-active {
  transition: opacity 0.5s var(--ease-gentle), transform 0.5s var(--ease-gentle);
}

.caption-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.caption-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
