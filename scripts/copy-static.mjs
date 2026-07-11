/**
 * copy-static.mjs
 *
 * Réorganise le résultat de `nuxt generate` (.output/public/) vers
 * publications-html/ avec la structure :
 *
 *   publications-html/
 *     1.html        ← publication n°1
 *     2.html
 *     3.html
 *     css/          ← feuilles de style compilées (chemins réecrits)
 *     js/           ← bundles JavaScript
 *     img/          ← copie de public/data/visuels/ et insertVideos/
 *     fonts/        ← polices locales
 *
 * Usage :
 *   node scripts/copy-static.mjs
 *
 * Pré-requis : avoir lancé `npx nuxt generate` au préalable.
 */

import { readdir, readFile, writeFile, mkdir, copyFile, cp } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import { existsSync } from 'node:fs'

// ─── Chemins ────────────────────────────────────────────────────────────────

const ROOT        = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const NUXT_OUT    = join(ROOT, '.output', 'public')
const HTML_OUT    = join(ROOT, 'publications-html')
const VISUELS_SRC = join(ROOT, 'public', 'data', 'visuels')
const VIDEOS_SRC  = join(ROOT, 'public', 'data', 'insertVideos')
const FONTS_SRC   = join(ROOT, 'public', 'fonts')

// ─── Utilitaires ────────────────────────────────────────────────────────────

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function listFiles(dir, extensions = []) {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    if (!e.isFile()) continue
    if (extensions.length && !extensions.includes(extname(e.name).toLowerCase())) continue
    files.push(join(dir, e.name))
  }
  return files
}

async function copyDir(srcDir, destDir, extensions = []) {
  if (!existsSync(srcDir)) {
    console.warn(`  ⚠  Dossier source introuvable : ${srcDir}`)
    return 0
  }
  await ensureDir(destDir)
  const files = await listFiles(srcDir, extensions)
  for (const src of files) {
    await copyFile(src, join(destDir, basename(src)))
  }
  return files.length
}

// ─── Étape 1 : détecter les publications générées ───────────────────────────

async function findPublicationNums() {
  const pubDir = join(NUXT_OUT, 'publications')
  if (!existsSync(pubDir)) {
    throw new Error(
      `Dossier .output/public/publications/ introuvable.\n` +
      `Lancez d'abord : npx nuxt generate`
    )
  }
  const entries = await readdir(pubDir, { withFileTypes: true })
  const nums = entries
    .filter((e) => e.isDirectory() && /^\d+$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => Number(a) - Number(b))
  return nums
}

// ─── Étape 2 : copier les CSS et réécrire les chemins internes ──────────────

async function processCss(nuxtDir, cssDestDir) {
  await ensureDir(cssDestDir)
  const cssFiles = await listFiles(nuxtDir, ['.css'])
  const cssMap = {}

  for (const src of cssFiles) {
    const name = basename(src)
    let content = await readFile(src, 'utf-8')

    // Polices locales : /fonts/ → ../fonts/ (relatif depuis css/)
    content = content.replaceAll('url(/fonts/', 'url(../fonts/')
    content = content.replaceAll("url('/fonts/", "url('../fonts/")
    content = content.replaceAll('url("/fonts/', 'url("../fonts/')

    await writeFile(join(cssDestDir, name), content, 'utf-8')
    cssMap[`/_nuxt/${name}`] = `css/${name}`
  }
  return cssMap
}

// ─── Étape 3 : copier les fichiers JS ───────────────────────────────────────

async function processJs(nuxtDir, jsDestDir) {
  await ensureDir(jsDestDir)
  const jsFiles = await listFiles(nuxtDir, ['.js'])
  const jsMap = {}

  for (const src of jsFiles) {
    const name = basename(src)
    await copyFile(src, join(jsDestDir, name))
    jsMap[`/_nuxt/${name}`] = `js/${name}`
  }
  return jsMap
}

// ─── Étape 4 : copier les visuels et vidéos ─────────────────────────────────

async function processImages(imgDestDir) {
  await ensureDir(imgDestDir)

  const imgExts   = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov']
  const allExts   = [...imgExts, ...videoExts]

  const nImg   = await copyDir(VISUELS_SRC, imgDestDir, allExts)
  const nVideo = await copyDir(VIDEOS_SRC,  imgDestDir, allExts)

  // Table de remplacement pour les chemins dans le HTML
  const imgMap = {}
  for (const dir of [VISUELS_SRC, VIDEOS_SRC]) {
    if (!existsSync(dir)) continue
    const files = await listFiles(dir, allExts)
    for (const f of files) {
      const name = basename(f)
      imgMap[`/data/visuels/${name}`]     = `img/${name}`
      imgMap[`/data/insertVideos/${name}`] = `img/${name}`
    }
  }

  return { imgMap, nImg, nVideo }
}

