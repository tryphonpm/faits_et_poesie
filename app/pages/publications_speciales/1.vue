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


   <!-- Lors de la construction... -->
  <Article id="2026-07-14-08-44-56_1784011496122"/>
  <!-- Le message impérial -->
  <Article id="2026-07-14-08-04-57_1784009097700"/>
 <!-- C'est ainsi que notre peuple... -->
 <Article id="2026-07-14-08-45-45_1784011545449"/>



  <!-- SRC : Lors de la construction de la muraille de Chine -->
  <Article id="2026-07-14-08-12-58_1784009578484"/>
   <!-- SRC : message impérial -->
   <Article id="2026-07-14-08-47-36_1784011656162"/>
  <!-- SRC C'est ainsi que notre peuple -->
  <Article id="2026-07-14-08-17-03_1784009823058"/>


 
</template>
