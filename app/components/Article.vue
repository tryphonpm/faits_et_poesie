<script setup lang="ts">
export type ArticleLayout = 'stack' | 'float' | 'columns'
export type VisuelPosition = 'before-article' | 'after-article'
export type VisuelAlign = 'left' | 'right'
export type TitreFontSize = 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'

/** Schéma aligné sur server/models/Article.ts (collection articles) */
export interface ArticleDocument {
  id: string
  titre: string
  sousTitre: string
  article: string
  description: string
  categorie: string
  visuel: string
  layout: ArticleLayout
  visuelPosition: VisuelPosition
  visuelColonnes: number
  visuelAlign: VisuelAlign
  createdAt: string
}

const props = withDefaults(defineProps<{
  id: string
  nbColonnes?: number
  nbRows?: number
  layout?: ArticleLayout
  visuelPosition?: VisuelPosition
  visuelColonnes?: number
  visuelAlign?: VisuelAlign
  /** Taille du titre : token Tailwind (ex. `3xl`) ou valeur CSS (`1.75rem`, `28px`) */
  titreFontSize?: TitreFontSize | string
  /** Masque l'affichage du titre */
  masquerTitre?: boolean
  /** Ajoute une bordure gauche à l'article */
  bordureGauche?: boolean
  /** Désactive la lettrine sur le corps de l'article */
  noLettrine?: boolean
}>(), {
  nbColonnes: 1,
  nbRows: 1,
  masquerTitre: false,
  bordureGauche: false,
  noLettrine: false
})

const metaFields = ['categorie', 'titre', 'sousTitre'] as const
type MetaKey = typeof metaFields[number]

const fieldClasses = {
  categorie: 'fp-article-categorie',
  titre: 'fp-article-titre',
  sousTitre: 'fp-article-sous-titre',
  description: 'fp-article-description',
  article: 'fp-article-corps'
} as const

