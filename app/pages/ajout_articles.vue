<script setup lang="ts">
useHead({ title: 'Ajouter un article' })

const { data: categories } = await useFetch<string[]>('/api/categories', { default: () => [] })

const titre = ref('')
const sousTitre = ref('')
const article = ref('')
const description = ref('')
const categorie = ref('')
const visuelFile = ref<File | null>(null)
const visuelPreview = ref<string | null>(null)
const isDragging = ref(false)

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

const ACCEPTED = ['image/png', 'image/jpeg', 'image/svg+xml']

function handleFile(file: File | null | undefined) {
  if (!file) return
  if (!ACCEPTED.includes(file.type)) {
    message.value = 'Format non supporté. Utilisez PNG, JPG ou SVG.'
    status.value = 'error'
    return
  }
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
  visuelFile.value = null
  visuelPreview.value = null
}

async function submit() {
  if (!titre.value.trim()) {
    status.value = 'error'
    message.value = 'Le titre est obligatoire.'
    return
  }

  status.value = 'loading'
  message.value = ''

  const form = new FormData()
  form.append('titre', titre.value)
  form.append('sous-titre', sousTitre.value)
  form.append('article', article.value)
  form.append('description', description.value)
  form.append('categorie', categorie.value)
  if (visuelFile.value) form.append('visuel', visuelFile.value, visuelFile.value.name)

  try {
    const res = await $fetch('/api/articles/create', { method: 'POST', body: form })
    status.value = 'success'
    message.value = `Article enregistré : ${(res as { id: string }).id}`
    titre.value = ''
    sousTitre.value = ''
    article.value = ''
    description.value = ''
    categorie.value = ''
    visuelFile.value = null
    visuelPreview.value = null
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
        <!-- Titre -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="titre">
            Titre <span class="text-red-500">*</span>
          </label>
          <input
            id="titre"
            v-model="titre"
            type="text"
            placeholder="Titre de l'article"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <!-- Sous-titre -->
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700" for="sous-titre">
            Sous-titre
          </label>
          <input
            id="sous-titre"
            v-model="sousTitre"
            type="text"
            placeholder="Sous-titre de l'article"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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

          <div v-else class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <img
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
