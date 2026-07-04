<script setup lang="ts">
interface ArticleItem {
  id: string
  titre: string
  sousTitre: string
  article: string
  description: string
  categorie: string
  visuel: string
  createdAt: string | null
}

interface BulletinMeta {
  jourSemaine: string
  jour: string
  mois: string
  annee: string
  numero: number
  citation: string
  auteurCitation: string
  piedDePage: string
}

const props = withDefaults(defineProps<{
  meta?: Partial<BulletinMeta>
  articles?: ArticleItem[]
}>(), {})

useHead({ title: 'Maquette — Faits & Poésie' })

const defaultMeta: BulletinMeta = {
  jourSemaine: 'Samedi',
  jour: '06',
  mois: 'Juin',
  annee: '2026',
  numero: 3,
  citation: 'Certains se font de la poésie une idée si vague qu\'ils prennent ce vague pour l\'idée même de la poésie.',
  auteurCitation: 'Paul Valéry',
  piedDePage: 'Faits & Poésie — Bulletin littéraire'
}

const meta = computed(() => ({ ...defaultMeta, ...props.meta }))

const { data: fetchedArticles } = await useFetch<ArticleItem[]>('/api/articles', {
  default: () => [] as ArticleItem[]
})

const articles = computed(() => props.articles ?? fetchedArticles.value ?? [])

const featured = computed(() => articles.value[0] ?? null)
const secondary = computed(() => articles.value.slice(1, 3))

function excerpt(text: string, max = 280) {
  const clean = text.replace(/\r\n/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max).trim()}…`
}

function formatArticleDate(iso: string | null) {
  if (!iso) return null
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(iso))
}
</script>

<template>
  <div class="min-h-screen bg-[#f4f0e8] px-4 py-10 text-[#1c1917]">
    <article class="mx-auto max-w-5xl border border-[#d6cfc0] bg-[#faf7f0] shadow-lg">
      <!-- En-tête bulletin -->
      <header class="border-b border-[#d6cfc0] px-8 py-6">
        <div class="flex items-start justify-between gap-6">
          <div class="leading-tight">
            <p class="font-serif text-sm uppercase tracking-[0.25em] text-[#78716c]">
              {{ meta.jourSemaine }}
            </p>
            <p class="mt-1 font-serif text-3xl font-semibold text-[#292524]">
              {{ meta.jour }} {{ meta.mois }}
            </p>
            <p class="font-serif text-lg text-[#57534e]">{{ meta.annee }}</p>
          </div>

          <div class="text-right">
            <p class="font-serif text-sm uppercase tracking-[0.2em] text-[#78716c]">
              Bulletin
            </p>
            <p class="font-serif text-3xl font-semibold text-[#292524]">
              n°{{ meta.numero }}
            </p>
          </div>
        </div>

        <h1 class="mt-8 text-center font-serif text-5xl font-bold tracking-tight text-[#1c1917] sm:text-6xl">
          Faits &amp; Poésie
        </h1>
      </header>

      <!-- Citation -->
      <blockquote class="border-b border-[#d6cfc0] px-8 py-8 text-center">
        <p class="mx-auto max-w-3xl font-serif text-xl italic leading-relaxed text-[#44403c]">
          « {{ meta.citation }} »
        </p>
        <footer class="mt-4 font-serif text-sm uppercase tracking-widest text-[#78716c]">
          {{ meta.auteurCitation }}
        </footer>
      </blockquote>

      <!-- Article principal -->
      <section v-if="featured" class="border-b border-[#d6cfc0] px-8 py-10">
        <NuxtLink :to="`/articles/${encodeURIComponent(featured.id)}`" class="group block">
          <p
            v-if="featured.categorie"
            class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#92400e]"
          >
            {{ featured.categorie }}
          </p>

          <h2 class="font-serif text-4xl font-bold leading-tight text-[#1c1917] transition group-hover:text-[#92400e] sm:text-5xl">
            {{ featured.titre }}
          </h2>

          <p v-if="featured.sousTitre" class="mt-3 font-serif text-xl text-[#57534e]">
            {{ featured.sousTitre }}
          </p>

          <figure v-if="featured.visuel" class="my-8 overflow-hidden border border-[#d6cfc0]">
            <img
              :src="featured.visuel"
              :alt="featured.titre"
              class="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          </figure>

          <p v-if="featured.description" class="mb-4 font-serif text-lg italic text-[#57534e]">
            {{ featured.description }}
          </p>

          <p class="font-serif text-base leading-relaxed text-[#44403c]">
            {{ excerpt(featured.article, 520) }}
          </p>

          <p class="mt-6 text-sm font-medium uppercase tracking-widest text-[#92400e]">
            Lire la suite →
          </p>
        </NuxtLink>
      </section>

      <section v-else class="border-b border-[#d6cfc0] px-8 py-16 text-center">
        <p class="font-serif text-lg italic text-[#78716c]">Aucun article à la une.</p>
      </section>

      <!-- Articles secondaires -->
      <section
        v-if="secondary.length"
        class="grid gap-0 border-b border-[#d6cfc0] sm:grid-cols-2"
      >
        <article
          v-for="(item, index) in secondary"
          :key="item.id"
          class="px-8 py-10"
          :class="{ 'border-[#d6cfc0] sm:border-r': index === 0 && secondary.length > 1 }"
        >
          <NuxtLink :to="`/articles/${encodeURIComponent(item.id)}`" class="group flex h-full flex-col">
            <p
              v-if="item.categorie"
              class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#92400e]"
            >
              {{ item.categorie }}
            </p>

            <h3 class="font-serif text-2xl font-bold leading-snug text-[#1c1917] transition group-hover:text-[#92400e]">
              {{ item.titre }}
            </h3>

            <p v-if="item.sousTitre" class="mt-2 font-serif text-base text-[#57534e]">
              {{ item.sousTitre }}
            </p>

            <figure v-if="item.visuel" class="my-5 overflow-hidden border border-[#d6cfc0]">
              <img
                :src="item.visuel"
                :alt="item.titre"
                class="aspect-[4/3] w-full object-cover"
              />
            </figure>

            <p class="flex-1 font-serif text-sm leading-relaxed text-[#44403c]">
              {{ excerpt(item.article, 220) }}
            </p>

            <p
              v-if="formatArticleDate(item.createdAt)"
              class="mt-4 text-xs uppercase tracking-widest text-[#a8a29e]"
            >
              {{ formatArticleDate(item.createdAt) }}
            </p>
          </NuxtLink>
        </article>
      </section>

      <!-- Pied de page -->
      <footer class="px-8 py-6 text-center">
        <p class="font-serif text-sm uppercase tracking-[0.25em] text-[#78716c]">
          {{ meta.piedDePage }}
        </p>
      </footer>
    </article>
  </div>
</template>
