<script setup lang="ts">
useHead({ title: 'Ajouter une publication spéciale' })

const router = useRouter()

const numero = ref<number | null>(null)
const titre = ref('')
const datePublication = ref(new Date().toISOString().slice(0, 10))
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

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
    const result = await $fetch<{ page?: string }>('/api/publications-speciales/create', {
      method: 'POST',
      body: {
        numero: numero.value,
        titre: titre.value,
        date_publication: datePublication.value
      }
    })
    await router.push(result.page ?? '/publications_speciales')
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

      <h1 class="mb-8 text-3xl font-bold tracking-tight text-slate-900">
        Ajouter une publication spéciale
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
            placeholder="Ex. 1"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <p class="mt-1.5 text-xs text-slate-400">
            Numéro unique de la publication spéciale.
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

        <button
          type="submit"
          :disabled="status === 'loading'"
          class="self-end rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enregistrer la publication spéciale
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
