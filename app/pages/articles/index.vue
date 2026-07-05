<script setup lang="ts">
interface ArticleSummary {
  id: string
  numero?: number | null
  titre: string
  sousTitre: string
  description: string
  visuel: string
  createdAt: string | null
}

interface PublicationSummary {
  numero: number
  createdAt: string | null
}

useHead({ title: 'Articles' })

const articlesFilterStore = useArticlesFilterStore()
const { filterKey } = storeToRefs(articlesFilterStore)

const { data: articles, status, refresh } = await useFetch<ArticleSummary[]>('/api/articles', {
  default: () => [] as ArticleSummary[]
})

const { data: publications, status: publicationsStatus } = await useFetch<PublicationSummary[]>('/api/publications', {
  default: () => [] as PublicationSummary[]
})

const filteredArticles = computed(() => {
  const list = articles.value ?? []
  if (filterKey.value === '') {
    return list.filter(article => article.numero == null)
  }
  const numero = Number(filterKey.value)
  return list.filter(article => article.numero === numero)
})

const deletingId = ref<string | null>(null)

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

async function deleteArticle(article: ArticleSummary) {
  if (!confirm(`Supprimer « ${article.titre} » ?`)) return

  deletingId.value = article.id
  try {
    await $fetch(`/api/articles/${encodeURIComponent(article.id)}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.message ?? 'Suppression impossible.')
  } finally {
    deletingId.value = null
  }
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

      <div class="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="filter-numero">
            Filtrer par bulletin
          </label>
          <select
            id="filter-numero"
            v-model="filterKey"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Sans bulletin</option>
            <option
              v-for="publication in publications"
              :key="publication.numero"
              :value="String(publication.numero)"
            >
              Bulletin n°{{ publication.numero }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="status === 'pending' || publicationsStatus === 'pending'" class="space-y-4">
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

      <p
        v-else-if="!filteredArticles.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
      >
        Aucun article pour ce filtre.
      </p>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="article in filteredArticles"
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

          <div class="flex shrink-0 items-center gap-2">
            <NuxtLink
              :to="`/articles/${encodeURIComponent(article.id)}`"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Voir →
            </NuxtLink>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingId === article.id"
              @click="deleteArticle(article)"
            >
              {{ deletingId === article.id ? '…' : 'Supprimer' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
