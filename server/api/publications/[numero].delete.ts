import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const numero = Number(getRouterParam(event, 'numero'))
  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Numéro de bulletin invalide.' })
  }

  const result = await Publication.deleteOne({ numero })
  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: `Publication n°${numero} introuvable.` })
  }

  return { success: true, numero }
})
