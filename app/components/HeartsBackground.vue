<script setup lang="ts">
interface FloatingHeart {
  left: number
  size: number
  duration: number
  delay: number
  sway: number
  tone: 'rose' | 'blush'
  opacity: number
}

// Valores fixos (sem Math.random) para o SSR e o cliente renderizarem igual.
const HEARTS: FloatingHeart[] = [
  { left: 4, size: 14, duration: 34, delay: -3, sway: 18, tone: 'blush', opacity: 0.9 },
  { left: 12, size: 22, duration: 41, delay: -22, sway: 26, tone: 'rose', opacity: 0.16 },
  { left: 21, size: 12, duration: 29, delay: -11, sway: 14, tone: 'blush', opacity: 0.8 },
  { left: 33, size: 18, duration: 38, delay: -30, sway: 22, tone: 'rose', opacity: 0.12 },
  { left: 44, size: 10, duration: 26, delay: -6, sway: 12, tone: 'blush', opacity: 0.85 },
  { left: 55, size: 24, duration: 45, delay: -17, sway: 30, tone: 'blush', opacity: 0.7 },
  { left: 63, size: 13, duration: 31, delay: -26, sway: 16, tone: 'rose', opacity: 0.14 },
  { left: 72, size: 19, duration: 36, delay: -9, sway: 20, tone: 'blush', opacity: 0.85 },
  { left: 81, size: 11, duration: 28, delay: -19, sway: 14, tone: 'rose', opacity: 0.12 },
  { left: 90, size: 21, duration: 43, delay: -34, sway: 24, tone: 'blush', opacity: 0.75 },
  { left: 96, size: 12, duration: 33, delay: -14, sway: 12, tone: 'blush', opacity: 0.8 },
]

const hearts = HEARTS.map((h) => ({
  ...h,
  style: {
    left: `${h.left}%`,
    width: `${h.size}px`,
    height: `${h.size}px`,
    opacity: h.opacity,
    animationDuration: `${h.duration}s`,
    animationDelay: `${h.delay}s`,
    '--sway': `${h.sway}px`,
  },
}))
</script>

<template>
  <div class="hearts" aria-hidden="true">
    <span v-for="(heart, i) in hearts" :key="i" class="heart-rise" :style="heart.style">
      <svg class="heart-sway" :class="`heart-${heart.tone}`" viewBox="0 0 32 32">
        <path d="M16 28.5 4.2 17.1A7.3 7.3 0 0 1 14.5 6.8L16 8.3l1.5-1.5a7.3 7.3 0 0 1 10.3 10.3Z" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.hearts {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.heart-rise {
  position: absolute;
  bottom: -40px;
  animation-name: rise;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.heart-sway {
  width: 100%;
  height: 100%;
  animation: sway 7s ease-in-out infinite alternate;
}

.heart-rose {
  fill: var(--color-rose);
}

.heart-blush {
  fill: var(--color-blush);
}

@keyframes rise {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100dvh - 80px));
  }
}

@keyframes sway {
  from {
    transform: translateX(calc(var(--sway) * -1)) rotate(-12deg);
  }
  to {
    transform: translateX(var(--sway)) rotate(12deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hearts {
    display: none;
  }
}
</style>
