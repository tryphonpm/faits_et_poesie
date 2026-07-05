<script setup lang="ts">
definePageMeta({ layout: 'newspaper' })

useHead({ title: 'Faits & Poésie — Maquette grille' })
</script>

<template>
  <!-- Ligne 1 : en-tête sur les 5 colonnes (fp-front-header → md:col-span-5) -->
  <FrontHeader
    meteo="couvert"
    bulletin="20"
  />

  <!-- espagne régularisation -->
  <Article
    id="2026-07-03-20-31-42_1783103502116"
    :nb-colonnes="4"
    :nb-rows="1"
    layout="float"
    :visuel-colonnes="3"
    visuel-align="left"
    titre-font-size="6xl"
    
  />
      <!-- Mélenchon -->
      <Article
    id="2026-07-04-08-10-09_1783145409346"
    :nb-colonnes="1"
    :nb-rows="3"
    bordure-gauche
     titre-font-size="4xl"
     visuel-position="after-article"
  />

  
  <!-- Corbeil accident -->
  <Article
    id="2026-07-04-08-10-37_1783145437671"
    :nb-colonnes="2"
    :nb-rows="1"

  />
    <!-- Guerre Poutine -->
  <Article
    id="2026-07-04-08-11-22_1783145482675"
    :nb-colonnes="2"
    :nb-rows="2"
    layout="float"
    :visuel-colonnes="1"
    visuel-align="right"
      titre-font-size="6xl"
  />
    <!-- machine à coudre -->
    <Article
    id="2026-07-04-08-13-19_1783145599748"
    :nb-colonnes="2"
    :nb-rows="1"
    masquer-titre
  /> 
  <!-- PFAS -->
  <Article
    id="2026-07-03-17-42-36_1783093356603"
    :nb-colonnes="5"
    :nb-rows="1"
  />

</template>
