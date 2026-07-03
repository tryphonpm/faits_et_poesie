import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID manquant' })

  const dir = join(process.cwd(), 'public', 'data', 'articles')

  let files: string[]
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  } catch {
    throw createError({ statusCode: 404, message: 'Aucun article trouvé' })
  }

  for (const file of files) {
    try {
      const raw = await readFile(join(dir, file), 'utf-8')
      const data = JSON.parse(raw)
      const fileId = data.id ?? file.replace('.json', '')
      if (fileId === id) return data
    } catch {
      continue
    }
  }

  throw createError({ statusCode: 404, message: `Article "${id}" introuvable` })
})
