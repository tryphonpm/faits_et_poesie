<script setup lang="ts">
definePageMeta({ layout: 'newspaper' })

useHead({ title: 'Faits & Poésie — Maquette grille' })
</script>

<template>
  <!-- Ligne 1 : en-tête sur les 5 colonnes (fp-front-header → md:col-span-5) -->
  <FrontHeader
    top-left="Météo : couvert"
    top-right="Faits & Poésie"
    title="Faits & Poésie"
    meta-left="Bulletin n°20"
  />

  <!-- Ligne 2 : 3 + 2 colonnes -->
  <Article
    id="2026-07-03-20-31-42_1783103502116"
    :nb-colonnes="3"
    :nb-rows="1"
  />
  <Article
    id="2026-07-04-08-11-22_1783145482675"
    :nb-colonnes="2"
    :nb-rows="2"
  />

  <!-- Ligne suivante -->
  <Article
    id="2026-07-03-17-42-36_1783093356603"
    :nb-colonnes="3"
    :nb-rows="2"
  />
  <Article
    id="2026-07-04-08-10-09_1783145409346"
    :nb-colonnes="2"
    :nb-rows="1"
  />
</template>
