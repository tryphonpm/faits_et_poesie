<script setup lang="ts">
export type ArticleLayout = 'stack' | 'float' | 'columns'
export type VisuelPosition = 'before-article' | 'after-article'
export type VisuelAlign = 'left' | 'right'
export type DescriptionAlign = 'left' | 'center' | 'right'
export type TitreFontSize =
  | 'xs' | 'sm' | 'base'
  | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'

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
  nbColonnes: number
  nbRows: number
  titreFontSize: string
  masquerTitre: boolean
  bordureGauche: boolean
  noLettrine: boolean
  visuelBgBlack: boolean
  visuelGrayscale: boolean
  masquerBordureVisuel: boolean
  encadre: boolean
  masquerBordureBas: boolean
  descriptionAlign: DescriptionAlign
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
  /** Taille du titre : token Tailwind (`xs`, `sm`, `3xl`…) ou valeur CSS (`1.75rem`, `28px`) */
  titreFontSize?: TitreFontSize | string
  /** Masque complètement l'affichage du titre (`null` = valeur en base) */
  masquerTitre?: boolean | null
  /** Ajoute une bordure gauche à l'article (`null` = valeur en base) */
  bordureGauche?: boolean | null
  /** Désactive la lettrine sur le corps de l'article (`null` = valeur en base) */
  noLettrine?: boolean | null
  /** Fond noir derrière le visuel (`null` = valeur en base, défaut `true`) */
  visuelBgBlack?: boolean | null
  /** Niveaux de gris + contraste sur le visuel (`null` = valeur en base, défaut `true`) */
  visuelGrayscale?: boolean | null
  /** Masque l'encadré du visuel (`null` = valeur en base, défaut `false`) */
  masquerBordureVisuel?: boolean | null
  /** Affiche un cadre autour de l'article entier (`null` = valeur en base) */
  encadre?: boolean | null
  /** Masque la bordure basse par défaut de l'article (`null` = valeur en base) */
  masquerBordureBas?: boolean | null
  /** Alignement de la description (`null` = valeur en base) */
  descriptionAlign?: DescriptionAlign | null
}>(), {
  masquerTitre: null,
  bordureGauche: null,
  noLettrine: null,
  visuelBgBlack: null,
  visuelGrayscale: null,
  masquerBordureVisuel: null,
  encadre: null,
  masquerBordureBas: null,
  descriptionAlign: null
})

function propBoolean(prop: boolean | null | undefined, dbValue?: boolean) {
  if (prop !== null && prop !== undefined) return prop
  return dbValue ?? false
}

function propBooleanDefaultTrue(prop: boolean | null | undefined, dbValue?: boolean) {
  if (prop !== null && prop !== undefined) return prop
  return dbValue ?? true
}

function propDescriptionAlign(
  prop: DescriptionAlign | null | undefined,
  dbValue?: DescriptionAlign
): DescriptionAlign {
  if (prop !== null && prop !== undefined) return prop
  if (dbValue === 'left' || dbValue === 'center' || dbValue === 'right') return dbValue
  return 'right'
}

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

const descriptionAlignClasses: Record<DescriptionAlign, string> = {
  left: 'fp-article-description--left',
  center: 'fp-article-description--center',
  right: 'fp-article-description--right'
}

