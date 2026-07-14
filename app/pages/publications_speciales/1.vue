<script setup lang="ts">
import Front_header_special from '~/components/front_header_special.vue';

definePageMeta({ layout: 'newspaper-special' })

useHead({ title: 'Faits & Poésie — Maquette Numéro Spécial' })
</script>

<template>
  <!-- Ligne 1 : en-tête sur les 5 colonnes (fp-front-header → md:col-span-5) -->
  <FrontHeaderSpecial />


  <!-- TITRE SPÉCIAL -->
  <Article id="2026-07-13-14-42-09_1783946529200"/>
</template>
