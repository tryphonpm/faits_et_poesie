<script setup lang="ts">
import Front_header_special from '~/components/front_header_special.vue';

definePageMeta({ layout: 'newspaper-special' })

useHead({ title: 'Faits & Poésie — Maquette Numéro Spécial' })
</script>

<template>
  <!-- Ligne 1 : en-tête sur les 5 colonnes (fp-front-header → md:col-span-5) -->
  <FrontHeaderSpecial />

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
