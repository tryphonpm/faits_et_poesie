<script setup lang="ts">
useHead({ title: 'Accueil' })

type StepStatus = 'idle' | 'loading' | 'success' | 'error'

const buildStatus = ref<StepStatus>('idle')
const buildOutput = ref('')

const copyStatus = ref<StepStatus>('idle')
const copyOutput = ref('')

async function runBuild() {
  if (buildStatus.value === 'loading') return
  buildStatus.value = 'loading'
  buildOutput.value = ''

  try {
    const result = await $fetch<{ output: string }>('/api/generate-html', { method: 'POST' })
    buildOutput.value = result.output
    buildStatus.value = 'success'
  } catch (err: any) {
    buildOutput.value = err?.data?.message ?? 'Une erreur est survenue.'
    buildStatus.value = 'error'
  }
}

async function runCopy() {
  if (copyStatus.value === 'loading') return
  copyStatus.value = 'loading'
  copyOutput.value = ''

  try {
    const result = await $fetch<{ output: string }>('/api/generate-copy', { method: 'POST' })
    copyOutput.value = result.output
    copyStatus.value = 'success'
  } catch (err: any) {
    copyOutput.value = err?.data?.message ?? 'Une erreur est survenue.'
    copyStatus.value = 'error'
  }
}
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
    <div class="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-emerald-600">FAITS & POÉSIE</p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Accueil
        </h1>
        <p class="mt-4 text-lg text-slate-600">
          Choisissez une section pour continuer.
        </p>
      </header>

      <CardRedirection
        to="/articles"
        title="Articles"
        description="Consulter la liste des articles disponibles."
      />
      <CardRedirection
        to="/publications"
        title="Publications"
        description="Consulter la liste des publications disponibles."
      />

      <!-- Génération HTML statique -->
      <div class="rounded-2xl bg-white px-8 py-6 shadow-sm ring-1 ring-slate-200 space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">
            Site HTML statique
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Génère les publications en pages HTML autonomes dans
            <code class="rounded bg-slate-100 px-1 text-xs">publications-html/</code>.
          </p>
        </div>

        <!-- Étape 1 : nuxt generate -->
        <div class="rounded-xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-800">
                Étape 1 — Build Nuxt
              </p>
              <p class="mt-0.5 text-xs text-slate-500">
                Prérendu des pages Vue en HTML (MongoDB doit être accessible).
                Peut prendre 1–2 minutes.
              </p>
              <p class="mt-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 inline-block">
                ⚠ Ne pas lancer si le serveur de dev est en conflit — préférer
                <code>npx nuxt generate</code> dans un terminal séparé.
              </p>
            </div>
            <button
              type="button"
              :disabled="buildStatus === 'loading'"
              class="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="buildStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-800'"
              @click="runBuild"
            >
              <span v-if="buildStatus === 'loading'" class="flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Build en cours…
              </span>
              <span v-else-if="buildStatus === 'success'">✓ Relancer le build</span>
              <span v-else>Lancer le build</span>
            </button>
          </div>
          <div
            v-if="buildStatus !== 'idle'"
            class="mt-4 rounded-lg border px-4 py-3 text-xs font-mono leading-relaxed"
            :class="{
              'border-slate-200 bg-slate-50 text-slate-500': buildStatus === 'loading',
              'border-emerald-200 bg-emerald-50 text-emerald-800': buildStatus === 'success',
              'border-red-200 bg-red-50 text-red-700': buildStatus === 'error',
            }"
          >
            <p v-if="buildStatus === 'loading'" class="italic text-slate-400">En attente de la sortie…</p>
            <pre v-else class="whitespace-pre-wrap break-all">{{ buildOutput }}</pre>
          </div>
        </div>

        <!-- Étape 2 : copy-static -->
        <div class="rounded-xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-800">
                Étape 2 — Copier les fichiers HTML
              </p>
              <p class="mt-0.5 text-xs text-slate-500">
                Réorganise <code class="rounded bg-slate-100 px-1">.output/public/</code> vers
                <code class="rounded bg-slate-100 px-1">publications-html/</code> :
                HTML, CSS, JS, images et polices.
                Nécessite que l'étape 1 ait été exécutée au moins une fois.
              </p>
            </div>
            <button
              type="button"
              :disabled="copyStatus === 'loading'"
              class="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="copyStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'"
              @click="runCopy"
            >
              <span v-if="copyStatus === 'loading'" class="flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Copie en cours…
              </span>
              <span v-else-if="copyStatus === 'success'">✓ Relancer la copie</span>
              <span v-else>Copier les fichiers</span>
            </button>
          </div>
          <div
            v-if="copyStatus !== 'idle'"
            class="mt-4 rounded-lg border px-4 py-3 text-xs font-mono leading-relaxed"
            :class="{
              'border-slate-200 bg-slate-50 text-slate-500': copyStatus === 'loading',
              'border-emerald-200 bg-emerald-50 text-emerald-800': copyStatus === 'success',
              'border-red-200 bg-red-50 text-red-700': copyStatus === 'error',
            }"
          >
            <p v-if="copyStatus === 'loading'" class="italic text-slate-400">En attente de la sortie…</p>
            <pre v-else class="whitespace-pre-wrap break-all">{{ copyOutput }}</pre>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
