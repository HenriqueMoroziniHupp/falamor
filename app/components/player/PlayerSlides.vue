<script setup lang="ts">
import type { SlideLayer } from '~/lib/player'

const props = defineProps<{ layers: SlideLayer[] }>()

const styled = computed(() =>
  props.layers.map((layer) => {
    const image = `url("${layer.url}")`
    return {
      key: layer.key,
      layerStyle: { opacity: layer.opacity },
      backdropStyle: { backgroundImage: image },
      photoStyle: {
        backgroundImage: image,
        transform: `scale(${(1.03 + layer.progress * 0.11).toFixed(4)})`,
        transformOrigin: layer.origin,
      },
    }
  }),
)
</script>

<template>
  <div class="slides" aria-hidden="true">
    <div v-for="layer in styled" :key="layer.key" class="slide" :style="layer.layerStyle">
      <!-- Fundo desfocado da mesma foto: preenche a tela sem cortar fotos verticais/horizontais. -->
      <div class="slide-backdrop" :style="layer.backdropStyle" />
      <div class="slide-photo" :style="layer.photoStyle" />
    </div>
  </div>
</template>

<style scoped>
.slides {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--color-night);
}

.slide {
  position: absolute;
  inset: 0;
  will-change: opacity;
}

.slide-backdrop {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  filter: blur(36px) saturate(1.15) brightness(0.72);
}

.slide-photo {
  position: absolute;
  inset: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  will-change: transform;
}
</style>
