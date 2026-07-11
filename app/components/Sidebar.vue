<script setup lang="ts">
const route = useRoute()

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/articles', label: 'Articles' },
  { to: '/publications', label: 'Publications' },
  { to: '/bo', label: 'Back-office' }
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <aside class="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-8">
    <p class="mb-6 px-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
      FAITS & POÉSIE
    </p>

    <nav class="flex flex-col gap-1">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-lg px-3 py-2 text-sm font-medium transition"
        :class="isActive(link.to)
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>
