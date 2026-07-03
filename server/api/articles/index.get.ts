export default defineEventHandler(async () => {
  const articles = await Article.find()
    .select('id titre sousTitre description visuel createdAt')
    .sort({ createdAt: -1 })
    .lean()

  return articles
})
