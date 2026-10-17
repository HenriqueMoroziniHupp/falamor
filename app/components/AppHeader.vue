<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const languages = computed(() =>
  locales.value.map((l) => ({
    code: l.code,
    short: l.code === 'pt-BR' ? 'PT' : 'EN',
    name: l.name ?? l.code,
    to: switchLocalePath(l.code),
    current: l.code === locale.value,
  })),
)
</script>

<template>
  <header class="header">
    <NuxtLink :to="localePath('/')" class="wordmark" :aria-label="t('app.home')">
      falamor<svg class="wordmark-heart" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 28.5 4.2 17.1A7.3 7.3 0 0 1 14.5 6.8L16 8.3l1.5-1.5a7.3 7.3 0 0 1 10.3 10.3Z" /></svg>
    </NuxtLink>

    <nav class="languages" :aria-label="t('app.language')">
      <NuxtLink
        v-for="lang in languages"
        :key="lang.code"
        :to="lang.to"
        class="language"
        :class="{ 'language-current': lang.current }"
        :aria-current="lang.current ? 'true' : undefined"
        :title="lang.name"
      >
        {{ lang.short }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
  margin: 0 auto;
  display: flex;
  width: 100%;
  max-width: 72rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
}

.wordmark {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.125rem;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1;
  color: var(--color-rose-deep);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.wordmark-heart {
  width: 0.6rem;
  height: 0.6rem;
  fill: var(--color-rose);
  margin-top: 0.1rem;
}

.languages {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-petal) 70%, white);
}

.language {
  min-width: 2.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-ink-soft);
  text-decoration: none;
}

.language-current {
  background: white;
  color: var(--color-rose-deep);
  box-shadow: var(--shadow-soft);
}
</style>
