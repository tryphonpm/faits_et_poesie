<script setup lang="ts">
interface Article {
  id: string
  numero?: number
  publicationSpeciale?: boolean
  titre: string
  sousTitre: string
  article: string
  description: string
  categorie: string
  visuel: string
  layout?: 'stack' | 'float' | 'columns'
  visuelPosition?: 'before-article' | 'after-article'
  visuelColonnes?: number
  visuelAlign?: 'left' | 'right'
  nbColonnes?: number
  nbRows?: number
  titreFontSize?: string
  masquerTitre?: boolean
  bordureGauche?: boolean
  noLettrine?: boolean
  visuelBgBlack?: boolean
  visuelGrayscale?: boolean
  masquerBordureVisuel?: boolean
  encadre?: boolean
  masquerBordureBas?: boolean
  sansColonnes?: boolean
  descriptionAlign?: 'left' | 'center' | 'right'
  titreAlign?: 'left' | 'center' | 'right'
  createdAt: string | null
}

const titreFontSizeOptions = [
  '', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'
] as const

const route = useRoute()
const router = useRouter()
const id = computed(() => decodeURIComponent(route.params.id as string))

const { data: categories } = await useFetch<string[]>('/api/categories', { default: () => [] })
const { data: initial, status: loadStatus, error: loadError } = await useFetch<Article>(
  () => `/api/articles/${encodeURIComponent(id.value)}`
)

useHead(() => ({
  title: initial.value ? `Modifier — ${initial.value.titre}` : 'Modifier l\'article'
}))

const titre = ref('')
const numero = ref<number | null>(null)
const publicationSpeciale = ref(false)
const sousTitre = ref('')
const article = ref('')
const description = ref('')
const categorie = ref('')
const visuelFile = ref<File | null>(null)
const visuelPreview = ref<string | null>(null)
const visuelRemoved = ref(false)
const isDragging = ref(false)

const layout = ref<'stack' | 'float' | 'columns'>('stack')
const visuelPosition = ref<'before-article' | 'after-article'>('before-article')
const visuelColonnes = ref(1)
const visuelAlign = ref<'left' | 'right'>('right')
const nbColonnes = ref(1)
const nbRows = ref(1)
const titreFontSize = ref('')
const titreFontSizeCustom = ref('')
const masquerTitre = ref(false)
const bordureGauche = ref(false)
const encadre = ref(false)
const masquerBordureBas = ref(false)
const sansColonnes = ref(false)
const noLettrine = ref(false)
const visuelBgBlack = ref(true)
const visuelGrayscale = ref(true)
const masquerBordureVisuel = ref(false)
const descriptionAlign = ref<'left' | 'center' | 'right'>('right')
const titreAlign = ref<'left' | 'center' | 'right'>('left')

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif']
const ACCEPTED_VIDEOS = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const ACCEPTED = [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS]

const visuelIsVideo = computed(() => {
  if (visuelFile.value) return visuelFile.value.type.startsWith('video/')
  const src = visuelPreview.value ?? ''
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src)
})

function isTailwindFontSize(value: string) {
  return titreFontSizeOptions.includes(value as typeof titreFontSizeOptions[number])
}

