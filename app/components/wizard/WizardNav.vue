<script setup lang="ts">
defineProps<{ canBack: boolean; canContinue: boolean; hint: string | null }>()
const emit = defineEmits<{ back: []; next: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="nav">
    <p v-if="hint && !canContinue" class="nav-hint">{{ hint }}</p>
    <div class="nav-row">
      <UiButton v-if="canBack" variant="ghost" size="lg" @click="emit('back')">{{ t('wizard.back') }}</UiButton>
      <UiButton class="nav-next" :disabled="!canContinue" @click="emit('next')">{{ t('wizard.next') }}</UiButton>
    </div>
  </div>
</template>

<style scoped>
.nav {
  position: sticky;
  bottom: 0;
  z-index: 5;
  margin: 0 -1.25rem;
  padding: 0.875rem 1.25rem calc(0.875rem + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, var(--color-paper) 30%);
}

.nav-hint {
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  text-align: right;
  color: var(--color-ink-soft);
}

.nav-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.nav-next {
  min-width: 10rem;
}

@media (max-width: 480px) {
  .nav-next {
    flex: 1;
  }
}
</style>
