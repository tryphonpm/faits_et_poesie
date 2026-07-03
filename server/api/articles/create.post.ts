import { readMultipartFormData, createError } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts) throw createError({ statusCode: 400, message: 'Formulaire vide' })

  const get = (name: string) =>
    parts.find((p) => p.name === name)?.data.toString('utf-8') ?? ''

  const titre = get('titre')
  const sousTitre = get('sous-titre')
  const article = get('article')
  const description = get('description')
  const visuelPart = parts.find((p) => p.name === 'visuel' && p.filename)

  if (!titre.trim()) throw createError({ statusCode: 400, message: 'Le titre est obligatoire' })

  const rootDir = join(process.cwd(), 'public', 'data')
  await mkdir(join(rootDir, 'articles'), { recursive: true })
  await mkdir(join(rootDir, 'visuels'), { recursive: true })

  // ---------- visuel ----------
  let visuelPath = ''
  if (visuelPart?.data && visuelPart.filename) {
    const ext = extname(visuelPart.filename).toLowerCase()
    const safeName = slugify(visuelPart.filename.replace(ext, '')) + '_' + Date.now() + ext
    const dest = join(rootDir, 'visuels', safeName)
    await writeFile(dest, visuelPart.data)
    visuelPath = `/data/visuels/${safeName}`
  }

  // ---------- JSON ----------
  const createdAt = new Date().toISOString()
  const slug = slugify(titre).slice(0, 50) + '_' + Date.now()

  const payload = {
    titre,
    sousTitre,
    article,
    description,
    visuel: visuelPath,
    createdAt
  }

  const jsonPath = join(rootDir, 'articles', `${slug}.json`)
  await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')

  return { success: true, file: `${slug}.json`, visuel: visuelPath }
})

function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
