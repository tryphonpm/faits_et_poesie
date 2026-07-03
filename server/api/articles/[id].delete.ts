import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID manquant' })

  const result = await Article.deleteOne({ id })
  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: `Article "${id}" introuvable` })
  }

  return { success: true, id }
})
