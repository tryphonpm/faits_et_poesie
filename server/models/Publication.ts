import { defineMongooseModel } from '#nuxt/mongoose'

export const Publication = defineMongooseModel({
  name: 'Publication',
  schema: {
    numero: { type: Number, required: true, unique: true },
    createdAt: { type: String, required: true }
  },
  options: {
    collection: 'publications'
  }
})
