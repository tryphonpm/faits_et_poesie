<script setup lang="ts">
useHead({ title: 'Ajouter un article' })

const router = useRouter()

interface PublicationSummary {
  numero: number
  createdAt: string | null
}

interface PublicationSpecialeSummary {
  numero: number
  titre: string
}

const { data: categories } = await useFetch<string[]>('/api/categories', { default: () => [] })
const { data: publications, status: publicationsStatus } = await useFetch<PublicationSummary[]>('/api/publications', {
  default: () => [] as PublicationSummary[]
})
const { data: publicationsSpeciales, status: publicationsSpecialesStatus } = await useFetch<PublicationSpecialeSummary[]>(
  '/api/publications-speciales',
  { default: () => [] as PublicationSpecialeSummary[] }
)

const publicationsLoading = computed(
  () => publicationsStatus.value === 'pending' || publicationsSpecialesStatus.value === 'pending'
)
const hasPublications = computed(
  () => (publications.value?.length ?? 0) > 0 || (publicationsSpeciales.value?.length ?? 0) > 0
)
const isSpecialSelection = computed(() => numero.value.startsWith('special-'))
const selectedNumero = computed(() => {
  if (!numero.value) return null
  if (numero.value.startsWith('special-')) return Number(numero.value.replace('special-', ''))
  return Number(numero.value)
})
const publicationPagePath = computed(() => {
  const n = selectedNumero.value
  if (!n) return '…'
  return isSpecialSelection.value ? `/publications_speciales/${n}` : `/publications/${n}`
})

const titre = ref('')
const numero = ref('')
const sousTitre = ref('')
const article = ref('')
const description = ref('')
const categorie = ref('')
const visuelFile = ref<File | null>(null)
const visuelPreview = ref<string | null>(null)
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
const descriptionAlign = ref<'left' | 'center' | 'right'>('right')
const titreAlign = ref<'left' | 'center' | 'right'>('left')

const titreFontSizeOptions = [
  '', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'
] as const

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif']
const ACCEPTED_VIDEOS = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const ACCEPTED = [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS]

const visuelIsVideo = computed(() => visuelFile.value?.type.startsWith('video/') ?? false)

function handleFile(file: File | null | undefined) {
  if (!file) return
  if (!ACCEPTED.includes(file.type)) {
    message.value = 'Format non supporté. Utilisez PNG, JPG, GIF, SVG, MP4, WebM ou MOV.'
    status.value = 'error'
    return
  }
  if (visuelPreview.value) URL.revokeObjectURL(visuelPreview.value)
  visuelFile.value = file
  visuelPreview.value = URL.createObjectURL(file)
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
  if (visuelPreview.value) URL.revokeObjectURL(visuelPreview.value)
  visuelFile.value = null
  visuelPreview.value = null
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

  if (!numero.value) {
    status.value = 'error'
    message.value = 'Sélectionnez une publication.'
    return
  }

  const isSpecial = numero.value.startsWith('special-')
  const numeroInt = Number(isSpecial ? numero.value.replace('special-', '') : numero.value)
  if (!Number.isInteger(numeroInt) || numeroInt < 1) {
    status.value = 'error'
    message.value = 'La publication sélectionnée est invalide.'
    return
  }

  status.value = 'loading'
  message.value = ''

  const form = new FormData()
  form.append('numero', String(numeroInt))
  form.append('publication-speciale', isSpecial ? 'true' : 'false')
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
  form.append('description-align', descriptionAlign.value)
  form.append('titre-align', titreAlign.value)
  if (visuelFile.value) {
    form.append('visuel-chemin', buildVisuelChemin(visuelFile.value.name, numeroInt, isSpecial))
    form.append('visuel', visuelFile.value, visuelFile.value.name)
  }

  try {
    await $fetch('/api/articles/create', { method: 'POST', body: form })
    await router.push('/articles')
  } catch (err: any) {
    status.value = 'error'
    message.value = err?.data?.message ?? 'Une erreur est survenue.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-8 text-3xl font-bold tracking-tight text-slate-900">
        Ajouter un article
      </h1>

      <form class="flex flex-col gap-6" @submit.prevent="submit">
        <!-- Numéro de bulletin -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="numero">
            Publication <span class="text-red-500">*</span>
          </label>
          <select
            id="numero"
            v-model="numero"
            required
            :disabled="publicationsLoading || !hasPublications"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="" disabled>
              {{ publicationsLoading ? 'Chargement…' : 'Sélectionner une publication…' }}
            </option>
            <optgroup v-if="publications?.length" label="Publications">
              <option
                v-for="publication in publications"
                :key="`pub-${publication.numero}`"
                :value="String(publication.numero)"
              >
                Bulletin n°{{ publication.numero }}
              </option>
            </optgroup>
            <optgroup v-if="publicationsSpeciales?.length" label="Publications spéciales">
              <option
                v-for="publication in publicationsSpeciales"
                :key="`special-${publication.numero}`"
                :value="`special-${publication.numero}`"
              >
                Spécial n°{{ publication.numero }}{{ publication.titre ? ` — ${publication.titre}` : '' }}
              </option>
            </optgroup>
          </select>
          <p v-if="!publicationsLoading && !hasPublications" class="mt-1.5 text-xs text-amber-600">
            Aucune publication en base.
            <NuxtLink to="/ajout_publication" class="font-medium underline hover:text-amber-700">
              Créer un bulletin
            </NuxtLink>
            ou
            <NuxtLink to="/ajout_publication_speciale" class="font-medium underline hover:text-amber-700">
              une publication spéciale
            </NuxtLink>
            d'abord.
          </p>
          <p v-else class="mt-1.5 text-xs text-slate-400">
            Obligatoire — l'article sera ajouté à la page
            <code class="rounded bg-slate-100 px-1">{{ publicationPagePath }}</code>.
          </p>
        </div>

        <!-- Titre -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="titre">
            Titre <span class="text-red-500">*</span>
          </label>
          <textarea
            id="titre"
            v-model="titre"
            rows="2"
            placeholder="Titre de l'article"
            class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <!-- Sous-titre -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="sous-titre">
            Sous-titre
          </label>
          <textarea
            id="sous-titre"
            v-model="sousTitre"
            rows="2"
            placeholder="Sous-titre de l'article"
            class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <!-- Article -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="article">
            Article
          </label>
          <textarea
            id="article"
            v-model="article"
            rows="10"
            placeholder="Contenu de l'article…"
            class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <!-- Visuel -->
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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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

          <div v-else class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
              <span class="truncate text-sm text-slate-500">{{ visuelFile?.name }}</span>
              <button
                type="button"
                class="ml-4 rounded-lg px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                @click="removeVisuel"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="description">
            Description
          </label>
          <input
            id="description"
            v-model="description"
            type="text"
            placeholder="Courte description (SEO, résumé…)"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <!-- Mise en page -->
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

        <!-- Catégorie -->
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

        <!-- Feedback -->
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
            <span v-if="status === 'loading'">Enregistrement en cours…</span>
            <span v-else>{{ message }}</span>
          </div>
        </Transition>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="status === 'loading'"
          class="self-end rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enregistrer l'article
        </button>
      </form>
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
