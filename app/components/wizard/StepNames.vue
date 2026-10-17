<script setup lang="ts">
const authorName = defineModel<string>('authorName', { required: true })
const partnerName = defineModel<string>('partnerName', { required: true })
const startDate = defineModel<string | null>('startDate', { required: true })

const { t } = useI18n()

const today = new Date().toLocaleDateString('sv-SE') // yyyy-mm-dd no fuso local

const dateValue = computed({
  get: () => startDate.value ?? '',
  set: (value: string) => (startDate.value = value || null),
})
</script>

<template>
  <div>
    <StepHeading :title="t('names.title')" :subtitle="t('names.subtitle')" />

    <div class="fields">
      <div>
        <label class="field-label" for="author-name">{{ t('names.author') }}</label>
        <input
          id="author-name"
          v-model.trim="authorName"
          class="field-input"
          type="text"
          autocomplete="given-name"
          maxlength="40"
          :placeholder="t('names.authorPlaceholder')"
        />
      </div>

      <div>
        <label class="field-label" for="partner-name">{{ t('names.partner') }}</label>
        <input
          id="partner-name"
          v-model.trim="partnerName"
          class="field-input"
          type="text"
          autocomplete="off"
          maxlength="40"
          :placeholder="t('names.partnerPlaceholder')"
        />
      </div>

      <div>
        <label class="field-label" for="start-date">
          {{ t('names.since') }}
          <span class="optional">{{ t('common.optional') }}</span>
        </label>
        <input id="start-date" v-model="dateValue" class="field-input" type="date" :max="today" />
        <p class="field-hint mt-2">{{ t('names.sinceHint') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fields {
  display: grid;
  gap: 1.5rem;
}

.optional {
  margin-left: 0.25rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}
</style>
