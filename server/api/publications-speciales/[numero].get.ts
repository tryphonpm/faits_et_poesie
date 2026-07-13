import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const numero = Number(getRouterParam(event, 'numero'))
  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Numéro invalide.' })
  }

  const publication = await PublicationSpeciale.findOne({ numero }).lean()
  if (!publication) {
    throw createError({ statusCode: 404, message: `Publication spéciale n°${numero} introuvable.` })
  }

  return {
    id: publication.id,
    numero: publication.numero,
    titre: publication.titre ?? '',
    date_publication: publication.date_publication ?? '',
    status: publication.status ?? 'brouillon',
    createdAt: publication.createdAt ?? null
  }
})
