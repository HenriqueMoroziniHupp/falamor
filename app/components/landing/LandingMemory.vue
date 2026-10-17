<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { sampleText } from '#shared/samples'
import type { AppLocale } from '#shared/types/declaration'
import { splitCaptions } from '~/lib/timeline'

const PHOTOS = ['/demo/1.jpg', '/demo/2.jpg', '/demo/3.jpg', '/demo/4.jpg', '/demo/5.jpg', '/demo/6.jpg']
const SLIDE_MS = 4500

const { t, locale } = useI18n()
const index = shallowRef(0)
useIntervalFn(() => (index.value = (index.value + 1) % PHOTOS.length), SLIDE_MS)

const captions = computed(() => splitCaptions(sampleText('lugar-favorito', locale.value as AppLocale, 'male')))
const caption = computed(() => captions.value[index.value % captions.value.length])

const slides = PHOTOS.map((src, i) => ({ src, style: { backgroundImage: `url("${src}")` }, origin: ['50% 60%', '50% 30%', '40% 40%', '50% 70%', '45% 35%', '50% 60%'][i] }))
</script>

<template>
  <figure class="phone" :aria-label="t('landing.example')">
    <div class="screen">
      <div
        v-for="(slide, i) in slides"
        :key="slide.src"
        class="memory-photo"
        :class="{ 'memory-photo-active': i === index }"
        :style="{ ...slide.style, transformOrigin: slide.origin }"
      />
      <div class="memory-shade" />

      <div class="memory-bars" aria-hidden="true">
        <span v-for="(slide, i) in slides" :key="slide.src" class="memory-bar">
          <span class="memory-bar-fill" :class="{ 'memory-bar-done': i < index, 'memory-bar-active': i === index }" />
        </span>
      </div>

      <p class="memory-to">{{ t('player.titleTo') }} {{ t('landing.demoPartner') }}</p>

      <Transition name="memory-caption" mode="out-in">
        <p :key="caption" class="memory-caption">{{ caption }}</p>
      </Transition>
    </div>
  </figure>
</template>

<style scoped>
.phone {
  width: min(78vw, 19rem);
  aspect-ratio: 9 / 18.5;
  padding: 0.625rem;
  border-radius: 2.75rem;
  background: #2b1520;
  box-shadow: 0 40px 70px -35px rgb(158 36 71 / 0.65), inset 0 0 0 2px rgb(255 255 255 / 0.06);
  rotate: 3deg;
}

.screen {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 2.25rem;
  background: var(--color-night);
}

.memory-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.memory-photo-active {
  opacity: 1;
  animation: kenburns 6s linear forwards;
}

@keyframes kenburns {
  from {
    transform: scale(1.03);
  }
  to {
    transform: scale(1.16);
  }
}

.memory-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgb(29 14 22 / 0.4), transparent 22%, transparent 50%, rgb(29 14 22 / 0.8));
}

.memory-bars {
  position: absolute;
  top: 1.25rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 3px;
}

.memory-bar {
  flex: 1;
  height: 2.5px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.3);
  overflow: hidden;
}

.memory-bar-fill {
  display: block;
  height: 100%;
  background: white;
  transform: scaleX(0);
  transform-origin: left;
}

.memory-bar-done {
  transform: scaleX(1);
}

.memory-bar-active {
  animation: fill 4.5s linear forwards;
}

@keyframes fill {
  to {
    transform: scaleX(1);
  }
}

.memory-to {
  position: absolute;
  top: 2.25rem;
  left: 1rem;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.125rem;
  color: white;
}

.memory-caption {
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: 2rem;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.0625rem;
  line-height: 1.4;
  text-align: center;
  color: white;
  text-shadow: 0 2px 12px rgb(29 14 22 / 0.7);
  text-wrap: balance;
}

.memory-caption-enter-active,
.memory-caption-leave-active {
  transition: opacity 0.5s ease;
}

.memory-caption-enter-from,
.memory-caption-leave-to {
  opacity: 0;
}
</style>
