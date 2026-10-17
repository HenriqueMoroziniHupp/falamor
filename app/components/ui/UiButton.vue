<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'soft' | 'ghost'
    size?: 'md' | 'lg'
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'lg', type: 'button' },
)

const NuxtLink = resolveComponent('NuxtLink')

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  { 'btn-block': props.block, 'btn-loading': props.loading },
])
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled || loading"
    :aria-busy="loading || undefined"
    :class="classes"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  border-radius: 999px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s var(--ease-gentle), background-color 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.btn-lg {
  min-height: 3.5rem;
  padding: 0 1.75rem;
  font-size: 1.125rem;
}

.btn-md {
  min-height: 2.75rem;
  padding: 0 1.25rem;
  font-size: 1rem;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: var(--color-rose);
  color: white;
  box-shadow: var(--shadow-rose);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-rose-deep);
}

.btn-soft {
  background: white;
  color: var(--color-rose-deep);
  box-shadow: inset 0 0 0 1.5px var(--color-line);
}

.btn-soft:hover:not(:disabled) {
  background: var(--color-petal);
}

.btn-ghost {
  background: transparent;
  color: var(--color-ink-soft);
}

.btn-ghost:hover:not(:disabled) {
  color: var(--color-rose-deep);
}

.btn-loading {
  opacity: 0.85;
}

.btn-spinner {
  width: 1.1em;
  height: 1.1em;
  border-radius: 999px;
  border: 2.5px solid currentColor;
  border-right-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
