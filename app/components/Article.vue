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
  /** Nombre de lignes occupées dans la grille newspaper (1–5) */
  nbRows?: number
}>(), {
  nbColonnes: 1,
  nbRows: 1
})

/** Champs texte affichés en flex-col (hors id, createdAt, visuel, article) */
const childrenBeforeVisuel = ['categorie', 'titre', 'sousTitre'] as const
const childrenAfterVisuel = ['description'] as const
type ChildKey = typeof childrenBeforeVisuel[number] | typeof childrenAfterVisuel[number] | 'article'

/** Classes du thème Tailwind (app/assets/css/tailwind.css) */
const fieldClasses: Record<ChildKey, string> = {
  categorie: 'fp-article-categorie',
  titre: 'fp-article-titre',
  sousTitre: 'fp-article-sous-titre',
  description: 'fp-article-description',
  article: 'fp-article-corps'
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

const rowSpanClasses: Record<number, string> = {
  1: 'md:row-span-1',
  2: 'md:row-span-2',
  3: 'md:row-span-3',
  4: 'md:row-span-4',
  5: 'md:row-span-5'
}

const { data: fetched, status, error } = await useAsyncData(
  () => `article-component-${props.id}`,
  () => $fetch<ArticleDocument>(`/api/articles/${encodeURIComponent(props.id)}`),
  { watch: [() => props.id] }
)

const data = computed<ArticleDocument | null>(() => fetched.value ?? null)

const textColumnsClasses: Record<number, string> = {
  1: 'columns-1',
  2: 'columns-1 md:columns-2',
  3: 'columns-1 md:columns-3',
  4: 'columns-1 md:columns-4',
  5: 'columns-1 md:columns-5'
}

const colSpanClass = computed(() => {
  const n = props.nbColonnes
  return colSpanClasses[n] ?? colSpanClasses[1]
})

const rowSpanClass = computed(() => {
  const n = props.nbRows
  return rowSpanClasses[n] ?? rowSpanClasses[1]
})

const articleCorpsClass = computed(() => {
  const n = props.nbColonnes
  return textColumnsClasses[n] ?? textColumnsClasses[1]
})
</script>

<template>
  <div
    class="col-span-full flex flex-col gap-2"
    :class="[colSpanClass, rowSpanClass]"
  >
    <div
      v-if="status === 'pending'"
      class="py-12 text-center text-gray-500"
    >
      Chargement de l'article…
    </div>

    <p
      v-else-if="error || !data"
      class="py-12 text-center text-red-600"
    >
      Article introuvable.
    </p>

    <template v-else>
      <template v-for="key in childrenBeforeVisuel" :key="key">
        <component
          :is="fieldTags[key]"
          v-if="data[key]"
          :class="fieldClasses[key]"
        >
          {{ data[key] }}
        </component>
      </template>

      <figure v-if="data.visuel" class="fp-article-visuel">
        <img
          :src="data.visuel"
          :alt="data.titre"
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

      <p
        v-if="data.article"
        :class="['fp-article-corps', articleCorpsClass]"
      >
        {{ data.article }}
      </p>
    </template>
  </div>
</template>
