export default defineEventHandler(async () => {
  const publications = await PublicationSpeciale.find()
    .sort({ numero: -1 })
    .lean()

  return publications.map((p) => ({
    id: p.id,
    numero: p.numero,
    titre: p.titre ?? '',
    date_publication: p.date_publication ?? null,
    status: p.status ?? 'brouillon',
    createdAt: p.createdAt ?? null
  }))
})
