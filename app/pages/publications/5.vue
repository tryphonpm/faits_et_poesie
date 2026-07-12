<script setup lang="ts">
definePageMeta({ layout: 'newspaper' })

useHead({ title: 'Faits & Poésie — Maquette grille' })
</script>

<template>
  <!-- Ligne 1 : en-tête sur les 5 colonnes (fp-front-header → md:col-span-5) -->
  <FrontHeader
    meteo="étouffant"
  />

  <!-- Sous les drones, la Crimée vit une saison touristique sans estivants ni carburant -->
  <Article id="2026-07-12-08-59-33_1783839573068"/>

  <!-- AFRIQUE DU SUD : RACISME -->
  <Article id="2026-07-12-10-38-34_1783845514434"/>
</template>
