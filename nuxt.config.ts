import { readdirSync } from 'node:fs'
import { join } from 'node:path'

function getPublicationRoutes(): string[] {
  try {
    const dir = join(process.cwd(), 'app', 'pages', 'publications')
    return readdirSync(dir)
      .map((f) => f.match(/^(\d+)\.vue$/)?.[1])
      .filter((n): n is string => n !== undefined)
      .map((n) => `/publications/${n}`)
  } catch {
    return []
  }
}

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
  },
  nitro: {
    prerender: {
      routes: getPublicationRoutes()
    }
  }
})