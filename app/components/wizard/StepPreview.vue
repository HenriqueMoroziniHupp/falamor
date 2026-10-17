<script setup lang="ts">
import { useScrollLock } from '@vueuse/core'
import type { PlayerDeclaration } from '~/lib/player'
import type { AppLocale, MusicStyle, VoiceGender } from '#shared/types/declaration'

const props = defineProps<{
  authorName: string
  partnerName: string
  startDate: string | null
  text: string
  voice: VoiceGender
  music: MusicStyle
  photoUrls: string[]
  /** Chave do áudio já gerado para este rascunho (para apagar o anterior se o texto mudou). */
  audioKey: string | null
}>()

const emit = defineEmits<{ audioGenerated: [key: string]; restart: [] }>()

const { t, locale } = useI18n()
const audio = useDeclarationAudio()
const playerDeclaration = shallowRef<PlayerDeclaration | null>(null)
const showPublishInfo = shallowRef(false)

const scrollLock = useScrollLock(import.meta.client ? document.body : null)
watch(playerDeclaration, (open) => (scrollLock.value = Boolean(open)))

const coverStyle = computed(() => (props.photoUrls[0] ? { backgroundImage: `url("${props.photoUrls[0]}")` } : undefined))
const loading = computed(() => audio.status.value === 'loading')

function openPlayer(audioUrl: string | null) {
  playerDeclaration.value = {
    authorName: props.authorName,
    partnerName: props.partnerName,
    startDate: props.startDate,
    text: props.text,
    music: props.music,
    photoUrls: props.photoUrls,
    audioUrl,
  }
}

async function openPreview() {
  const resolved = await audio.resolve({
    text: props.text,
    voice: props.voice,
    locale: locale.value as AppLocale,
    previousKey: props.audioKey,
  })
  if (!resolved) return
  if (resolved.source !== 'sample' && audio.audioKey.value) emit('audioGenerated', audio.audioKey.value)
  openPlayer(resolved.url)
}

function closePreview() {
  playerDeclaration.value = null
}

function restart() {
  if (window.confirm(t('preview.restartConfirm'))) emit('restart')
}
</script>

<template>
  <div class="step">
    <StepHeading :title="t('preview.title', { name: authorName })" :subtitle="t('preview.subtitle', { name: partnerName })" />

    <div class="keepsake">
      <div class="keepsake-photo" :style="coverStyle" />
      <p class="keepsake-to">{{ t('player.titleTo') }} {{ partnerName }}</p>
    </div>

    <div class="actions">
      <UiButton block :loading="loading" @click="openPreview">
        {{ loading ? t('preview.preparing') : t('preview.open') }}
      </UiButton>

      <div v-if="audio.error.value" class="error" role="alert">
        <p>{{ t(audio.error.value) }}</p>
        <button type="button" class="error-action" @click="openPlayer(null)">{{ t('preview.withoutVoice') }}</button>
      </div>

      <UiButton variant="soft" block @click="showPublishInfo = !showPublishInfo">
        {{ t('preview.publish') }}
        <span class="soon">{{ t('preview.soon') }}</span>
      </UiButton>
      <p v-if="showPublishInfo" class="publish-info" role="status">{{ t('preview.publishInfo') }}</p>

      <button type="button" class="restart" @click="restart">{{ t('preview.restart') }}</button>
    </div>

    <Teleport to="body">
      <Transition name="player">
        <div v-if="playerDeclaration" class="player-overlay" role="dialog" aria-modal="true" :aria-label="t('preview.open')">
          <DeclarationPlayer :declaration="playerDeclaration" mode="preview" @close="closePreview" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.step {
  display: grid;
}

.keepsake {
  justify-self: center;
  width: min(100%, 17rem);
  padding: 0.75rem 0.75rem 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 24px 40px -24px rgb(59 30 42 / 0.45), 0 2px 6px rgb(59 30 42 / 0.06);
  rotate: -2.5deg;
}

.keepsake-photo {
  aspect-ratio: 4 / 5;
  border-radius: 0.25rem;
  background: var(--color-petal) center / cover no-repeat;
}

.keepsake-to {
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.375rem;
  text-align: center;
  color: var(--color-rose-deep);
}

.actions {
  display: grid;
  gap: 0.875rem;
  margin-top: 2.25rem;
}

.error {
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: #fff0f2;
  color: var(--color-rose-deep);
  font-weight: 700;
}

.error-action {
  margin-top: 0.375rem;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.soon {
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--color-petal);
  font-size: 0.75rem;
  font-weight: 800;
}

.publish-info {
  color: var(--color-ink-soft);
  text-align: center;
}

.restart {
  justify-self: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  font-weight: 700;
  color: var(--color-ink-soft);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.player-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.player-enter-active,
.player-leave-active {
  transition: opacity 0.35s ease;
}

.player-enter-from,
.player-leave-to {
  opacity: 0;
}
</style>
