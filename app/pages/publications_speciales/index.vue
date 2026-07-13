<script setup lang="ts">
interface PublicationSpecialeSummary {
  id: string
  numero: number
  titre: string
  date_publication: string | null
  status: string
  createdAt: string | null
}

useHead({ title: 'Publications spéciales' })

const { data: publications, status, refresh } = await useFetch<PublicationSpecialeSummary[]>(
  '/api/publications-speciales',
  { default: () => [] as PublicationSpecialeSummary[] }
)

const deletingNumero = ref<number | null>(null)

function formatPublicationDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso))
}

async function deletePublication(publication: PublicationSpecialeSummary) {
  const label = publication.titre || `n°${publication.numero}`
  if (!confirm(`Supprimer la publication spéciale ${label} ?`)) return

  deletingNumero.value = publication.numero
  try {
    await $fetch(`/api/publications-speciales/${publication.numero}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.message ?? 'Suppression impossible.')
  } finally {
    deletingNumero.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Publications spéciales</h1>
        <NuxtLink
          to="/ajout_publication_speciale"
          class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
        >
          + Ajouter
        </NuxtLink>
      </div>

      <div v-if="status === 'pending'" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="h-20 animate-pulse rounded-2xl bg-slate-200"
        />
      </div>

      <p
        v-else-if="!publications.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
      >
        Aucune publication spéciale pour l'instant.
      </p>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="publication in publications"
          :key="publication.numero"
          class="flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-emerald-300"
        >
          <div class="min-w-0">
            <p class="truncate text-base font-semibold text-slate-900">
              <span v-if="publication.titre">{{ publication.titre }}</span>
              <span v-else>Publication spéciale n°{{ publication.numero }}</span>
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              Date : {{ formatPublicationDate(publication.date_publication) }}
              <span class="ml-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase">
                {{ publication.status }}
              </span>
            </p>
            <p class="text-xs text-slate-300">
              Créé le {{ formatDate(publication.createdAt) }}
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <NuxtLink
              :to="`/publications_speciales/modifier/${publication.numero}`"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Modifier
            </NuxtLink>
            <NuxtLink
              :to="`/publications_speciales/${publication.numero}`"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Voir →
            </NuxtLink>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingNumero === publication.numero"
              @click="deletePublication(publication)"
            >
              {{ deletingNumero === publication.numero ? '…' : 'Supprimer' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
