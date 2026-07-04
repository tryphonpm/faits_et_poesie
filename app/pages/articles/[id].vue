<script setup lang="ts">
interface Article {
  id: string
  titre: string
  sousTitre: string
  article: string
  description: string
  categorie: string
  visuel: string
  createdAt: string | null
}

const route = useRoute()
const id = computed(() => decodeURIComponent(route.params.id as string))

const { data: article, status, error } = await useFetch<Article>(
  () => `/api/articles/${encodeURIComponent(id.value)}`,
  { watch: [id] }
)

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

const copied = ref(false)

async function copyId(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
    <div class="mx-auto max-w-2xl">
      <div class="mb-8 flex items-center justify-between gap-4">
        <NuxtLink
          to="/articles"
          class="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
        >
          ← Retour à la liste
        </NuxtLink>

        <NuxtLink
          v-if="article && status !== 'pending'"
          :to="`/articles/modifier/${encodeURIComponent(id)}`"
          class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          Modifier
        </NuxtLink>
      </div>

      <div v-if="status === 'pending'" class="space-y-6">
        <div class="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />
        <div class="h-4 w-1/3 animate-pulse rounded-lg bg-slate-200" />
        <div class="h-72 animate-pulse rounded-2xl bg-slate-200" />
        <div class="space-y-3">
          <div class="h-4 animate-pulse rounded bg-slate-200" />
          <div class="h-4 animate-pulse rounded bg-slate-200" />
          <div class="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div
        v-else-if="error || !article"
        class="rounded-2xl bg-red-50 px-6 py-8 text-center text-red-600"
      >
        Article introuvable.
      </div>

      <article v-else class="flex flex-col gap-8">
        <header>
          <div class="flex flex-wrap items-center gap-3">
            <p class="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              {{ formatDate(article.createdAt) }}
            </p>
            <span
              v-if="article.categorie"
              class="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600"
            >
              {{ article.categorie }}
            </span>
          </div>
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            :title="copied ? 'Copié !' : 'Copier l\'id'"
            @click="copyId(article.id)"
          >
            <span>{{ article.id }}</span>
            <span class="text-[10px] uppercase tracking-wide">{{ copied ? 'Copié' : 'Copier' }}</span>
          </button>
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

        <p
          v-if="article.description"
          class="rounded-xl bg-emerald-50 px-5 py-4 text-sm italic text-emerald-800"
        >
          {{ article.description }}
        </p>

        <div class="whitespace-pre-wrap leading-relaxed text-slate-700">
          {{ article.article }}
        </div>
      </article>
    </div>
  </div>
</template>
