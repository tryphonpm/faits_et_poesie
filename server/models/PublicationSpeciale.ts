import { defineMongooseModel } from '#nuxt/mongoose'

export const PublicationSpeciale = defineMongooseModel({
  name: 'PublicationSpeciale',
  schema: {
    id: { type: String, required: true, unique: true },
    numero: { type: Number, required: true, unique: true },
    titre: { type: String, default: '' },
    date_publication: { type: String, default: '' },
    status: { type: String, default: 'brouillon' },
    createdAt: { type: String, required: true }
  },
  options: {
    collection: 'publications_speciales'
  }
})
