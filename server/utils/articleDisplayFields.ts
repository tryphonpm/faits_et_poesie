import { basename, dirname, extname, join } from 'node:path'

type GetField = (name: string) => string

function clampColumns(value: number) {
  return Math.min(5, Math.max(1, value || 1))
}

export function parseArticleDisplayFields(get: GetField) {
  const layout = get('layout')
  const visuelPosition = get('visuel-position')
  const visuelAlign = get('visuel-align')
  const descriptionAlign = get('description-align')
  const titreAlign = get('titre-align')

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
    titreAlign:
      titreAlign === 'left' || titreAlign === 'center' || titreAlign === 'right'
        ? titreAlign
        : 'left' as const,
    masquerTitre: get('masquer-titre') === 'true',
    bordureGauche: get('bordure-gauche') === 'true',
    noLettrine: get('no-lettrine') === 'true',
    visuelBgBlack: get('visuel-bg-black') !== 'false',
    visuelGrayscale: get('visuel-grayscale') !== 'false',
    masquerBordureVisuel: get('masquer-bordure-visuel') === 'true',
    encadre: get('encadre') === 'true',
    masquerBordureBas: get('masquer-bordure-bas') === 'true',
    sansColonnes: get('sans-colonnes') === 'true',
    descriptionAlign:
      descriptionAlign === 'left' || descriptionAlign === 'center' || descriptionAlign === 'right'
        ? descriptionAlign
        : 'right' as const
  }
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[/\\<>:"|?*\x00-\x1f]/g, '').trim()
  return cleaned || 'visuel'
}

function normalizeVisuelChemin(chemin: string): string | null {
  let path = chemin.trim().replace(/\\/g, '/')
  path = path.replace(/^public\//, '')
  if (!path.startsWith('/')) path = `/${path}`
  if (path.includes('..')) return null
  if (!path.startsWith('/data/visuels/') && !path.startsWith('/data/insertVideos/')) return null
  return path
}

function webPathToDiskPath(webPath: string): string {
  return join(process.cwd(), 'public', webPath.replace(/^\//, ''))
}

export function resolveVisuelWebPath(
  fileName: string,
  options?: { numero?: number; publicationSpeciale?: boolean; chemin?: string }
): string {
  const hinted = options?.chemin ? normalizeVisuelChemin(options.chemin) : null
  if (hinted) return hinted

  if (options?.numero) {
    const subDir = options.publicationSpeciale
      ? `visuels/special/${options.numero}`
      : `visuels/${options.numero}`
    return `/data/${subDir}/${fileName}`
  }

  return `/data/visuels/${fileName}`
}

export async function resolveExistingVisuelChemin(chemin: string): Promise<string> {
  const { access } = await import('node:fs/promises')
  const { createError } = await import('h3')

  const webPath = normalizeVisuelChemin(chemin)
  if (!webPath) {
    throw createError({ statusCode: 400, message: 'Chemin de visuel invalide.' })
  }

  try {
    await access(webPathToDiskPath(webPath))
  } catch {
    throw createError({ statusCode: 404, message: `Visuel introuvable : ${webPath}` })
  }

  return webPath
}

export async function saveVisuelFile(
  visuelPart: { data?: Buffer, filename?: string } | undefined,
  options?: { numero?: number; publicationSpeciale?: boolean; chemin?: string }
) {
  if (!visuelPart?.data || !visuelPart.filename) return ''

  const { access, writeFile, mkdir } = await import('node:fs/promises')

  const fileName = sanitizeFilename(basename(visuelPart.filename))
  const ext = extname(fileName).toLowerCase()
  const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext)

  const webPath = isVideo
    ? `/data/insertVideos/${fileName}`
    : resolveVisuelWebPath(fileName, options)

  const diskPath = webPathToDiskPath(webPath)

  try {
    await access(diskPath)
    return webPath
  } catch {
    await mkdir(dirname(diskPath), { recursive: true })
    await writeFile(diskPath, visuelPart.data)
    return webPath
  }
}
