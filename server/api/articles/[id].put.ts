import { readMultipartFormData, createError } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID manquant' })

  const existing = await Article.findOne({ id })
  if (!existing) throw createError({ statusCode: 404, message: `Article "${id}" introuvable` })

  const parts = await readMultipartFormData(event)
  if (!parts) throw createError({ statusCode: 400, message: 'Formulaire vide' })

  const get = (name: string) =>
    parts.find((p) => p.name === name)?.data.toString('utf-8') ?? ''

  const titre = get('titre')
  const sousTitre = get('sous-titre')
  const article = get('article')
  const description = get('description')
  const categorie = get('categorie')
  const supprimerVisuel = get('supprimer-visuel') === 'true'
  const visuelPart = parts.find((p) => p.name === 'visuel' && p.filename)

  if (!titre.trim()) throw createError({ statusCode: 400, message: 'Le titre est obligatoire' })

  let visuelPath = existing.visuel

  if (visuelPart?.data && visuelPart.filename) {
    const visuelsDir = join(process.cwd(), 'public', 'data', 'visuels')
    await mkdir(visuelsDir, { recursive: true })
    const ext = extname(visuelPart.filename).toLowerCase()
    const safeName = slugify(visuelPart.filename.replace(ext, '')) + '_' + Date.now() + ext
    const dest = join(visuelsDir, safeName)
    await writeFile(dest, visuelPart.data)
    visuelPath = `/data/visuels/${safeName}`
  } else if (supprimerVisuel) {
    visuelPath = ''
  }

  existing.titre = titre
  existing.sousTitre = sousTitre
  existing.article = article
  existing.description = description
  existing.categorie = categorie
  existing.visuel = visuelPath
  await existing.save()

  return { success: true, id, visuel: visuelPath }
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
