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

  <!-- Saintes Larmes -->
  <Article id="2026-07-12-15-49-51_1783864191468"/>

  <!-- ESSONNE -->
  <Article id="2026-07-12-16-29-52_1783866592980"/>
</template>
