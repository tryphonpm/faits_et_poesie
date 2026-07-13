import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const numero = Number(getRouterParam(event, 'numero'))
  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Numéro invalide.' })
  }

  const existing = await PublicationSpeciale.findOne({ numero })
  if (!existing) {
    throw createError({ statusCode: 404, message: `Publication spéciale n°${numero} introuvable.` })
  }

  await PublicationSpeciale.deleteOne({ numero })

  return { success: true, numero }
})
