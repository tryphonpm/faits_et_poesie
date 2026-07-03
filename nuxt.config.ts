// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@pinia/nuxt',
    'nuxt-mongoose'
  ],
  css: ['~/assets/css/tailwind.css'],
  mongoose: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/faits_poesie',
    options: {},
    modelsDir: 'models'
  }
})