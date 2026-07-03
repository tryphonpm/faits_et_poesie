<script setup lang="ts">
interface Article {
  id: string
  titre: string
  sousTitre: string
  article: string
  description: string
  visuel: string
  createdAt: string | null
}

const route = useRoute()
const id = route.params.id as string

const { data: article, error } = await useFetch<Article>(`/api/articles/${id}`)

useHead(() => ({
  title: article.value?.titre ?? 'Article'
}))

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
    <div class="mx-auto max-w-2xl">
      <NuxtLink
        to="/articles"
        class="mb-8 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
      >
        ← Retour à la liste
      </NuxtLink>

      <div
        v-if="error"
        class="rounded-2xl bg-red-50 px-6 py-8 text-center text-red-600"
      >
        Article introuvable.
      </div>

      <article v-else-if="article" class="flex flex-col gap-8">
        <header>
          <p class="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            {{ formatDate(article.createdAt) }}
          </p>
          <h1 class="mt-2 text-4xl font-bold leading-tight tracking-tight text-slate-900">
            {{ article.titre }}
          </h1>
          <p v-if="article.sousTitre" class="mt-2 text-xl text-slate-500">
            {{ article.sousTitre }}
          </p>
        </header>

        <figure v-if="article.visuel" class="overflow-hidden rounded-2xl bg-slate-100">
          <img
            :src="article.visuel"
            :alt="article.titre"
            class="h-72 w-full object-cover"
          />
        </figure>

        <p v-if="article.description" class="rounded-xl bg-emerald-50 px-5 py-4 text-sm italic text-emerald-800">
          {{ article.description }}
        </p>

        <div class="whitespace-pre-wrap leading-relaxed text-slate-700">
          {{ article.article }}
        </div>
      </article>
    </div>
  </div>
</template>
