<script setup lang="ts">
interface Article {
  id: string
  numero?: number
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
  createdAt: string | null
}

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

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

const ACCEPTED = ['image/png', 'image/jpeg', 'image/svg+xml']

watch(initial, (data) => {
  if (!data) return
  titre.value = data.titre
  numero.value = data.numero ?? null
  sousTitre.value = data.sousTitre
  article.value = data.article
  description.value = data.description
  categorie.value = data.categorie
  layout.value = data.layout ?? 'stack'
  visuelPosition.value = data.visuelPosition ?? 'before-article'
  visuelColonnes.value = data.visuelColonnes ?? 1
  visuelAlign.value = data.visuelAlign ?? 'right'
  visuelPreview.value = data.visuel || null
  visuelFile.value = null
  visuelRemoved.value = false
}, { immediate: true })

function handleFile(file: File | null | undefined) {
  if (!file) return
  if (!ACCEPTED.includes(file.type)) {
    message.value = 'Format non supporté. Utilisez PNG, JPG ou SVG.'
    status.value = 'error'
    return
  }
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
  visuelFile.value = null
  visuelPreview.value = null
  visuelRemoved.value = true
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
  form.append('titre', titre.value)
  form.append('sous-titre', sousTitre.value)
  form.append('article', article.value)
  form.append('description', description.value)
  form.append('categorie', categorie.value)
  form.append('layout', layout.value)
  form.append('visuel-position', visuelPosition.value)
  form.append('visuel-colonnes', String(visuelColonnes.value))
  form.append('visuel-align', visuelAlign.value)
  if (visuelRemoved.value) form.append('supprimer-visuel', 'true')
  if (visuelFile.value) form.append('visuel', visuelFile.value, visuelFile.value.name)

  try {
    await $fetch(`/api/articles/${encodeURIComponent(id.value)}`, { method: 'PUT', body: form })
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
              rows="10"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700">
              Visuel <span class="text-xs font-normal text-slate-400">(PNG, JPG, SVG)</span>
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
                Glissez-déposez une image ou
                <span class="font-semibold text-emerald-600">parcourez</span>
              </p>
              <input
                ref="fileInput"
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                class="hidden"
                @change="onFileInput"
              />
            </div>

            <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
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
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="description">
              Description
            </label>
            <input
              id="description"
              v-model="description"
              type="text"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
            </div>
          </fieldset>

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
