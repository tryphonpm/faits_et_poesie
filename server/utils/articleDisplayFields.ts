type GetField = (name: string) => string

function clampColumns(value: number) {
  return Math.min(5, Math.max(1, value || 1))
}

export function parseArticleDisplayFields(get: GetField) {
  const layout = get('layout')
  const visuelPosition = get('visuel-position')
  const visuelAlign = get('visuel-align')
  const descriptionAlign = get('description-align')

  return {
    layout: layout === 'stack' || layout === 'float' || layout === 'columns' ? layout : 'stack',
    visuelPosition:
      visuelPosition === 'before-article' || visuelPosition === 'after-article'
        ? visuelPosition
        : 'before-article',
    visuelColonnes: clampColumns(Number(get('visuel-colonnes'))),
    visuelAlign: visuelAlign === 'left' ? 'left' as const : 'right' as const,
    nbColonnes: clampColumns(Number(get('nb-colonnes'))),
    nbRows: clampColumns(Number(get('nb-rows'))),
    titreFontSize: get('titre-font-size').trim(),
    masquerTitre: get('masquer-titre') === 'true',
    bordureGauche: get('bordure-gauche') === 'true',
    noLettrine: get('no-lettrine') === 'true',
    descriptionAlign:
      descriptionAlign === 'left' || descriptionAlign === 'center' || descriptionAlign === 'right'
        ? descriptionAlign
        : 'right' as const
  }
}

export async function saveVisuelFile(
  visuelPart: { data?: Buffer, filename?: string } | undefined
) {
  if (!visuelPart?.data || !visuelPart.filename) return ''

  const { writeFile, mkdir } = await import('node:fs/promises')
  const { join, extname } = await import('node:path')

  const ext = extname(visuelPart.filename).toLowerCase()
  const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext)
  const targetDir = join(
    process.cwd(),
    'public',
    'data',
    isVideo ? 'insertVideos' : 'visuels'
  )
  await mkdir(targetDir, { recursive: true })

  const safeName = slugify(visuelPart.filename.replace(ext, '')) + '_' + Date.now() + ext
  const dest = join(targetDir, safeName)
  await writeFile(dest, visuelPart.data)

  return isVideo ? `/data/insertVideos/${safeName}` : `/data/visuels/${safeName}`
}

function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
