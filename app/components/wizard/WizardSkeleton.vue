<template>
  <div class="skeleton" aria-hidden="true">
    <div class="skeleton-bar" />
    <div class="skeleton-title" />
    <div class="skeleton-line" />
    <div class="skeleton-field" />
    <div class="skeleton-field" />
  </div>
</template>

<style scoped>
.skeleton {
  display: grid;
  gap: 1rem;
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
  padding: 0.5rem 1.25rem;
}

.skeleton > div {
  border-radius: 1rem;
  background: var(--color-petal);
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-bar {
  height: 0.5rem;
  margin-bottom: 1.5rem;
}

.skeleton-title {
  height: 2.75rem;
  width: 80%;
}

.skeleton-line {
  height: 1.25rem;
  width: 60%;
  margin-bottom: 1rem;
}

.skeleton-field {
  height: 3.5rem;
}

@keyframes pulse {
  50% {
    opacity: 0.55;
  }
}
</style>