const fieldTags: Record<MetaKey, string> = {
  categorie: 'span',
  titre: 'h2',
  sousTitre: 'h3'
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

const textColumnsClasses: Record<number, string> = {
  1: 'columns-1',
  2: 'columns-1 md:columns-2',
  3: 'columns-1 md:columns-3',
  4: 'columns-1 md:columns-4',
  5: 'columns-1 md:columns-5'
}

const titreFontSizeClasses: Record<TitreFontSize, string> = {
  lg: '!text-lg',
  xl: '!text-xl',
  '2xl': '!text-2xl',
  '3xl': '!text-3xl',
  '4xl': '!text-4xl',
  '5xl': '!text-5xl',
  '6xl': '!text-6xl',
  '7xl': '!text-7xl',
  '8xl': '!text-8xl',
  '9xl': '!text-9xl'
}

function isCssFontSize(value: string): boolean {
  return /^\d+(\.\d+)?(px|rem|em|%)$/.test(value) || value.startsWith('clamp(')
}

function metaFieldClass(key: MetaKey): string | string[] {
  if (key !== 'titre' || !props.titreFontSize) return fieldClasses[key]
  const token = props.titreFontSize as TitreFontSize
  if (titreFontSizeClasses[token]) {
    return [fieldClasses.titre, titreFontSizeClasses[token]]
  }
  return fieldClasses.titre
}

const titreStyle = computed(() => {
  const size = props.titreFontSize
  if (!size || titreFontSizeClasses[size as TitreFontSize]) return undefined
  if (isCssFontSize(size)) return { fontSize: size }
  return undefined
})

const { data: fetched, status, error } = await useAsyncData(
  () => `article-component-${props.id}`,
  () => $fetch<ArticleDocument>(`/api/articles/${encodeURIComponent(props.id)}`),
  { watch: [() => props.id] }
)

const data = computed(() => fetched.value ?? null)

const effectiveLayout = computed<ArticleLayout>(() =>
  props.layout ?? data.value?.layout ?? 'stack'
)

const effectiveVisuelPosition = computed<VisuelPosition>(() =>
  props.visuelPosition ?? data.value?.visuelPosition ?? 'before-article'
)

const effectiveVisuelColonnes = computed(() =>
  props.visuelColonnes ?? data.value?.visuelColonnes ?? 1
)

const effectiveVisuelAlign = computed<VisuelAlign>(() =>
  props.visuelAlign ?? data.value?.visuelAlign ?? 'right'
)

const isFloatLayout = computed(() => effectiveLayout.value === 'float')
const isColumnsLayout = computed(() => effectiveLayout.value === 'columns')

const colSpanClass = computed(() => colSpanClasses[props.nbColonnes] ?? colSpanClasses[1])
const rowSpanClass = computed(() => rowSpanClasses[props.nbRows] ?? rowSpanClasses[1])

const articleRootClass = computed(() => [
  colSpanClass.value,
  rowSpanClass.value,
  props.bordureGauche ? 'fp-article--bordure-gauche' : null
])

function showMetaField(key: MetaKey): boolean {
  if (key === 'titre' && props.masquerTitre) return false
  return !!data.value?.[key]
}

const articleCorpsClass = computed(() => {
  const classes = ['fp-article-corps', 'fp-article-corps--multicol']
  if (!props.noLettrine) classes.push('fp-article-lettrine')
  if (isColumnsLayout.value || effectiveLayout.value === 'stack') {
    classes.push(textColumnsClasses[props.nbColonnes] ?? textColumnsClasses[1]!)
  }
  return classes
})

/**
 * Un élément flottant est toujours confiné à la colonne CSS dans laquelle il
 * se trouve (spécification CSS multicol) : il ne peut jamais s'étendre sur
 * plusieurs colonnes de texte. On ne peut donc pas combiner `float` avec
 * `columns-N` si `visuelColonnes` doit représenter une fraction de la largeur
 * totale du corps de l'article. En mode `float`, le texte reste donc sur un
 * seul flux (pas de colonnes CSS natives) : c'est ce qui permet au visuel
 * d'occuper une largeur proportionnelle correcte (`visuelColonnes / nbColonnes`).
 */
const floatArticleCorpsClass = computed(() => {
  const classes = ['fp-article-corps', 'fp-article-corps--float']
  if (!props.noLettrine) classes.push('fp-article-lettrine')
  return classes
})

const visuelFloatWrapAlignClass = computed(() =>
  effectiveVisuelAlign.value === 'left'
    ? 'fp-article-visuel-float-wrap--left'
    : 'fp-article-visuel-float-wrap--right'
)

const visuelWidthStyle = computed(() => {
  const ratio = Math.min(effectiveVisuelColonnes.value / props.nbColonnes, 1)
  return { '--fp-visuel-width': `${ratio * 100}%` } as Record<string, string>
})

const showVisuelDescription = computed(() =>
  !!data.value?.visuel && !!data.value?.description
)

const showStandaloneDescription = computed(() =>
  !data.value?.visuel && !!data.value?.description
)

const showBlockVisuelBefore = computed(() =>
  !!data.value?.visuel
  && (!isFloatLayout.value || effectiveVisuelPosition.value === 'after-article')
  && effectiveVisuelPosition.value === 'before-article'
)

const showBlockVisuelAfter = computed(() =>
  !!data.value?.visuel
  && effectiveVisuelPosition.value === 'after-article'
)

const showFloatVisuel = computed(() =>
  !!data.value?.visuel
  && isFloatLayout.value
  && effectiveVisuelPosition.value === 'before-article'
)
</script>

<template>
  <div
    class="fp-article"
    :class="articleRootClass"
  >
    <div v-if="status === 'pending'" class="py-12 text-center text-gray-500">
      Chargement de l'article…
    </div>

    <p v-else-if="error || !data" class="py-12 text-center text-red-600">
      Article introuvable.
    </p>

    <template v-else>
      <template v-for="key in metaFields" :key="key">
        <component
          :is="fieldTags[key]"
          v-if="showMetaField(key)"
          :class="metaFieldClass(key)"
          :style="key === 'titre' ? titreStyle : undefined"
        >
          {{ data[key] }}
        </component>
      </template>

      <!-- stack / columns : visuel bloc avant -->
      <figure v-if="showBlockVisuelBefore" class="fp-article-visuel">
        <img :src="data.visuel" :alt="data.titre">
        <figcaption
          v-if="showVisuelDescription"
          class="fp-article-visuel-description"
          :class="fieldClasses.description"
        >
          {{ data.description }}
        </figcaption>
      </figure>

      <!-- float : visuel flottant + texte dans un seul flux -->
      <div
        v-if="isFloatLayout && (showFloatVisuel || data.article || showStandaloneDescription)"
        class="fp-article-float-layout"
      >
        <div
          v-if="showFloatVisuel || data.article || showStandaloneDescription"
          lang="fr"
          :class="floatArticleCorpsClass"
        >
          <div
            v-if="showFloatVisuel"
            class="fp-article-visuel-float-wrap fp-article-visuel-float-wrap-dimension"
            :class="visuelFloatWrapAlignClass"
            :style="visuelWidthStyle"
          >
            <figure class="fp-article-visuel-float-wrap__figure">
              <img :src="data.visuel" :alt="data.titre">
            </figure>
            <figcaption
              v-if="showVisuelDescription"
              class="fp-article-visuel-description"
              :class="fieldClasses.description"
            >
              {{ data.description }}
            </figcaption>
          </div>

          <p v-if="showStandaloneDescription" :class="fieldClasses.description">
            {{ data.description }}
          </p>

          <span v-if="data.article">
            {{ data.article }}<span class="fp-article-fin" aria-hidden="true">&lt;</span>
          </span>
        </div>
      </div>

      <!-- stack / columns : description (sans visuel) + texte colonné -->
      <template v-else>
        <p v-if="showStandaloneDescription" :class="fieldClasses.description">
          {{ data.description }}
        </p>

        <p v-if="data.article" lang="fr" :class="articleCorpsClass">
          {{ data.article }}<span class="fp-article-fin" aria-hidden="true">&lt;</span>
        </p>
      </template>

      <!-- visuel bloc après (stack / columns / float+after) -->
      <figure v-if="showBlockVisuelAfter" class="fp-article-visuel">
        <img :src="data.visuel" :alt="data.titre">
        <figcaption
          v-if="showVisuelDescription"
          class="fp-article-visuel-description"
          :class="fieldClasses.description"
        >
          {{ data.description }}
        </figcaption>
      </figure>
    </template>
  </div>
</template>
