import { access, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError } from 'h3'

function sanitizeCommentText(value: string) {
  return value.replace(/--/g, '–').replace(/\r?\n/g, ' ').trim()
}

export async function appendArticleToPublicationPage(
  numero: number,
  titre: string,
  id: string,
  options?: { special?: boolean }
) {
  const folder = options?.special ? 'publications_speciales' : 'publications'
  const routePrefix = options?.special ? '/publications_speciales' : '/publications'
  const pagePath = join(process.cwd(), 'app', 'pages', folder, `${numero}.vue`)

  try {
    await access(pagePath)
  } catch {
    throw createError({
      statusCode: 404,
      message: `La page ${routePrefix}/${numero} n'existe pas. Créez d'abord la publication.`
    })
  }

  let content = await readFile(pagePath, 'utf-8')

  if (content.includes(`id="${id}"`)) {
    return
  }

  if (!content.includes('</template>')) {
    throw createError({ statusCode: 500, message: 'Format de page publication invalide.' })
  }

  const snippet = `\n  <!-- ${sanitizeCommentText(titre)} -->\n  <Article id="${id}"/>\n`
  content = content.replace('</template>', `${snippet}</template>`)
  await writeFile(pagePath, content, 'utf-8')
}
