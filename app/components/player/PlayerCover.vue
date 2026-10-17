<script setup lang="ts">
import { COVER_OPEN_MS } from '~/lib/player'

const props = defineProps<{
  authorName: string
  partnerName: string
  ready: boolean
  /** Espera (ms) entre o toque e a animação, para a tela cheia assentar. */
  openDelay?: number
}>()
const emit = defineEmits<{ open: []; opened: [] }>()

const { t } = useI18n()
const pressed = shallowRef(false)
const opening = shallowRef(false)

/** Contorno irregular de lacre de cera (determinístico, igual no SSR e no cliente). */
function waxPath(cx = 50, cy = 50, r = 44): string {
  const steps = 96
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const rr = r + Math.sin(a * 11) * 2.4 + Math.sin(a * 3 + 1) * 1.4
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`
  }
  return `${d}Z`
}

const sealPath = waxPath()

function open() {
  if (!props.ready || pressed.value) return
  pressed.value = true
  // O áudio começa já no toque (exigência de autoplay); a animação cobre a entrada da música.
  emit('open')
  const delay = props.openDelay ?? 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  setTimeout(() => (opening.value = true), delay)
  setTimeout(() => emit('opened'), delay + (reduced ? 0 : COVER_OPEN_MS))
}
</script>

<template>
  <div class="cover" :class="{ 'is-opening': opening }">
    <HeartsBackground />

    <div class="cover-inner">
      <p class="cover-line1">{{ t('player.cover.line1', { name: authorName }) }}</p>
      <h1 class="cover-line2">{{ t('player.cover.line2', { name: partnerName }) }}</h1>

      <div class="envelope">
        <div class="envelope-back" />
        <div class="letter">
          <span class="letter-name">{{ partnerName }}</span>
        </div>
        <div class="envelope-pocket" />
        <div class="envelope-flap" />

        <button type="button" class="seal" :disabled="!ready" :aria-label="t('player.cover.open')" @click="open">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <radialGradient id="wax" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stop-color="#d9527a" />
                <stop offset="55%" stop-color="#a3264b" />
                <stop offset="100%" stop-color="#741331" />
              </radialGradient>
            </defs>
            <path :d="sealPath" fill="url(#wax)" />
            <circle cx="50" cy="50" r="31" fill="none" stroke="#6d1130" stroke-opacity="0.45" stroke-width="2.5" />
            <circle cx="50" cy="50.8" r="31" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="1" />
            <path
              d="M50 66 35.6 52a8.6 8.6 0 0 1 12.2-12.2L50 42l2.2-2.2A8.6 8.6 0 0 1 64.4 52Z"
              fill="#7d1636"
              stroke="#ffffff"
              stroke-opacity="0.22"
              stroke-width="1.2"
            />
            <ellipse cx="36" cy="28" rx="12" ry="6" fill="#fff" opacity="0.16" transform="rotate(-28 36 28)" />
          </svg>
        </button>
      </div>

      <p class="cover-hint" aria-live="polite">{{ ready ? t('player.cover.tap') : t('player.cover.preparing') }}</p>
      <p class="cover-sound">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
        </svg>
        {{ t('player.cover.sound') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.cover {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  overflow: hidden;
  /* app/spa-loading-template.html repete este gradiente: se mudar aqui, mudar lá. */
  background: radial-gradient(circle at 50% 28%, #fff 0%, var(--color-paper) 42%, var(--color-petal) 100%);
  color: var(--color-ink);
  /* A capa só some depois que a carta saiu inteira do envelope (COVER_OPEN_MS). */
  transition: opacity 0.6s ease 2.2s, transform 0.7s var(--ease-gentle) 2.2s;
}

.cover.is-opening {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
}

.cover-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
}

.cover-line1 {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-ink-soft);
}

.cover-line2 {
  margin-top: 0.25rem;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(2.25rem, 9vw, 3.5rem);
  line-height: 1.05;
  color: var(--color-rose-deep);
  text-wrap: balance;
}

/* ── envelope ─────────────────────────────────────────────────────────── */
.envelope {
  position: relative;
  width: min(80vw, 22rem);
  aspect-ratio: 3 / 2;
  margin: 2.75rem 0 1.75rem;
  perspective: 1200px;
}

.envelope-back {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 0.75rem;
  background: #f1bfcd;
  box-shadow: 0 30px 50px -28px rgb(158 36 71 / 0.55);
}

.letter {
  position: absolute;
  left: 7%;
  right: 7%;
  top: 6%;
  bottom: 8%;
  /* À frente da aba aberta, atrás do bolso: sai de dentro do envelope. */
  z-index: 1;
  display: grid;
  place-items: center;
  border-radius: 0.375rem;
  background: #fffdfd;
  box-shadow: 0 1px 3px rgb(59 30 42 / 0.12);
  transition: transform 1.1s var(--ease-gentle) 1.1s;
}

.letter-name {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.5rem;
  color: var(--color-rose-deep);
  opacity: 0;
  transition: opacity 0.5s ease 1.6s;
}

.envelope-pocket {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 0.75rem;
  background: linear-gradient(170deg, #fbe0e7, #f5c9d5);
  clip-path: polygon(0 0, 50% 62%, 100% 0, 100% 100%, 0 100%);
}

.envelope-flap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 62%;
  z-index: 3;
  background: linear-gradient(180deg, #f7d3dc, #f0bccb);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  border-radius: 0.75rem 0.75rem 0 0;
  transform-origin: top;
  /* Desce para trás da carta na metade do giro, quando já está de pé. */
  transition: transform 0.9s var(--ease-gentle) 0.3s, z-index 0s linear 0.75s;
}

.seal {
  position: absolute;
  left: 50%;
  top: 62%;
  z-index: 4;
  width: 5.5rem;
  height: 5.5rem;
  translate: -50% -50%;
  border-radius: 999px;
  cursor: pointer;
  filter: drop-shadow(0 6px 8px rgb(116 19 49 / 0.35));
  animation: breathe 2.6s ease-in-out infinite;
  transition: opacity 0.4s ease, scale 0.4s var(--ease-gentle);
}

.seal:disabled {
  cursor: progress;
  animation-duration: 1.1s;
}

.seal svg {
  width: 100%;
  height: 100%;
}

.is-opening .seal {
  animation: none;
  scale: 1.18;
  opacity: 0;
}

.is-opening .envelope-flap {
  transform: rotateX(180deg);
  z-index: 0;
}

.is-opening .letter {
  transform: translateY(-45%);
}

.is-opening .letter-name {
  opacity: 1;
}

@keyframes breathe {
  0%,
  100% {
    scale: 1;
  }
  50% {
    scale: 1.05;
  }
}

/* ── textos de apoio ──────────────────────────────────────────────────── */
.cover-hint {
  font-weight: 700;
  color: var(--color-rose-deep);
}

.cover-sound {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.9375rem;
  color: var(--color-ink-soft);
}

.cover-sound svg {
  width: 1.125rem;
  height: 1.125rem;
}
</style>
