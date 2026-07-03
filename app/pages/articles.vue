<script setup lang="ts">
interface ArticleSummary {
  id: string
  titre: string
  sousTitre: string
  description: string
  visuel: string
  createdAt: string | null
}

useHead({ title: 'Articles' })

const { data: articles, status } = await useFetch<ArticleSummary[]>('/api/articles', {
  default: () => [] as ArticleSummary[]
})

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso))
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Articles</h1>
        <NuxtLink
          to="/ajout_articles"
          class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
        >
          + Ajouter
        </NuxtLink>
      </div>

      <div v-if="status === 'pending'" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="h-20 animate-pulse rounded-2xl bg-slate-200"
        />
      </div>

      <p
        v-else-if="!articles.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
      >
        Aucun article pour l'instant.
      </p>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="article in articles"
          :key="article.id"
          class="flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-emerald-300"
        >
          <div class="min-w-0">
            <p class="truncate text-base font-semibold text-slate-900">
              {{ article.titre }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              {{ formatDate(article.createdAt) }}
            </p>
          </div>

          <NuxtLink
            :to="`/articles/${article.id}`"
            class="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            Voir →
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
