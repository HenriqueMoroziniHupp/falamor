<script setup lang="ts">
const { t } = useI18n()

const steps = computed(() => [
  { title: t('landing.step1Title'), text: t('landing.step1Text') },
  { title: t('landing.step2Title'), text: t('landing.step2Text') },
  { title: t('landing.step3Title'), text: t('landing.step3Text') },
])
</script>

<template>
  <section class="how" aria-labelledby="how-title">
    <h2 id="how-title" class="how-title">{{ t('landing.howTitle') }}</h2>
    <ol class="how-list">
      <li v-for="(step, i) in steps" :key="step.title" class="how-item">
        <span class="how-number" aria-hidden="true">{{ i + 1 }}</span>
        <div>
          <h3 class="how-item-title">{{ step.title }}</h3>
          <p class="how-item-text">{{ step.text }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.how {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 1.25rem 5rem;
}

.how-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 2rem;
  color: var(--color-ink);
}

.how-list {
  display: grid;
  gap: 1.75rem;
  margin-top: 1.75rem;
}

@media (min-width: 900px) {
  .how-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.how-item {
  display: flex;
  gap: 1rem;
}

.how-number {
  flex: none;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 2.75rem;
  line-height: 0.9;
  color: var(--color-rose);
}

.how-item-title {
  font-weight: 800;
  font-size: 1.125rem;
}

.how-item-text {
  margin-top: 0.25rem;
  color: var(--color-ink-soft);
}
</style>
