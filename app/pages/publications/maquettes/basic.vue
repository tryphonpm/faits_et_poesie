<script setup lang="ts">
definePageMeta({ layout: 'newspaper' })

useHead({ title: 'Faits & Poésie — Maquette grille' })
</script>

<template>
  <!-- Ligne 1 : en-tête sur les 5 colonnes (fp-front-header → md:col-span-5) -->
  <FrontHeader
    meteo="ensoleillé"
  />

  <!-- espagne régularisation -->
  <Article
    id="MAQUETTE"
    :nb-colonnes="5"
    :nb-rows="1"
    layout="float"
    :visuel-colonnes="5"
    visuel-align="left"
    titre-font-size="6xl"
  />
 

</template>
