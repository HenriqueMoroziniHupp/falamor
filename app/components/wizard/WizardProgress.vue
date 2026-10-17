<script setup lang="ts">
const props = defineProps<{ step: number; labels: string[] }>()
const { t } = useI18n()

const current = computed(() => props.labels[props.step] ?? '')
</script>

<template>
  <nav class="progress" :aria-label="t('wizard.progressLabel')">
    <p class="progress-text">
      {{ t('wizard.stepOf', { step: step + 1, total: labels.length }) }}
      <span class="progress-current">{{ current }}</span>
    </p>
    <ol class="progress-bars">
      <li
        v-for="(label, i) in labels"
        :key="label"
        class="progress-bar"
        :class="{ 'progress-bar-done': i <= step }"
        :aria-current="i === step ? 'step' : undefined"
      >
        <span class="sr-only">{{ label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-ink-soft);
}

.progress-current {
  color: var(--color-rose-deep);
}

.progress-bars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.375rem;
  margin-top: 0.625rem;
}

.progress-bar {
  height: 5px;
  border-radius: 99px;
  background: var(--color-petal);
  transition: background-color 0.4s var(--ease-gentle);
}

.progress-bar-done {
  background: var(--color-rose);
}
</style>
