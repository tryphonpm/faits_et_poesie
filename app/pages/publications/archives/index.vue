<script setup lang="ts">
definePageMeta({ layout: 'newspaper', hideNewspaperFooter: true })

interface PublicationSummary {
  numero: number
  date_publication: string | null
  status: string
}

interface ArticleSummary {
  numero?: number
  titre: string
  visuel: string
}

interface PublicationPreview {
  visuel: string
  titre: string
}

useHead({ title: 'Archives — Faits & Poésie' })

const { data: publications, status: publicationsStatus } = await useFetch<PublicationSummary[]>('/api/publications', {
  default: () => []
})

const { data: articles } = await useFetch<ArticleSummary[]>('/api/articles', {
  default: () => []
})

const publishedPublications = computed(() =>
  (publications.value ?? [])
    .filter((p) => p.status === 'publié')
    .sort((a, b) => b.numero - a.numero)
)

const previewByNumero = computed(() => {
  const map = new Map<number, PublicationPreview>()

  for (const article of articles.value ?? []) {
    if (article.numero == null || map.has(article.numero)) continue
    if (!article.visuel) continue
    map.set(article.numero, { visuel: article.visuel, titre: article.titre })
  }

  for (const article of articles.value ?? []) {
    if (article.numero == null || map.has(article.numero)) continue
    map.set(article.numero, { visuel: '', titre: article.titre })
  }

  return map
})

function previewFor(numero: number) {
  return previewByNumero.value.get(numero)
}

function formatPublicationDate(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="col-span-full">
    <header class="mb-8 border-b border-ink pb-4 text-center">
      <h1 class="font-display text-3xl font-bold tracking-masthead text-ink">
        Archives
      </h1>
      <p class="mt-2 text-sm text-ink-muted">
        Tous les bulletins publiés
      </p>
    </header>

    <div
      v-if="publicationsStatus === 'pending'"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="aspect-[3/4] animate-pulse rounded border border-paper-border bg-stone-100"
      />
    </div>

    <p
      v-else-if="!publishedPublications.length"
      class="py-16 text-center text-ink-faint"
    >
      Aucun bulletin publié pour l'instant.
    </p>

    <ul
      v-else
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="publication in publishedPublications"
        :key="publication.numero"
      >
        <NuxtLink
          :to="`/publications/${publication.numero}`"
          class="group flex aspect-[3/4] flex-col overflow-hidden border border-paper-border bg-paper shadow-newspaper transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="shrink-0 border-b border-ink px-2 py-1.5 text-center">
            <p class="font-display text-[0.65rem] font-bold uppercase tracking-wide text-ink">
              Faits <span class="text-rubrique">&</span> Poésie
            </p>
            <p class="text-[0.6rem] text-ink-muted">
              Bulletin n°{{ publication.numero }}
            </p>
          </div>

          <div class="relative min-h-0 flex-1 overflow-hidden bg-ink">
            <img
              v-if="previewFor(publication.numero)?.visuel"
              :src="previewFor(publication.numero)!.visuel"
              :alt="previewFor(publication.numero)!.titre"
              class="absolute inset-0 h-full w-full object-cover object-top grayscale contrast-125 transition group-hover:grayscale-0"
            >
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-stone-100 px-2 text-center text-[0.65rem] leading-snug text-ink-faint"
            >
              {{ previewFor(publication.numero)?.titre ?? 'Bulletin' }}
            </div>
          </div>

          <div class="shrink-0 border-t border-paper-border px-2 py-2 text-center">
            <p
              v-if="previewFor(publication.numero)?.titre"
              class="line-clamp-2 text-[0.6rem] font-semibold leading-tight text-ink"
            >
              {{ previewFor(publication.numero)!.titre }}
            </p>
            <p
              v-if="formatPublicationDate(publication.date_publication)"
              class="mt-1 text-[0.55rem] text-ink-faint"
            >
              {{ formatPublicationDate(publication.date_publication) }}
            </p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
