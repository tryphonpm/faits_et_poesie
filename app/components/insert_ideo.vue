<script setup lang="ts">
const colSpanClasses: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5'
}

const props = withDefaults(defineProps<{
  /** Chemin vers le fichier vidéo (ex. `/data/insertVideos/cest_jamais_bien.mp4`) */
  src: string
  /** Largeur dans la grille journal (1 à 5 colonnes) */
  nbColonnes?: number
}>(), {
  nbColonnes: 1
})

const colSpanClass = computed(() => colSpanClasses[props.nbColonnes] ?? colSpanClasses[1])

const videoSrc = computed(() => {
  const path = props.src.trim()
  if (!path) return ''
  if (path.startsWith('public/')) return `/${path.slice('public/'.length)}`
  if (path.startsWith('/')) return path
  return `/${path}`
})
</script>

<template>
  <figure v-if="videoSrc" class="fp-insert-video" :class="colSpanClass">
    <video
      class="fp-insert-video__player"
      :src="videoSrc"
      controls
      playsinline
      preload="metadata"
    />
  </figure>
</template>
