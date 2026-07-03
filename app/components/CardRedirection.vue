<script setup lang="ts">
defineProps<{
  to: string
  title: string
  description?: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group block rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-emerald-300"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-900 group-hover:text-emerald-700">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-2 text-slate-500">
          {{ description }}
        </p>
      </div>
      <span
        class="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition group-hover:bg-emerald-50 group-hover:text-emerald-700"
        aria-hidden="true"
      >
        →
      </span>
    </div>
  </NuxtLink>
</template>
