import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async () => {
  const dir = join(process.cwd(), 'public', 'data', 'articles')

  let files: string[]
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  } catch {
    return []
  }

  const articles = await Promise.all(
    files.map(async (file) => {
      try {
        const raw = await readFile(join(dir, file), 'utf-8')
        const data = JSON.parse(raw)
        return {
          id: data.id ?? file.replace('.json', ''),
          titre: data.titre ?? '',
          sousTitre: data.sousTitre ?? '',
          description: data.description ?? '',
          visuel: data.visuel ?? '',
          createdAt: data.createdAt ?? null
        }
      } catch {
        return null
      }
    })
  )

  return articles
    .filter(Boolean)
    .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime())
})
