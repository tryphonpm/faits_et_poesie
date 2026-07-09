import { createError } from 'h3'
import { publicationDateFromCreatedAt } from '../../utils/publicationDate'

export default defineEventHandler(async (event) => {
  const numero = Number(getRouterParam(event, 'numero'))
  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Numéro de bulletin invalide.' })
  }

  const publication = await Publication.findOne({ numero }).select('-_id -__v').lean()
  if (!publication) {
    throw createError({ statusCode: 404, message: `Publication n°${numero} introuvable.` })
  }

  const updates: Record<string, string> = {}

  if (!publication.date_publication && publication.createdAt) {
    updates.date_publication = publicationDateFromCreatedAt(publication.createdAt)
    publication.date_publication = updates.date_publication
  }

  if (!publication.status) {
    updates.status = 'brouillon'
    publication.status = updates.status
  }

  if (Object.keys(updates).length > 0) {
    await Publication.updateOne({ numero }, updates)
  }

  return publication
})
