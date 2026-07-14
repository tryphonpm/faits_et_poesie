import { access, readFile, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, readBody } from 'h3'
import { normalizePublicationDate } from '../../utils/publicationDate'

function extractArticleIds(content: string): string[] {
  return [...content.matchAll(/<Article\s+id="([^"]+)"/g)].map((match) => match[1])
}

async function syncSpecialPublicationArticles(oldNumero: number, newNumero: number) {
  const pagePath = join(process.cwd(), 'app', 'pages', 'publications_speciales', `${newNumero}.vue`)
  let articleIds: string[] = []

  try {
    const content = await readFile(pagePath, 'utf-8')
    articleIds = extractArticleIds(content)
  } catch {
    // La page peut être absente si la publication vient d'être créée.
  }

  if (oldNumero !== newNumero) {
    await Article.updateMany(
      { numero: oldNumero, publicationSpeciale: true },
      { $set: { numero: newNumero, publicationSpeciale: true } }
    )
  }

  if (articleIds.length > 0) {
    await Article.updateMany(
      { id: { $in: articleIds } },
      { $set: { numero: newNumero, publicationSpeciale: true } }
    )
  }
}

async function renamePublicationSpecialePage(oldNumero: number, newNumero: number) {
  const pagesDir = join(process.cwd(), 'app', 'pages', 'publications_speciales')
  const oldPath = join(pagesDir, `${oldNumero}.vue`)
  const newPath = join(pagesDir, `${newNumero}.vue`)

  try {
    await access(oldPath)
  } catch {
    return
  }

  try {
    await access(newPath)
    throw createError({ statusCode: 409, message: `La page /publications_speciales/${newNumero} existe déjà.` })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    if (!(err instanceof Error) || (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw createError({ statusCode: 500, message: 'Impossible de vérifier la page de publication spéciale.' })
    }
  }

  await rename(oldPath, newPath)
}

export default defineEventHandler(async (event) => {
  const oldNumero = Number(getRouterParam(event, 'numero'))
  if (!Number.isInteger(oldNumero) || oldNumero < 1) {
    throw createError({ statusCode: 400, message: 'Numéro invalide.' })
  }

  const body = await readBody(event)
  const newNumero = Number(body?.numero)
  const date_publication = normalizePublicationDate(body?.date_publication)

  if (!Number.isInteger(newNumero) || newNumero < 1) {
    throw createError({ statusCode: 400, message: 'Le numéro est obligatoire (entier ≥ 1).' })
  }

  if (!date_publication) {
    throw createError({ statusCode: 400, message: 'La date de publication est obligatoire (AAAA-MM-JJ).' })
  }

  const titre = String(body?.titre ?? '').trim()
  const status = body?.status === 'publié' ? 'publié' : 'brouillon'

  const existing = await PublicationSpeciale.findOne({ numero: oldNumero })
  if (!existing) {
    throw createError({ statusCode: 404, message: `Publication spéciale n°${oldNumero} introuvable.` })
  }

  if (newNumero !== oldNumero) {
    const clash = await PublicationSpeciale.findOne({ numero: newNumero })
    if (clash) {
      throw createError({ statusCode: 409, message: `La publication spéciale n°${newNumero} existe déjà.` })
    }
    await renamePublicationSpecialePage(oldNumero, newNumero)
    existing.numero = newNumero
  }

  existing.titre = titre
  existing.date_publication = date_publication
  existing.status = status
  await existing.save()

  await syncSpecialPublicationArticles(oldNumero, newNumero)

  return {
    success: true,
    numero: newNumero,
    titre,
    date_publication,
    status,
    page: `/publications_speciales/${newNumero}`
  }
})
