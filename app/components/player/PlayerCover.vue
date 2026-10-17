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
  <div class="cover" :class="{ 'is-pressed': pressed, 'is-opening': opening }">
    <HeartsBackground />

    <div class="cover-inner">
      <div class="cover-heading">
        <p class="cover-line1">{{ t('player.cover.line1', { name: authorName }) }}</p>
        <h1 class="cover-line2">{{ t('player.cover.line2', { name: partnerName }) }}</h1>
      </div>

      <div class="envelope">
        <div class="envelope-glow" />
        <div class="envelope-back" />
        <div class="letter">
          <span class="letter-name">{{ partnerName }}</span>
          <svg class="letter-heart" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5 4.6 13.2a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 0 1 6.5 6.5Z" fill="currentColor" />
          </svg>
        </div>
        <div class="envelope-pocket" />
        <div class="envelope-flap">
          <div class="flap-face flap-outside" />
          <div class="flap-face flap-inside" />
        </div>

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

      <div class="cover-footer">
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
  </div>
</template>

<style scoped>
/*
 * Abertura em 5,8 s (COVER_OPEN_MS em ~/lib/player.ts; o som de papel usa PAPER_SOUND_AT):
 *   0,00–0,60  lacre se solta, textos de apoio somem, envelope se ergue um pouco
 *   0,45–1,55  aba abre em 3D (mostra o lado de dentro) e passa para trás da carta
 *   1,30–2,50  carta sobe e sai inteira do envelope; nome e coração aparecem
 *   2,50–3,90  carta vem devagar para a frente e cresce; envelope afunda e some (2,60–3,60)
 *   3,90–5,00  carta parada, flutuando de leve: tempo para ler o nome com calma
 *   5,00–5,80  capa inteira se dissolve na apresentação
 */
.cover {
  --ease-soft: cubic-bezier(0.45, 0, 0.2, 1);
  --ease-out-soft: cubic-bezier(0.22, 0.8, 0.3, 1);

  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  overflow: hidden;
  /* app/spa-loading-template.html repete este gradiente: se mudar aqui, mudar lá. */
  background: radial-gradient(circle at 50% 28%, #fff 0%, var(--color-paper) 42%, var(--color-petal) 100%);
  color: var(--color-ink);
  transition:
    opacity 0.8s ease 5s,
    transform 0.8s var(--ease-soft) 5s;
}

.cover.is-opening {
  opacity: 0;
  transform: scale(1.03);
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

.cover-heading,
.cover-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  perspective: 1100px;
}

/* Ordem das camadas: brilho 0, fundo 0, aba aberta 0, carta 1 (5 quando vem para a frente), bolso 2, aba fechada 3, lacre 4. */
.envelope-glow {
  position: absolute;
  inset: -30% -20%;
  z-index: 0;
  border-radius: 999px;
  background: radial-gradient(closest-side, rgb(255 255 255 / 0.95), rgb(255 228 236 / 0.6) 45%, transparent 75%);
  opacity: 0;
  pointer-events: none;
}

.envelope-back {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 0.75rem;
  background: linear-gradient(180deg, #eeb4c4, #f3c6d2);
  box-shadow: 0 30px 50px -28px rgb(158 36 71 / 0.55);
}

.letter {
  position: absolute;
  left: 7%;
  right: 7%;
  top: 6%;
  bottom: 8%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.375rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0) 70%, rgb(251 227 233 / 0.55)),
    #fffdfd;
  box-shadow:
    0 1px 2px rgb(59 30 42 / 0.1),
    0 10px 24px -14px rgb(158 36 71 / 0.35);
}

.letter-name {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.625rem;
  line-height: 1.1;
  color: var(--color-rose-deep);
  opacity: 0;
}

.letter-heart {
  width: 1rem;
  height: 1rem;
  color: var(--color-rose);
  opacity: 0;
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
  /* Um pouco maior que o recorte do bolso (62%): cobre a emenda e não deixa a carta vazar. */
  height: 64%;
  z-index: 3;
  transform-origin: top;
  transform-style: preserve-3d;
}

