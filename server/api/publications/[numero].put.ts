import { access, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, readBody } from 'h3'
import { normalizePublicationDate } from '../../utils/publicationDate'

async function renamePublicationPage(oldNumero: number, newNumero: number) {
  const pagesDir = join(process.cwd(), 'app', 'pages', 'publications')
  const oldPath = join(pagesDir, `${oldNumero}.vue`)
  const newPath = join(pagesDir, `${newNumero}.vue`)

  try {
    await access(oldPath)
  } catch {
    return
  }

  try {
    await access(newPath)
    throw createError({ statusCode: 409, message: `La page /publications/${newNumero} existe déjà.` })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    if (!(err instanceof Error) || (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw createError({ statusCode: 500, message: 'Impossible de vérifier la page de publication.' })
    }
  }

  await rename(oldPath, newPath)
}

export default defineEventHandler(async (event) => {
  const oldNumero = Number(getRouterParam(event, 'numero'))
  if (!Number.isInteger(oldNumero) || oldNumero < 1) {
    throw createError({ statusCode: 400, message: 'Numéro de bulletin invalide.' })
  }

  const body = await readBody(event)
  const newNumero = Number(body?.numero)
  const date_publication = normalizePublicationDate(body?.date_publication)

  if (!Number.isInteger(newNumero) || newNumero < 1) {
    throw createError({ statusCode: 400, message: 'Le numéro de bulletin est obligatoire (entier ≥ 1).' })
  }

  if (!date_publication) {
    throw createError({ statusCode: 400, message: 'La date de publication est obligatoire (AAAA-MM-JJ).' })
  }

  const status = body?.status === 'publié' ? 'publié' : 'brouillon'

  const existing = await Publication.findOne({ numero: oldNumero })
  if (!existing) {
    throw createError({ statusCode: 404, message: `Publication n°${oldNumero} introuvable.` })
  }

  if (newNumero !== oldNumero) {
    const clash = await Publication.findOne({ numero: newNumero })
    if (clash) {
      throw createError({ statusCode: 409, message: `Le bulletin n°${newNumero} existe déjà.` })
    }

    await renamePublicationPage(oldNumero, newNumero)
    await Article.updateMany({ numero: oldNumero }, { numero: newNumero })
    existing.numero = newNumero
  }

  existing.date_publication = date_publication
  existing.status = status
  await existing.save()

  return {
    success: true,
    numero: newNumero,
    date_publication,
    status,
    page: `/publications/${newNumero}`
  }
})
