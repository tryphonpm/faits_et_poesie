<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400&display=swap'
    }
  ]
})
</script>

<template>
  <div class="flex min-h-screen justify-center bg-[#fcfbf7] p-5 font-serif text-[#111111]">
    <div class="w-full max-w-[1200px] border border-neutral-300 bg-[#fcfbf7] p-5 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
        <slot />
      </div>
    </div>
  </div>
</template>
