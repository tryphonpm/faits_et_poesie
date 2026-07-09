<script setup lang="ts">
const route = useRoute()
const hideFooter = computed(() => Boolean(route.meta.hideNewspaperFooter))
</script>

<template>
  <div class="fp-newspaper-page">
    <div class="fp-newspaper-container">
      <div class="fp-newspaper-grid">
        <slot />
      </div>

      <footer
        v-if="!hideFooter"
        class="mt-4 border-t border-paper-border py-2 text-center"
      >
        <NuxtLink
          to="/publications/archives"
          class="text-xs text-slate-400 transition hover:text-slate-600"
        >
          Accès aux archives
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
