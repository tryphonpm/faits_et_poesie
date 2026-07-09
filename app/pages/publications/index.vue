<script setup lang="ts">
interface PublicationSummary {
  numero: number
  date_publication: string | null
  createdAt: string | null
}

interface ArticleSummary {
  id: string
  numero?: number
  titre: string
}

useHead({ title: 'Publications' })

const { data: publications, status, refresh } = await useFetch<PublicationSummary[]>('/api/publications', {
  default: () => [] as PublicationSummary[]
})

const { data: articles, status: articlesStatus } = await useFetch<ArticleSummary[]>('/api/articles', {
  default: () => [] as ArticleSummary[]
})

const articlesByNumero = computed(() => {
  const map = new Map<number, ArticleSummary[]>()
  for (const article of articles.value ?? []) {
    if (article.numero == null) continue
    const list = map.get(article.numero) ?? []
    list.push(article)
    map.set(article.numero, list)
  }
  return map
})

function articlesForNumero(numero: number) {
  return articlesByNumero.value.get(numero) ?? []
}

const deletingNumero = ref<number | null>(null)

function formatPublicationDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

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

async function deletePublication(publication: PublicationSummary) {
  if (!confirm(`Supprimer le bulletin n°${publication.numero} ?`)) return

  deletingNumero.value = publication.numero
  try {
    await $fetch(`/api/publications/${publication.numero}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.message ?? 'Suppression impossible.')
  } finally {
    deletingNumero.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Publications</h1>
        <NuxtLink
          to="/ajout_publication"
          class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
        >
          + Ajouter
        </NuxtLink>
      </div>

      <div v-if="status === 'pending' || articlesStatus === 'pending'" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="h-20 animate-pulse rounded-2xl bg-slate-200"
        />
      </div>

      <p
        v-else-if="!publications.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
      >
        Aucune publication pour l'instant.
      </p>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="publication in publications"
          :key="publication.numero"
          class="flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-emerald-300"
        >
          <div class="min-w-0">
            <p class="truncate text-base font-semibold text-slate-900">
              Bulletin n°{{ publication.numero }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              Publié le {{ formatPublicationDate(publication.date_publication) }}
            </p>
            <p class="text-xs text-slate-300">
              Créé le {{ formatDate(publication.createdAt) }}
            </p>
            <ul
              v-if="articlesForNumero(publication.numero).length"
              class="mt-3 space-y-0 border-t border-slate-100 pt-3"
            >
              <li
                v-for="article in articlesForNumero(publication.numero)"
                :key="article.id"
                class="text-[calc(0.875rem*0.8)] leading-[calc(1.25rem*0.7)] text-emerald-600"
              >
                {{ article.titre }}
              </li>
            </ul>
            <p v-else class="mt-3 border-t border-slate-100 pt-3 text-sm italic text-slate-400">
              Aucun article pour ce bulletin.
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <NuxtLink
              :to="`/publications/modifier/${publication.numero}`"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Modifier
            </NuxtLink>
            <NuxtLink
              :to="`/publications/${publication.numero}`"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Voir →
            </NuxtLink>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingNumero === publication.numero"
              @click="deletePublication(publication)"
            >
              {{ deletingNumero === publication.numero ? '…' : 'Supprimer' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
