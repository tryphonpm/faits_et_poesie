<script setup lang="ts">
const props = withDefaults(defineProps<{
  topLeft?: string
  topRight?: string
  title?: string
  metaLeft?: string
  metaCenter?: string
  metaRight?: string
}>(), {
  topLeft: 'Météo : clair',
  topRight: 'Faits & Poésie',
  title: 'Faits & Poésie',
  metaLeft: 'Bulletin n°3',
  metaCenter: '',
  metaRight: ''
})

const metaCenterFormatted = computed(() => {
  if (props.metaCenter) return props.metaCenter
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
})
</script>

<template>
  <header class="fp-front-header">
    <div class="fp-front-header-top">
      <div>{{ topLeft }}</div>
      <div>{{ topRight }}</div>
    </div>

    <h1 class="fp-front-header-title">
      {{ title }}
    </h1>

    <div class="fp-front-header-meta">
      <div>{{ metaLeft }}</div>
      <div>{{ metaCenterFormatted }}</div>
      <div v-if="metaRight">{{ metaRight }}</div>
    </div>
  </header>
</template>
