import { defineMongooseModel } from '#nuxt/mongoose'

export const Article = defineMongooseModel({
  name: 'Article',
  schema: {
    id: { type: String, required: true, unique: true },
    numero: { type: Number, min: 1 },
    titre: { type: String, required: true },
    sousTitre: { type: String, default: '' },
    article: { type: String, default: '' },
    description: { type: String, default: '' },
    categorie: { type: String, default: '' },
    visuel: { type: String, default: '' },
    layout: { type: String, enum: ['stack', 'float', 'columns'], default: 'stack' },
    visuelPosition: { type: String, enum: ['before-article', 'after-article'], default: 'before-article' },
    visuelColonnes: { type: Number, default: 1, min: 1, max: 5 },
    visuelAlign: { type: String, enum: ['left', 'right'], default: 'right' },
    createdAt: { type: String, required: true }
  },
  options: {
    collection: 'articles'
  }
})
