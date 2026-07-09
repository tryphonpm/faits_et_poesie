import { publicationDateFromCreatedAt } from '../../utils/publicationDate'

export default defineEventHandler(async () => {
  await Publication.updateMany(
    { $or: [{ status: { $exists: false } }, { status: '' }] },
    { $set: { status: 'brouillon' } }
  )

  const publications = await Publication.find()
    .select('numero date_publication status createdAt')
    .sort({ numero: -1 })
    .lean()

  await Promise.all(
    publications
      .filter((publication) => !publication.date_publication && publication.createdAt)
      .map((publication) => {
        const date_publication = publicationDateFromCreatedAt(publication.createdAt)
        publication.date_publication = date_publication
        return Publication.updateOne({ numero: publication.numero }, { date_publication })
      })
  )

  return publications
})
