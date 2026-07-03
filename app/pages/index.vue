<script setup lang="ts">
const counter = useCounterStore()
const { data: page } = await useAsyncData('index-content', () => queryCollection('content').path('/').first())
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
    <div class="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-emerald-600">Nuxt 4</p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Tailwind CSS · Content · Pinia
        </h1>
        <p class="mt-4 text-lg text-slate-600">
          Environnement prêt à l'emploi, modules installés et configurés.
        </p>
      </header>

      <section class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">Compteur Pinia</h2>
        <p class="mt-1 text-slate-500">Un store partagé, réactif entre les composants.</p>

        <div class="mt-6 flex items-center gap-4">
          <button
            class="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-300"
            @click="counter.decrement"
          >
            −
          </button>
          <span class="min-w-[3ch] text-center text-3xl font-bold text-emerald-600">
            {{ counter.count }}
          </span>
          <button
            class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
            @click="counter.increment"
          >
            +
          </button>
          <button
            class="ml-auto text-sm font-medium text-slate-400 transition hover:text-slate-600"
            @click="counter.reset"
          >
            Réinitialiser
          </button>
        </div>
        <p class="mt-3 text-sm text-slate-400">Double : {{ counter.doubleCount }}</p>
      </section>

      <section class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">Contenu Markdown (Nuxt Content)</h2>
        <ContentRenderer v-if="page" :value="page" class="prose prose-slate mt-4 max-w-none" />
        <p v-else class="mt-4 text-slate-500">Aucun contenu trouvé dans le dossier `content/`.</p>
      </section>
    </div>
  </main>
</template>
