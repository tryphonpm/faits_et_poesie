import { access, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, readBody } from 'h3'
import { normalizePublicationDate } from '../../utils/publicationDate'

function generateId(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('-')
  return `${datePart}_${Date.now()}`
}

async function createPublicationSpecialePage(numero: number) {
  const pagesDir = join(process.cwd(), 'app', 'pages', 'publications_speciales')
  const templatePath = join(pagesDir, 'maquettes', 'basic.vue')
  const destPath = join(pagesDir, `${numero}.vue`)

  try {
    await access(destPath)
    throw createError({ statusCode: 409, message: `La page /publications_speciales/${numero} existe déjà.` })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    if (!(err instanceof Error) || (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw createError({ statusCode: 500, message: 'Impossible de vérifier la page de publication spéciale.' })
    }
  }

  const template = await readFile(templatePath, 'utf-8')
  await writeFile(destPath, template, 'utf-8')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const numero = Number(body?.numero)

  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Le numéro est obligatoire (entier ≥ 1).' })
  }

  const date_publication = normalizePublicationDate(body?.date_publication)
  if (!date_publication) {
    throw createError({ statusCode: 400, message: 'La date de publication est obligatoire (AAAA-MM-JJ).' })
  }

  const titre = String(body?.titre ?? '').trim()

  const existing = await PublicationSpeciale.findOne({ numero }).lean()
  if (existing) {
    throw createError({ statusCode: 409, message: `La publication spéciale n°${numero} existe déjà.` })
  }

  const id = generateId()
  const createdAt = new Date().toISOString()

  await PublicationSpeciale.create({ id, numero, titre, date_publication, status: 'brouillon', createdAt })

  try {
    await createPublicationSpecialePage(numero)
  } catch (err) {
    await PublicationSpeciale.deleteOne({ id })
    throw err
  }

  return {
    success: true,
    id,
    numero,
    titre,
    date_publication,
    status: 'brouillon',
    createdAt,
    page: `/publications_speciales/${numero}`
  }
})
