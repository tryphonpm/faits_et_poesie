export default defineEventHandler(async () => {
  const publications = await Publication.find()
    .select('numero createdAt')
    .sort({ numero: -1 })
    .lean()

  return publications
})
