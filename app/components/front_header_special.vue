<script setup lang="ts">
const TOP_LEFT = '@publicationsdesordonnees'
const TITLE = 'F A I T S & P O É S I E'
const titleSegments = TITLE.split(/(&)/)
const HEADER_ILLUSTRATION_SRC = '/data/visuels/publicationsdesordonnees_reduit_gauche.png'
const HEADER_GIF_SRC = '/data/visuels/publicationsdesordonnees_reduit_droite.png'
const SUB_TITLE_QUOTE = '« Certains se font de la poésie une idée si vague qu\'ils prennent ce vague pour l\'idée même de la poésie »'
const SUB_TITLE_ATTRIBUTION = ', Paul Valéry'
const EDITION = 'É D I T I O N '
const SPECIALE = 'S P É C I A L E'

const props = withDefaults(defineProps<{
  meteo?: string
  metaCenter?: string
  metaRight?: string
}>(), {
  meteo: 'clair',
  metaCenter: '',
  metaRight: ''
})

const route = useRoute()

const bulletin = computed(() => {
  const match = route.path.match(/\/publications_speciales\/(\d+)\/?$/)
  return match?.[1] ?? ''
})

interface PublicationSpecialeHeader {
  numero: number
  titre: string
  date_publication: string
}

const { data: publication } = await useAsyncData(
  () => `front-header-pub-speciale-${bulletin.value || 'none'}`,
  () => bulletin.value
    ? $fetch<PublicationSpecialeHeader>(`/api/publications-speciales/${bulletin.value}`)
    : Promise.resolve(null),
  { watch: [bulletin] }
)

function formatPublicationDateFr(dateStr: string) {
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const metaCenterFormatted = computed(() => {
  if (props.metaCenter) return props.metaCenter
  if (publication.value?.date_publication) {
    return formatPublicationDateFr(publication.value.date_publication)
  }
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
      <div class="fp-front-header-top-left">{{ TOP_LEFT }}</div>
      <div class="fp-front-header-top-meteo">Météo : {{ meteo }}</div>
    </div>

    <div class="fp-front-header-main">
      <img
        class="fp-front-header-illustration hidden md:block"
        :src="HEADER_ILLUSTRATION_SRC"
        alt=""
        aria-hidden="true"
      />
      <img
        class="fp-front-header-illustration-right hidden md:block"
        :src="HEADER_GIF_SRC"
        alt=""
        aria-hidden="true"
      />
      <h1 class="fp-front-header-title">
        <template v-for="(segment, index) in titleSegments" :key="index">
          <span v-if="segment === '&'" class="fp-front-header-title-amp pl-2 pr-3 text-rubrique text-7xl">&</span>
          <span v-else class="fp-front-header-title-font">{{ segment }}</span>
        </template>
      </h1>

      <p class="fp-front-header-sub-title">
        {{ SUB_TITLE_QUOTE }} {{ SUB_TITLE_ATTRIBUTION }}
      </p>
    </div>

    <div class="fp-front-header-meta items-center">
      <div>Numéro spécial n°{{ bulletin }}</div>
      <div  class="pl-2 pr-3 text-rubrique text-2xl">{{ EDITION }} &nbsp;&nbsp;&nbsp; {{ SPECIALE }}</div>
      <div>{{ metaCenterFormatted }}</div>
    </div>
  </header>
</template>
