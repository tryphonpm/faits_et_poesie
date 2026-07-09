<script setup lang="ts">
useHead({ title: 'Accueil' })
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
    </div>
  </main>
</template>
