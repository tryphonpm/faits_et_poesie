<script setup lang="ts">
/** Schéma aligné sur server/models/Article.ts (collection articles) */
export interface ArticleDocument {
  id: string
  titre: string
  sousTitre: string
  article: string
  description: string
  categorie: string
  visuel: string
  createdAt: string
}

const props = withDefaults(defineProps<{
  /** Identifiant MongoDB — requête GET /api/articles/:id */
  id: string
  /** Nombre de colonnes occupées dans la grille newspaper (1–5) */
  nbColonnes?: number
}>(), {
  nbColonnes: 1
})

/** Champs texte affichés en flex-col (hors id, createdAt, visuel) */
const childrenBeforeVisuel = ['categorie', 'titre', 'sousTitre'] as const
const childrenAfterVisuel = ['description', 'article'] as const
type ChildKey = typeof childrenBeforeVisuel[number] | typeof childrenAfterVisuel[number]

/** Classes Tailwind par clé (thème par défaut) */
const fieldClasses: Record<ChildKey, string> = {
  categorie: 'text-xs font-semibold uppercase tracking-widest text-amber-700',
  titre: 'text-2xl font-bold leading-tight text-gray-900 sm:text-3xl',
  sousTitre: 'text-lg font-normal italic text-gray-600',
  description: 'text-sm italic text-gray-500',
  article: 'text-base leading-relaxed text-gray-700 whitespace-pre-wrap'
}

const fieldTags: Record<ChildKey, string> = {
  categorie: 'span',
  titre: 'h2',
  sousTitre: 'h3',
  description: 'p',
  article: 'p'
}

const colSpanClasses: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5'
}

const { data: fetched, status, error } = await useAsyncData(
  () => `article-component-${props.id}`,
  () => $fetch<ArticleDocument>(`/api/articles/${encodeURIComponent(props.id)}`),
  { watch: [() => props.id] }
)

const data = computed<ArticleDocument | null>(() => fetched.value ?? null)

const colSpanClass = computed(() => {
  const n = props.nbColonnes
  return colSpanClasses[n] ?? colSpanClasses[1]
})
</script>

<template>
  <div
    v-if="status === 'pending'"
    class="col-span-full py-12 text-center text-gray-500"
  >
    Chargement de l'article…
  </div>

  <p
    v-else-if="error || !data"
    class="col-span-full py-12 text-center text-red-600"
  >
    Article introuvable.
  </p>

  <article
    v-else
    class="col-span-full flex flex-col gap-2"
    :class="colSpanClass"
  >
    <template v-for="key in childrenBeforeVisuel" :key="key">
      <component
        :is="fieldTags[key]"
        v-if="data[key]"
        :class="fieldClasses[key]"
      >
        {{ data[key] }}
      </component>
    </template>

    <figure v-if="data.visuel" class="border border-gray-900 bg-white p-1">
      <img
        :src="data.visuel"
        :alt="data.titre"
        class="block w-full grayscale contrast-125"
      />
    </figure>

    <template v-for="key in childrenAfterVisuel" :key="key">
      <component
        :is="fieldTags[key]"
        v-if="data[key]"
        :class="fieldClasses[key]"
      >
        {{ data[key] }}
      </component>
    </template>
  </article>
</template>
