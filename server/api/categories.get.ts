import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError } from 'h3'

export default defineEventHandler(async () => {
  try {
    const raw = await readFile(join(process.cwd(), 'tmp', 'categories.txt'), 'utf-8')
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  } catch {
    throw createError({ statusCode: 500, message: 'Impossible de lire les catégories' })
  }
})
