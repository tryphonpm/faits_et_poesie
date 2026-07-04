export default defineEventHandler(async () => {
  const articles = await Article.find()
    .select('id titre sousTitre article description categorie visuel createdAt')
    .sort({ createdAt: -1 })
    .lean()

  return articles
})
