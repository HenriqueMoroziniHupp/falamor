<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <h1 class="hero-title">{{ t('landing.title') }}</h1>
      <p class="hero-lead">{{ t('landing.lead') }}</p>
      <div class="hero-actions">
        <UiButton :to="localePath('/criar')">{{ t('landing.cta') }}</UiButton>
        <UiButton variant="ghost" :to="localePath('/d/demo')">{{ t('landing.example') }}</UiButton>
      </div>
    </div>
    <div class="hero-visual">
      <LandingMemory />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 3rem;
  align-items: center;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

@media (min-width: 900px) {
  .hero {
    grid-template-columns: 1.15fr 0.85fr;
    padding-top: 4rem;
  }
}

.hero-title {
  max-width: 16ch;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--color-ink);
  text-wrap: balance;
}

.hero-lead {
  max-width: 40ch;
  margin-top: 1.5rem;
  font-size: 1.1875rem;
  color: var(--color-ink-soft);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.25rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
}
</style>
