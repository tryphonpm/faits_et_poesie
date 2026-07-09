import { defineMongooseModel } from '#nuxt/mongoose'

export const Publication = defineMongooseModel({
  name: 'Publication',
  schema: {
    numero: { type: Number, required: true, unique: true },
    date_publication: { type: String, default: '' },
    status: { type: String, default: 'brouillon' },
    createdAt: { type: String, required: true }
  },
  options: {
    collection: 'publications'
  }
})
