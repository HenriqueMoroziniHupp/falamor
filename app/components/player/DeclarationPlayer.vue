<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { TITLE_DURATION, activeCaptionIndex, clamp01, visibleSlides } from '~/lib/timeline'
import { COVER_OPEN_MS, FULLSCREEN_SETTLE_MS, PAPER_SOUND_AT, PAPER_SOUND_URL, kenBurnsOrigin, type PlayerDeclaration, type PlayerMode, type SlideLayer } from '~/lib/player'

const props = defineProps<{ declaration: PlayerDeclaration; mode: PlayerMode }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const root = useTemplateRef<HTMLElement>('root')

/** cover → envelope fechado; opening → animação de abrir; show → apresentação. */
const phase = shallowRef<'cover' | 'opening' | 'show'>('cover')

const playback = usePlayback(() => ({
  audioUrl: props.declaration.audioUrl,
  text: props.declaration.text,
  photoCount: props.declaration.photoUrls.length,
  music: props.declaration.music,
}))
const { status, elapsed, timeline, muted } = playback

const { veiled, flash, reveal } = useCaptureGuard({
  strict: () => props.mode === 'preview',
  onConceal: () => void playback.pause(),
})

const { summary: together } = useTogetherCounter(() => props.declaration.startDate)

const layers = computed<SlideLayer[]>(() => {
  const tl = timeline.value
  if (!tl || phase.value === 'cover') return []
  return visibleSlides(tl.slides, elapsed.value).map(({ slide, index, opacity, progress }) => ({
    key: `${index}`,
    url: props.declaration.photoUrls[slide.photoIndex] ?? '',
    opacity,
    progress,
    origin: kenBurnsOrigin(index),
  }))
})

const segments = computed(() =>
  (timeline.value?.slides ?? []).map((s) => clamp01((elapsed.value - s.start) / s.duration)),
)

const caption = computed(() => {
  const captions = timeline.value?.captions ?? []
  const index = activeCaptionIndex(captions, elapsed.value)
  return index >= 0 ? captions[index]!.text : null
})

const isRunning = computed(() => status.value === 'playing' || status.value === 'paused')
const showTitle = computed(() => phase.value !== 'cover' && isRunning.value && elapsed.value < TITLE_DURATION)
const showPaused = computed(() => veiled.value || (phase.value === 'show' && status.value === 'paused'))

/** Onde dá para entrar em tela cheia, a animação espera a troca de modo assentar. */
const openDelay = canFullscreen() ? FULLSCREEN_SETTLE_MS : 0

onMounted(() => {
  void playback.prepare()
  void playback.preloadSound(PAPER_SOUND_URL)
})

async function onOpen() {
  // Ainda dentro do toque no lacre: tela cheia antes de qualquer await.
  enterFullscreen(root.value)
  phase.value = 'opening'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const settle = openDelay / 1000
  await playback.start(settle + (reduced ? 0.15 : COVER_OPEN_MS / 1000))
  if (!reduced) void playback.playSound(PAPER_SOUND_URL, settle + PAPER_SOUND_AT)
}

function close() {
  exitFullscreen(root.value)
  emit('close')
}

onBeforeUnmount(() => exitFullscreen(root.value))

function onStageTap() {
  if (status.value === 'playing') void playback.pause()
  else if (status.value === 'paused') void playback.resume()
}

function onResume() {
  reveal()
  void playback.resume()
}

onKeyStroke('Escape', () => {
  if (props.mode === 'preview') close()
})
onKeyStroke(' ', (e) => {
  if (phase.value !== 'show') return
  e.preventDefault()
  onStageTap()
})
</script>

<template>
  <div
    ref="root"
    class="player"
    :class="{ 'player-preview': mode === 'preview' }"
    role="region"
    :aria-label="t('player.label', { name: declaration.partnerName })"
    @contextmenu.prevent
    @dragstart.prevent
  >
    <div class="stage" @click="onStageTap">
      <PlayerSlides :layers="layers" />
      <div class="shade" />
      <Transition name="fade-slow">
        <PlayerTitle v-if="showTitle" :author-name="declaration.authorName" :partner-name="declaration.partnerName" />
      </Transition>
      <PlayerCaptions :text="caption" />
    </div>

    <PlayerTopBar
      v-if="phase !== 'cover' && status !== 'ended'"
      :segments="segments"
      :together="together"
      :muted="muted"
      :closable="mode === 'preview'"
      @toggle-mute="playback.toggleMute"
      @close="close"
    />

    <Transition name="fade-slow">
      <PlayerOutro
        v-if="status === 'ended'"
        :author-name="declaration.authorName"
        :partner-name="declaration.partnerName"
        :start-date="declaration.startDate"
        :mode="mode"
        @replay="playback.replay"
        @close="close"
      />
    </Transition>

    <Transition name="fade">
      <div v-if="showPaused" class="paused" :class="{ 'paused-veiled': veiled }" @click="onResume">
        <button type="button" class="paused-button" @click.stop="onResume">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" /></svg>
          {{ t('player.resume') }}
        </button>
        <p v-if="veiled" class="paused-note">{{ t('player.protectedNote') }}</p>
      </div>
    </Transition>

    <PlayerCover
      v-if="phase !== 'show'"
      :author-name="declaration.authorName"
      :partner-name="declaration.partnerName"
      :ready="status !== 'preparing'"
      :open-delay="openDelay"
      @open="onOpen"
      @opened="phase = 'show'"
    />

    <PreviewWatermark v-if="mode === 'preview'" />
    <div v-if="flash" class="flash" />
  </div>
</template>

<style scoped>
.player {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-night);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

.stage {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(transparent 55%, rgb(29 14 22 / 0.72));
}

.paused {
  position: absolute;
  inset: 0;
  z-index: 35;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  background: rgb(29 14 22 / 0.45);
  backdrop-filter: blur(2px);
}

/* Prévia escondida (print, troca de aba, perda de foco): nada de foto visível. */
.paused-veiled {
  background: var(--color-night);
  backdrop-filter: none;
}

.paused-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0 1.75rem;
  border-radius: 999px;
  background: white;
  color: var(--color-rose-deep);
  font-size: 1.125rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 30px -14px rgb(0 0 0 / 0.6);
}

.paused-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.paused-note {
  max-width: 28ch;
  font-size: 0.9375rem;
  color: rgb(255 255 255 / 0.75);
}

.flash {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: black;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: opacity 0.9s ease;
}

.fade-enter-from,
.fade-leave-to,
.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}
</style>