watch(initial, (data) => {
  if (!data) return
  titre.value = data.titre
  numero.value = data.numero ?? null
  publicationSpeciale.value = data.publicationSpeciale === true
  sousTitre.value = data.sousTitre
  article.value = data.article
  description.value = data.description
  categorie.value = data.categorie
  layout.value = data.layout ?? 'stack'
  visuelPosition.value = data.visuelPosition ?? 'before-article'
  visuelColonnes.value = data.visuelColonnes ?? 1
  visuelAlign.value = data.visuelAlign ?? 'right'
  nbColonnes.value = data.nbColonnes ?? 1
  nbRows.value = data.nbRows ?? 1
  masquerTitre.value = data.masquerTitre ?? false
  bordureGauche.value = data.bordureGauche ?? false
  encadre.value = data.encadre ?? false
  masquerBordureBas.value = data.masquerBordureBas ?? false
  sansColonnes.value = data.sansColonnes ?? false
  noLettrine.value = data.noLettrine ?? false
  visuelBgBlack.value = data.visuelBgBlack ?? true
  visuelGrayscale.value = data.visuelGrayscale ?? true
  masquerBordureVisuel.value = data.masquerBordureVisuel ?? false
  descriptionAlign.value = data.descriptionAlign ?? 'right'
  titreAlign.value = data.titreAlign ?? 'left'
  const storedFontSize = data.titreFontSize ?? ''
  if (storedFontSize && !isTailwindFontSize(storedFontSize)) {
    titreFontSize.value = ''
    titreFontSizeCustom.value = storedFontSize
  } else {
    titreFontSize.value = storedFontSize
    titreFontSizeCustom.value = ''
  }
  visuelPreview.value = data.visuel || null
  visuelFile.value = null
  visuelRemoved.value = false
}, { immediate: true })

function handleFile(file: File | null | undefined) {
  if (!file) return
  if (!ACCEPTED.includes(file.type)) {
    message.value = 'Format non supporté. Utilisez PNG, JPG, GIF, SVG, MP4, WebM ou MOV.'
    status.value = 'error'
    return
  }
  if (visuelPreview.value?.startsWith('blob:')) URL.revokeObjectURL(visuelPreview.value)
  visuelFile.value = file
  visuelPreview.value = URL.createObjectURL(file)
  visuelRemoved.value = false
  status.value = 'idle'
  message.value = ''
}

function onFileInput(e: Event) {
  handleFile((e.target as HTMLInputElement).files?.[0])
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  handleFile(e.dataTransfer?.files?.[0])
}

function removeVisuel() {
  if (visuelPreview.value?.startsWith('blob:')) URL.revokeObjectURL(visuelPreview.value)
  visuelFile.value = null
  visuelPreview.value = null
  visuelRemoved.value = true
}

function buildVisuelChemin(fileName: string, bulletinNumero: number, isPublicationSpeciale: boolean) {
  const subDir = isPublicationSpeciale ? `special/${bulletinNumero}` : String(bulletinNumero)
  return `/data/visuels/${subDir}/${fileName}`
}

