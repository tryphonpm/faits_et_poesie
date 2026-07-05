<script setup lang="ts">
const TOP_LEFT = 'Publications Désordonnées'
const TITLE = 'Faits & Poésie'
/** Texte de citation sans guillemets (gérés par la police Ornamenta Monumenta) */
const SUB_TITLE_QUOTE = '« Certains se font de la poésie une idée si vague qu\'ils prennent ce vague pour l\'idée même de la poésie »'
const SUB_TITLE_ATTRIBUTION = ', Paul Valéry'

const props = withDefaults(defineProps<{
  meteo?: string
  bulletin?: string
  metaCenter?: string
  metaRight?: string
}>(), {
  meteo: 'clair',
  bulletin: '3',
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
      <div>{{ TOP_LEFT }}</div>
      <div>Météo : {{ meteo }}</div>
    </div>

      <h1 class="fp-front-header-title">
        {{ TITLE }} 
      </h1>


    <p class="fp-front-header-sub-title">
      <!-- r / t = glyphes guillemets dans Ornamenta Monumenta -->
     
      {{ SUB_TITLE_QUOTE }} {{ SUB_TITLE_ATTRIBUTION }}
     
    </p>

    <div class="fp-front-header-meta">
      <div>Bulletin n°{{ bulletin }}</div>
      <div>{{ metaCenterFormatted }}</div>
      <div v-if="metaRight">{{ metaRight }}</div>
    </div>
  </header>
</template>
