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
  const categorie = get('categorie')
  const visuelPart = parts.find((p) => p.name === 'visuel' && p.filename)

  if (!titre.trim()) throw createError({ statusCode: 400, message: 'Le titre est obligatoire' })

  const numero = Number(get('numero'))
  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Le numéro de bulletin est obligatoire (entier ≥ 1).' })
  }

  const visuelsDir = join(process.cwd(), 'public', 'data', 'visuels')
  await mkdir(visuelsDir, { recursive: true })

  let visuelPath = ''
  if (visuelPart?.data && visuelPart.filename) {
    const ext = extname(visuelPart.filename).toLowerCase()
    const safeName = slugify(visuelPart.filename.replace(ext, '')) + '_' + Date.now() + ext
    const dest = join(visuelsDir, safeName)
    await writeFile(dest, visuelPart.data)
    visuelPath = `/data/visuels/${safeName}`
  }

  const now = new Date()
  const ts = Date.now()
  const pad = (n: number) => String(n).padStart(2, '0')
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('-')
  const id = `${datePart}_${ts}`
  const createdAt = now.toISOString()

  const payload = {
    id,
    numero,
    titre,
    sousTitre,
    article,
    description,
    categorie,
    visuel: visuelPath,
    layout: get('layout') || 'stack',
    visuelPosition: get('visuel-position') || 'before-article',
    visuelColonnes: Math.min(5, Math.max(1, Number(get('visuel-colonnes')) || 1)),
    visuelAlign: get('visuel-align') === 'left' ? 'left' : 'right',
    createdAt
  }

  await Article.create(payload)

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
