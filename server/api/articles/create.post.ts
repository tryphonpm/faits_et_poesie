import { readMultipartFormData, createError } from 'h3'
import { parseArticleDisplayFields, saveVisuelFile } from '../../utils/articleDisplayFields'

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

  const visuelPath = await saveVisuelFile(visuelPart)

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
    ...parseArticleDisplayFields(get),
    createdAt
  }

  await Article.create(payload)

  return { success: true, id, visuel: visuelPath }
})
