<script setup lang="ts">
interface PublicationSummary {
  numero: number
  status: string
}

const { data: publications, status: fetchStatus } = await useFetch<PublicationSummary[]>('/api/publications', {
  default: () => []
})

const latestPublished = computed(() =>
  (publications.value ?? [])
    .filter((p) => p.status === 'publié')
    .sort((a, b) => b.numero - a.numero)[0] ?? null
)

if (latestPublished.value) {
  await navigateTo(`/publications/${latestPublished.value.numero}`, { replace: true })
}

useHead({ title: 'Accueil' })
</script>

<template>
  <main
    v-if="fetchStatus !== 'pending' && !latestPublished"
    class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800"
  >
    <div class="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
      <p class="text-sm font-semibold uppercase tracking-widest text-emerald-600">FAITS & POÉSIE</p>
      <p class="text-lg text-slate-600">Aucune publication publiée pour l'instant.</p>
      <NuxtLink
        to="/publications"
        class="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
      >
        Voir les publications
      </NuxtLink>
    </div>
  </main>
</template>