const titreFontSizeClasses: Record<TitreFontSize, string> = {
  xs: '!text-xs',
  sm: '!text-sm',
  base: '!text-base',
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

const { data: fetched, status, error } = await useAsyncData(
  () => `article-component-${props.id}`,
  () => $fetch<ArticleDocument>(`/api/articles/${encodeURIComponent(props.id)}`),
  {
    watch: [() => props.id],
    getCachedData: () => undefined
  }
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

const effectiveNbColonnes = computed(() => props.nbColonnes ?? data.value?.nbColonnes ?? 1)
const effectiveNbRows = computed(() => props.nbRows ?? data.value?.nbRows ?? 1)
const effectiveTitreFontSize = computed(() => props.titreFontSize ?? data.value?.titreFontSize ?? '')
const effectiveMasquerTitre = computed(() => propBoolean(props.masquerTitre, data.value?.masquerTitre))
const effectiveBordureGauche = computed(() => propBoolean(props.bordureGauche, data.value?.bordureGauche))
const effectiveNoLettrine = computed(() => propBoolean(props.noLettrine, data.value?.noLettrine))
const effectiveVisuelBgBlack = computed(() => propBooleanDefaultTrue(props.visuelBgBlack, data.value?.visuelBgBlack))
const effectiveVisuelGrayscale = computed(() => propBooleanDefaultTrue(props.visuelGrayscale, data.value?.visuelGrayscale))
const effectiveMasquerBordureVisuel = computed(() => propBoolean(props.masquerBordureVisuel, data.value?.masquerBordureVisuel))
const effectiveEncadre = computed(() => propBoolean(props.encadre, data.value?.encadre))
const effectiveMasquerBordureBas = computed(() => propBoolean(props.masquerBordureBas, data.value?.masquerBordureBas))
const effectiveDescriptionAlign = computed<DescriptionAlign>(() =>
  propDescriptionAlign(props.descriptionAlign, data.value?.descriptionAlign)
)

const descriptionClass = computed(() => [
  fieldClasses.description,
  descriptionAlignClasses[effectiveDescriptionAlign.value]
])

const descriptionStyle = computed(() => ({
  textAlign: effectiveDescriptionAlign.value
}))

function metaFieldClass(key: MetaKey): string | string[] {
  if (key !== 'titre' || !effectiveTitreFontSize.value) return fieldClasses[key]
  const token = effectiveTitreFontSize.value as TitreFontSize
  if (titreFontSizeClasses[token]) {
    return [fieldClasses.titre, titreFontSizeClasses[token]]
  }
  return fieldClasses.titre
}

const titreStyle = computed(() => {
  const size = effectiveTitreFontSize.value
  if (!size || titreFontSizeClasses[size as TitreFontSize]) return undefined
  if (isCssFontSize(size)) return { fontSize: size }
  return undefined
})

const isFloatLayout = computed(() => effectiveLayout.value === 'float')
const isColumnsLayout = computed(() => effectiveLayout.value === 'columns')

const colSpanClass = computed(() => colSpanClasses[effectiveNbColonnes.value] ?? colSpanClasses[1])
const rowSpanClass = computed(() => rowSpanClasses[effectiveNbRows.value] ?? rowSpanClasses[1])

const articleRootClass = computed(() => [
  colSpanClass.value,
  rowSpanClass.value,
  effectiveBordureGauche.value ? 'fp-article--bordure-gauche' : null,
  effectiveEncadre.value ? 'fp-article--encadre' : null,
  effectiveMasquerBordureBas.value ? 'fp-article--sans-bordure-bas' : null
])

const visibleMetaFields = computed(() =>
  metaFields.filter((key) => {
    if (key === 'titre' && effectiveMasquerTitre.value) return false
    return !!data.value?.[key]
  })
)

const articleCorpsClass = computed(() => {
  const classes = ['fp-article-corps', 'fp-article-corps--multicol']
  if (!effectiveNoLettrine.value) classes.push('fp-article-lettrine')
  if (isColumnsLayout.value || effectiveLayout.value === 'stack') {
    classes.push(textColumnsClasses[effectiveNbColonnes.value] ?? textColumnsClasses[1]!)
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
  if (!effectiveNoLettrine.value) classes.push('fp-article-lettrine')
  return classes
})

const visuelFloatWrapAlignClass = computed(() =>
  effectiveVisuelAlign.value === 'left'
    ? 'fp-article-visuel-float-wrap--left'
    : 'fp-article-visuel-float-wrap--right'
)

const visuelFigureClass = computed(() => ({
  'fp-article-visuel--bg-black': effectiveVisuelBgBlack.value,
  'fp-article-visuel--grayscale': effectiveVisuelGrayscale.value,
  'fp-article-visuel--sans-bordure': effectiveMasquerBordureVisuel.value
}))

const visuelFloatWrapClass = computed(() => [
  'fp-article-visuel-float-wrap',
  'fp-article-visuel-float-wrap-dimension',
  visuelFloatWrapAlignClass.value,
  effectiveVisuelBgBlack.value ? 'fp-article-visuel-float-wrap--bg-black' : null,
  effectiveVisuelGrayscale.value ? 'fp-article-visuel-float-wrap--grayscale' : null
])

const visuelWidthStyle = computed(() => {
  const ratio = Math.min(effectiveVisuelColonnes.value / effectiveNbColonnes.value, 1)
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

const isVideoVisuel = computed(() => {
  const src = data.value?.visuel ?? ''
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src)
})

const LOREM = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.`

function articleHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;lorem&gt;/gi, LOREM)
    .replace(/&lt;i&gt;/g, '<em>')
    .replace(/&lt;\/i&gt;/g, '</em>')
}
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
      <template v-for="key in visibleMetaFields" :key="key">
        <component
          :is="fieldTags[key]"
          :class="metaFieldClass(key)"
          :style="key === 'titre' ? titreStyle : undefined"
        >
          {{ data![key] }}
        </component>
      </template>

      <!-- stack / columns : visuel bloc avant -->
      <figure v-if="showBlockVisuelBefore" class="fp-article-visuel" :class="visuelFigureClass">
        <video
          v-if="isVideoVisuel"
          :src="data.visuel"
          controls
          playsinline
          preload="metadata"
        />
        <img v-else :src="data.visuel" :alt="data.titre">
        <figcaption
          v-if="showVisuelDescription"
          class="fp-article-visuel-description"
          :class="descriptionClass"
          :style="descriptionStyle"
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
            :class="visuelFloatWrapClass"
            :style="visuelWidthStyle"
          >
            <figure class="fp-article-visuel-float-wrap__figure">
              <video
                v-if="isVideoVisuel"
                :src="data.visuel"
                controls
                playsinline
                preload="metadata"
              />
              <img v-else :src="data.visuel" :alt="data.titre">
            </figure>
            <figcaption
              v-if="showVisuelDescription"
              class="fp-article-visuel-description fp-article-visuel-description--in-float"
              :class="descriptionClass"
              :style="descriptionStyle"
            >
              {{ data.description }}
            </figcaption>
          </div>

          <p v-if="showStandaloneDescription" :class="descriptionClass" :style="descriptionStyle">
            {{ data.description }}
          </p>

          <span v-if="data.article" v-html="articleHtml(data.article) + '<span class=\'fp-article-fin\' aria-hidden=\'true\'>&lt;</span>'" />
        </div>
      </div>

      <!-- stack / columns : description (sans visuel) + texte colonné -->
      <template v-else>
        <p v-if="showStandaloneDescription" :class="descriptionClass" :style="descriptionStyle">
          {{ data.description }}
        </p>

        <p v-if="data.article" lang="fr" :class="articleCorpsClass" v-html="articleHtml(data.article) + '<span class=\'fp-article-fin\' aria-hidden=\'true\'>&lt;</span>'" />
      </template>

      <!-- visuel bloc après (stack / columns / float+after) -->
      <figure v-if="showBlockVisuelAfter" class="fp-article-visuel" :class="visuelFigureClass">
        <video
          v-if="isVideoVisuel"
          :src="data.visuel"
          controls
          playsinline
          preload="metadata"
        />
        <img v-else :src="data.visuel" :alt="data.titre">
        <figcaption
          v-if="showVisuelDescription"
          class="fp-article-visuel-description"
          :class="descriptionClass"
          :style="descriptionStyle"
        >
          {{ data.description }}
        </figcaption>
      </figure>
    </template>
  </div>
</template>