/* Duas faces: clip-path achata o 3D, então ele fica nas faces e não na aba. */
.flap-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flap-outside {
  border-radius: 0.75rem 0.75rem 0 0;
  background: linear-gradient(180deg, #f7d3dc, #f0bccb);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

/* Lado de dentro, visto depois de aberta: base na dobra, ponta para cima. */
.flap-inside {
  transform: rotateX(180deg);
  background: linear-gradient(0deg, #fbe6ec, #fff4f7);
  clip-path: polygon(0 100%, 100% 100%, 50% 0);
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
  transition: scale 0.25s var(--ease-out-soft);
}

.seal:disabled {
  cursor: progress;
  animation-duration: 1.1s;
}

.seal svg {
  width: 100%;
  height: 100%;
}

/* Toque registrado: o lacre afunda enquanto a tela cheia assenta. */
.is-pressed .seal {
  animation: none;
  scale: 0.94;
  cursor: default;
}

/* ── abertura ─────────────────────────────────────────────────────────── */
.is-opening .cover-footer {
  animation: fade-away 0.45s ease both;
}

.is-opening .cover-heading {
  animation: fade-away 0.7s ease 1.2s both;
}

.is-opening .envelope {
  animation: envelope-lift 0.6s var(--ease-out-soft) both;
}

.is-opening .seal {
  animation: seal-release 0.6s var(--ease-soft) both;
}

.is-opening .envelope-flap {
  animation:
    flap-open 1.1s var(--ease-soft) 0.45s both,
    envelope-sink 1s var(--ease-soft) 2.6s both;
}

/* Opacidade na aba achataria o 3D (e trocaria a face visível): o fade fica nas faces. */
.is-opening .flap-face {
  animation: fade-away 1s ease 2.6s both;
}

.is-opening .envelope-back,
.is-opening .envelope-pocket {
  animation:
    envelope-sink 1s var(--ease-soft) 2.6s both,
    fade-away 1s ease 2.6s both;
}

.is-opening .envelope-glow {
  animation: glow 1.9s ease 1.2s both;
}

.is-opening .letter {
  /* forwards (não both) nas duas últimas: o preenchimento para trás delas anularia a subida. */
  animation:
    letter-rise 1.2s var(--ease-soft) 1.3s both,
    letter-forward 1.4s var(--ease-soft) 2.5s forwards,
    letter-float 1.6s ease-in-out 3.9s forwards;
}

.is-opening .letter-name {
  animation: fade-in 0.6s ease 1.85s both;
}

.is-opening .letter-heart {
  animation: fade-in 0.6s ease 2.1s both;
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

@keyframes fade-away {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes envelope-lift {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-0.5rem);
  }
}

@keyframes seal-release {
  0% {
    scale: 0.94;
    rotate: 0deg;
    opacity: 1;
  }
  40% {
    scale: 1.1;
    rotate: -4deg;
    opacity: 1;
  }
  100% {
    scale: 0.7;
    rotate: 10deg;
    opacity: 0;
  }
}

/* z-index troca na metade (aba de pé), então ela nunca cobre a carta. */
@keyframes flap-open {
  0% {
    transform: rotateX(0deg);
    z-index: 3;
  }
  49% {
    z-index: 3;
  }
  50% {
    z-index: 0;
  }
  100% {
    transform: rotateX(180deg);
    z-index: 0;
  }
}

@keyframes envelope-sink {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 1.75rem;
  }
}

@keyframes glow {
  0% {
    opacity: 0;
    scale: 0.8;
  }
  60% {
    opacity: 1;
    scale: 1;
  }
  100% {
    opacity: 0.85;
    scale: 1.08;
  }
}

/* Sobe até sair inteira do envelope (ainda atrás do bolso). */
@keyframes letter-rise {
  from {
    transform: translateY(0) scale(1);
  }
  to {
    transform: translateY(-104%) scale(1.02);
  }
}

/* Já fora, passa para a frente do bolso e desce devagar, maior, para o nome ser lido. */
@keyframes letter-forward {
  from {
    transform: translateY(-104%) scale(1.02);
    z-index: 5;
  }
  to {
    transform: translateY(-30%) scale(1.2);
    z-index: 5;
  }
}

/* Respiro enquanto a carta fica parada. */
@keyframes letter-float {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -0.375rem;
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
