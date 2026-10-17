<script setup lang="ts">
const text = defineModel<string>({ required: true })
const props = defineProps<{ min: number; max: number }>()

const { t } = useI18n()
const length = computed(() => text.value.trim().length)
const tooShort = computed(() => length.value > 0 && length.value < props.min)
</script>

<template>
  <div class="editor">
    <label class="field-label" for="declaration-text">{{ t('declaration.editorLabel') }}</label>
    <textarea
      id="declaration-text"
      v-model="text"
      class="field-input editor-input"
      :maxlength="max"
      :placeholder="t('declaration.editorPlaceholder')"
      rows="9"
    />
    <div class="editor-meta">
      <span class="field-hint">{{ tooShort ? t('declaration.tooShort', { min }) : t('declaration.editorHint') }}</span>
      <span class="editor-count" :class="{ 'editor-count-limit': length >= max }">{{ length }}/{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
.editor-input {
  min-height: 14rem;
  resize: vertical;
  field-sizing: content;
  font-family: var(--font-display);
  font-size: 1.1875rem;
  line-height: 1.6;
}

.editor-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.editor-count {
  font-size: 0.875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink-soft);
}

.editor-count-limit {
  color: var(--color-rose-deep);
}
</style>
