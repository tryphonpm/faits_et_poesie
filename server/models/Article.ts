import { defineMongooseModel } from '#nuxt/mongoose'

export const Article = defineMongooseModel({
  name: 'Article',
  schema: {
    id: { type: String, required: true, unique: true },
    titre: { type: String, required: true },
    sousTitre: { type: String, default: '' },
    article: { type: String, default: '' },
    description: { type: String, default: '' },
    categorie: { type: String, default: '' },
    visuel: { type: String, default: '' },
    createdAt: { type: String, required: true }
  },
  options: {
    collection: 'articles'
  }
})