// ─── Étape 5 : copier les polices ───────────────────────────────────────────

async function processFonts(fontsDestDir) {
  await ensureDir(fontsDestDir)

  // Chercher d'abord dans .output/public/fonts (copié par Nuxt depuis public/)
  const nuxtFontsSrc = join(NUXT_OUT, 'fonts')
  const src = existsSync(nuxtFontsSrc) ? nuxtFontsSrc : FONTS_SRC

  if (!existsSync(src)) {
    console.warn('  ⚠  Dossier fonts/ introuvable')
    return 0
  }

  // Copie récursive (gère les sous-dossiers comme ornamenta_monumenta/)
  await cp(src, fontsDestDir, { recursive: true })
  const all = await readdir(fontsDestDir, { recursive: true })
  return all.filter((f) => f.endsWith('.ttf') || f.endsWith('.woff') || f.endsWith('.woff2')).length
}

// ─── Étape 6 : réécrire les chemins dans un fichier HTML ────────────────────

function rewritePaths(html, cssMap, jsMap, imgMap) {
  // CSS et JS : /_nuxt/xxx → css/xxx ou js/xxx
  for (const [from, to] of Object.entries({ ...cssMap, ...jsMap })) {
    html = html.replaceAll(from, to)
  }

  // Images et vidéos : /data/visuels/xxx → img/xxx
  for (const [from, to] of Object.entries(imgMap)) {
    html = html.replaceAll(from, to)
  }

  // Liens entre publications : /publications/2 → 2.html
  html = html.replace(/href="\/publications\/(\d+)\/?"/g, (_, n) => `href="${n}.html"`)

  // Lien archives
  html = html.replace(/href="\/publications\/archives\/?"/g, 'href="archives.html"')

  // Supprimer tous les attributs crossorigin pour garantir le chargement via file://
  html = html.replace(/ crossorigin(="[^"]*")?/g, '')

  // Supprimer le preload du payload JSON (inutile hors serveur)
  html = html.replace(/<link rel="preload" as="fetch"[^>]*_payload\.json[^>]*>/g, '')

  return html
}

// ─── Étape 7 : traiter chaque publication ───────────────────────────────────

async function processPublication(num, cssMap, jsMap, imgMap) {
  const srcHtml = join(NUXT_OUT, 'publications', num, 'index.html')
  if (!existsSync(srcHtml)) {
    console.warn(`  ⚠  Page introuvable : ${srcHtml}`)
    return
  }

  let html = await readFile(srcHtml, 'utf-8')
  html = rewritePaths(html, cssMap, jsMap, imgMap)

  const dest = join(HTML_OUT, `${num}.html`)
  await writeFile(dest, html, 'utf-8')
  console.log(`  ✓  ${num}.html`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📰 copy-static — génération du site HTML statique\n')

  if (!existsSync(NUXT_OUT)) {
    console.error('❌  .output/public/ introuvable. Lancez d\'abord :\n    npx nuxt generate\n')
    process.exit(1)
  }

  await ensureDir(HTML_OUT)

  const nuxtAssetDir = join(NUXT_OUT, '_nuxt')
  const cssDestDir   = join(HTML_OUT, 'css')
  const jsDestDir    = join(HTML_OUT, 'js')
  const imgDestDir   = join(HTML_OUT, 'img')
  const fontsDestDir = join(HTML_OUT, 'fonts')

  console.log('→ Traitement CSS (réécriture chemins polices)...')
  const cssMap = await processCss(nuxtAssetDir, cssDestDir)
  console.log(`  ✓  ${Object.keys(cssMap).length} fichier(s) CSS`)

  console.log('→ Traitement JS...')
  const jsMap = await processJs(nuxtAssetDir, jsDestDir)
  console.log(`  ✓  ${Object.keys(jsMap).length} fichier(s) JS`)

  console.log('→ Copie des visuels...')
  const { imgMap, nImg, nVideo } = await processImages(imgDestDir)
  console.log(`  ✓  ${nImg} image(s), ${nVideo} vidéo(s)`)

  console.log('→ Copie des polices...')
  const nFonts = await processFonts(fontsDestDir)
  console.log(`  ✓  ${nFonts} police(s)`)

  console.log('→ Génération des pages HTML...')
  const nums = await findPublicationNums()
  if (nums.length === 0) {
    console.warn('  ⚠  Aucune publication trouvée dans .output/public/publications/')
  }
  for (const num of nums) {
    await processPublication(num, cssMap, jsMap, imgMap)
  }

  console.log(`\n✅  Terminé — ${nums.length} publication(s) dans :\n    ${HTML_OUT}\n`)
}

main().catch((err) => {
  console.error('❌ Erreur :', err.message)
  process.exit(1)
})