async function submit() {
  if (!titre.value.trim()) {
    status.value = 'error'
    message.value = 'Le titre est obligatoire.'
    return
  }

  if (numero.value === null || !Number.isInteger(numero.value) || numero.value < 1) {
    status.value = 'error'
    message.value = 'Le numéro de bulletin est obligatoire (entier ≥ 1).'
    return
  }

  status.value = 'loading'
  message.value = ''

  const form = new FormData()
  form.append('numero', String(numero.value))
  form.append('publication-speciale', publicationSpeciale.value ? 'true' : 'false')
  form.append('titre', titre.value)
  form.append('sous-titre', sousTitre.value)
  form.append('article', article.value)
  form.append('description', description.value)
  form.append('categorie', categorie.value)
  form.append('layout', layout.value)
  form.append('visuel-position', visuelPosition.value)
  form.append('visuel-colonnes', String(visuelColonnes.value))
  form.append('visuel-align', visuelAlign.value)
  form.append('nb-colonnes', String(nbColonnes.value))
  form.append('nb-rows', String(nbRows.value))
  form.append('titre-font-size', titreFontSizeCustom.value.trim() || titreFontSize.value)
  form.append('masquer-titre', String(masquerTitre.value))
  form.append('bordure-gauche', String(bordureGauche.value))
  form.append('encadre', String(encadre.value))
  form.append('masquer-bordure-bas', String(masquerBordureBas.value))
  form.append('sans-colonnes', String(sansColonnes.value))
  form.append('no-lettrine', String(noLettrine.value))
  form.append('visuel-bg-black', String(visuelBgBlack.value))
  form.append('visuel-grayscale', String(visuelGrayscale.value))
  form.append('masquer-bordure-visuel', String(masquerBordureVisuel.value))
  form.append('description-align', descriptionAlign.value)
  form.append('titre-align', titreAlign.value)
  if (visuelRemoved.value) form.append('supprimer-visuel', 'true')
  if (visuelFile.value) {
    form.append(
      'visuel-chemin',
      buildVisuelChemin(visuelFile.value.name, numero.value!, publicationSpeciale.value)
    )
    form.append('visuel', visuelFile.value, visuelFile.value.name)
  }

  try {
    await $fetch(`/api/articles/${encodeURIComponent(id.value)}`, { method: 'PUT', body: form })
    await clearNuxtData(`article-component-${id.value}`)
    status.value = 'success'
    message.value = 'Article mis à jour.'
    await router.push(`/articles/${encodeURIComponent(id.value)}`)
  } catch (err: any) {
    status.value = 'error'
    message.value = err?.data?.message ?? 'Une erreur est survenue.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
    <div class="mx-auto max-w-2xl">
      <NuxtLink
        :to="`/articles/${encodeURIComponent(id)}`"
        class="mb-8 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
      >
        ← Retour à l'article
      </NuxtLink>

      <div v-if="loadStatus === 'pending'" class="space-y-4">
        <div class="h-10 w-1/2 animate-pulse rounded-lg bg-slate-200" />
        <div class="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <div
        v-else-if="loadError || !initial"
        class="rounded-2xl bg-red-50 px-6 py-8 text-center text-red-600"
      >
        Article introuvable.
      </div>

      <template v-else>
        <h1 class="mb-8 text-3xl font-bold tracking-tight text-slate-900">
          Modifier l'article
        </h1>

        <form class="flex flex-col gap-6" @submit.prevent="submit">
          <button
            type="submit"
            :disabled="status === 'loading'"
            class="self-end rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enregistrer les modifications
          </button>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="numero">
              Numéro de bulletin <span class="text-red-500">*</span>
            </label>
            <input
              id="numero"
              v-model.number="numero"
              type="number"
              min="1"
              step="1"
              placeholder="Ex. 20"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="categorie">
              Catégorie
            </label>
            <select
              id="categorie"
              v-model="categorie"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">— Sélectionner une catégorie —</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="titre">
              Titre <span class="text-red-500">*</span>
            </label>
            <textarea
              id="titre"
              v-model="titre"
              rows="2"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="sous-titre">
              Sous-titre
            </label>
            <textarea
              id="sous-titre"
              v-model="sousTitre"
              rows="2"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="article">
              Article
            </label>
            <textarea
              id="article"
              v-model="article"
              rows="20"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700">
              Visuel <span class="text-xs font-normal text-slate-400">(PNG, JPG, GIF, SVG, MP4, WebM, MOV)</span>
            </label>

            <div
              v-if="!visuelPreview"
              class="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition"
              :class="isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
              @click="($refs.fileInput as HTMLInputElement).click()"
            >
              <p class="text-sm text-slate-500">
                Glissez-déposez une image ou une vidéo, ou
                <span class="font-semibold text-emerald-600">parcourez</span>
              </p>
              <input
                ref="fileInput"
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.svg,.mp4,.webm,.ogg,.mov"
                class="hidden"
                @change="onFileInput"
              />
            </div>

            <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <video
                v-if="visuelIsVideo"
                :src="visuelPreview"
                class="max-h-60 w-full bg-black object-contain p-2"
                controls
                playsinline
              />
              <img
                v-else
                :src="visuelPreview"
                alt="Aperçu du visuel"
                class="max-h-60 w-full object-contain p-2"
              />
              <div class="flex items-center justify-between border-t border-slate-100 px-4 py-2">
                <span class="truncate text-sm text-slate-500">
                  {{ visuelFile?.name ?? 'Visuel actuel' }}
                </span>
                <button
                  type="button"
                  class="ml-4 rounded-lg px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                  @click="removeVisuel"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div class="mt-3 flex flex-col gap-2">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                Enrichissements du visuel
              </p>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input v-model="visuelBgBlack" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                Fond noir (bg-black)
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input v-model="visuelGrayscale" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                Niveaux de gris + contraste (grayscale, contrast-125)
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input v-model="masquerBordureVisuel" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                Masquer l'encadré du visuel
              </label>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="description">
              Description
            </label>
            <textarea
              id="description"
              v-model="description"
              rows="5"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>










          <fieldset class="rounded-xl border border-slate-200 bg-white p-4">
            <legend class="px-1 text-sm font-semibold text-slate-700">Mise en page</legend>

            <div class="mt-2 flex flex-col gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-600" for="layout">
                  Mode d'affichage
                </label>
                <select
                  id="layout"
                  v-model="layout"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="stack">Bloc (visuel pleine largeur)</option>
                  <option value="float">Flottant (texte autour du visuel)</option>
                  <option value="columns">Colonnes (texte multi-colonnes)</option>
                </select>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600" for="visuel-position">
                    Position du visuel
                  </label>
                  <select
                    id="visuel-position"
                    v-model="visuelPosition"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="before-article">Avant le texte</option>
                    <option value="after-article">Après le texte</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600" for="visuel-colonnes">
                    Largeur du visuel (colonnes)
                  </label>
                  <select
                    id="visuel-colonnes"
                    v-model.number="visuelColonnes"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
              </div>

              <div v-if="layout === 'float'">
                <label class="mb-1 block text-sm font-medium text-slate-600" for="visuel-align">
                  Alignement du visuel flottant
                </label>
                <select
                  id="visuel-align"
                  v-model="visuelAlign"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="left">Gauche</option>
                  <option value="right">Droite</option>
                </select>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600" for="nb-colonnes">
                    Largeur dans la grille (colonnes)
                  </label>
                  <select
                    id="nb-colonnes"
                    v-model.number="nbColonnes"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600" for="nb-rows">
                    Hauteur dans la grille (lignes)
                  </label>
                  <select
                    id="nb-rows"
                    v-model.number="nbRows"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset class="rounded-xl border border-slate-200 bg-white p-4">
            <legend class="px-1 text-sm font-semibold text-slate-700">Typographie & options</legend>

            <div class="mt-2 flex flex-col gap-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600" for="titre-font-size">
                    Taille du titre
                  </label>
                  <select
                    id="titre-font-size"
                    v-model="titreFontSize"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="">Par défaut</option>
                    <option v-for="size in titreFontSizeOptions.filter(Boolean)" :key="size" :value="size">
                      {{ size }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600" for="titre-font-size-custom">
                    Taille CSS personnalisée
                  </label>
                  <input
                    id="titre-font-size-custom"
                    v-model="titreFontSizeCustom"
                    type="text"
                    placeholder="Ex. 1.75rem, 28px"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-600" for="titre-align">
                  Alignement du titre
                </label>
                <select
                  id="titre-align"
                  v-model="titreAlign"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="left">Gauche</option>
                  <option value="center">Centré</option>
                  <option value="right">Droite</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-slate-600" for="description-align">
                  Alignement de la description
                </label>
                <select
                  id="description-align"
                  v-model="descriptionAlign"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="right">Droite</option>
                  <option value="left">Gauche</option>
                  <option value="center">Centré</option>
                </select>
              </div>

              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="masquerTitre" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                  Masquer le titre
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="bordureGauche" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                  Bordure gauche
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="encadre" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                  Encadrer l'article
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="masquerBordureBas" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                  Masquer la bordure basse
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="sansColonnes" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                  Sans colonnes (texte)
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="noLettrine" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                  Désactiver la lettrine
                </label>
              </div>
            </div>
          </fieldset>

          <Transition name="fade">
            <div
              v-if="status !== 'idle'"
              class="rounded-xl px-4 py-3 text-sm font-medium"
              :class="{
                'bg-emerald-50 text-emerald-700': status === 'success',
                'bg-red-50 text-red-600': status === 'error',
                'bg-slate-100 text-slate-600': status === 'loading'
              }"
            >
              <span v-if="status === 'loading'">Mise à jour en cours…</span>
              <span v-else>{{ message }}</span>
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="status === 'loading'"
            class="self-end rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enregistrer les modifications
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
