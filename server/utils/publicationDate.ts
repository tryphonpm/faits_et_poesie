export function publicationDateFromCreatedAt(createdAt?: string | null) {
  if (!createdAt) return ''
  return createdAt.slice(0, 10)
}

export function normalizePublicationDate(value: unknown) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return ''
  return trimmed
}

export function formatPublicationDateFr(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}
