<script setup lang="ts">
interface PublicationSpeciale {
  id: string
  numero: number
  titre: string
  date_publication: string
  status: string
  createdAt: string | null
}

const route = useRoute()
const router = useRouter()
const numeroParam = computed(() => Number(route.params.numero))

const { data: initial, status: loadStatus, error: loadError } = await useFetch<PublicationSpeciale>(
  () => `/api/publications-speciales/${numeroParam.value}`
)

useHead(() => ({
  title: initial.value
    ? `Modifier — ${initial.value.titre || `Publication spéciale n°${initial.value.numero}`}`
    : 'Modifier la publication spéciale'
}))

const numero = ref<number | null>(null)
const titre = ref('')
const datePublication = ref('')
const publicationStatus = ref<'brouillon' | 'publié'>('brouillon')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

watch(initial, (data) => {
  if (!data) return
  numero.value = data.numero
  titre.value = data.titre ?? ''
  datePublication.value = data.date_publication?.slice(0, 10) ?? ''
  publicationStatus.value = data.status === 'publié' ? 'publié' : 'brouillon'
}, { immediate: true })

async function submit() {
  if (numero.value === null || !Number.isInteger(numero.value) || numero.value < 1) {
    status.value = 'error'
    message.value = 'Le numéro est obligatoire (entier ≥ 1).'
    return
  }

  if (!datePublication.value) {
    status.value = 'error'
    message.value = 'La date de publication est obligatoire.'
    return
  }

  status.value = 'loading'
  message.value = ''

  try {
    const result = await $fetch<{
      numero: number
      page?: string
    }>(`/api/publications-speciales/${numeroParam.value}`, {
      method: 'PUT',
      body: {
        numero: numero.value,
        titre: titre.value,
        date_publication: datePublication.value,
        status: publicationStatus.value
      }
    })

    status.value = 'success'
    message.value = 'Publication spéciale mise à jour.'
    await router.push(result.page ?? `/publications_speciales/${result.numero}`)
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
        to="/publications_speciales"
        class="mb-8 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
      >
        ← Retour aux publications spéciales
      </NuxtLink>

      <div v-if="loadStatus === 'pending'" class="space-y-4">
        <div class="h-10 w-1/2 animate-pulse rounded-lg bg-slate-200" />
        <div class="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <p v-else-if="loadError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        Publication spéciale introuvable.
      </p>

      <template v-else>
        <h1 class="mb-8 text-3xl font-bold tracking-tight text-slate-900">
          Modifier la publication spéciale
        </h1>

        <form class="flex flex-col gap-6" @submit.prevent="submit">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="numero">
              Numéro <span class="text-red-500">*</span>
            </label>
            <input
              id="numero"
              v-model.number="numero"
              type="number"
              min="1"
              step="1"
              required
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <p class="mt-1.5 text-xs text-slate-400">
              Modifier le numéro renomme aussi la page
              <code class="rounded bg-slate-100 px-1">/publications_speciales/{{ numero ?? '…' }}</code>.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="titre">
              Titre
            </label>
            <input
              id="titre"
              v-model="titre"
              type="text"
              placeholder="Ex. Hors-série été 2026"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <p class="mt-1.5 text-xs text-slate-400">
              Titre ou label de la publication spéciale.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="date-publication">
              Date de publication <span class="text-red-500">*</span>
            </label>
            <input
              id="date-publication"
              v-model="datePublication"
              type="date"
              required
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700" for="status">
              Statut
            </label>
            <select
              id="status"
              v-model="publicationStatus"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="brouillon">Brouillon</option>
              <option value="publié">Publié</option>
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
              <span v-if="status === 'loading'">Enregistrement en cours…</span>
              <span v-else>{{ message }}</span>
            </div>
          </Transition>

          <div class="flex items-center justify-end gap-3">
            <NuxtLink
              to="/publications_speciales"
              class="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Annuler
            </NuxtLink>
            <button
              type="submit"
              :disabled="status === 'loading'"
              class="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
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
