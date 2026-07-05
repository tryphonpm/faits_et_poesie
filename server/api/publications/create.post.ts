import { access, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, readBody } from 'h3'

async function createPublicationPage(numero: number) {
  const pagesDir = join(process.cwd(), 'app', 'pages', 'publications')
  const templatePath = join(pagesDir, 'maquettes', 'basic.vue')
  const destPath = join(pagesDir, `${numero}.vue`)

  try {
    await access(destPath)
    throw createError({ statusCode: 409, message: `La page /publications/${numero} existe déjà.` })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    if (!(err instanceof Error) || (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw createError({ statusCode: 500, message: 'Impossible de vérifier la page de publication.' })
    }
  }

  const template = await readFile(templatePath, 'utf-8')
  await writeFile(destPath, template, 'utf-8')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const numero = Number(body?.numero)

  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Le numéro de bulletin est obligatoire (entier ≥ 1).' })
  }

  const existing = await Publication.findOne({ numero }).lean()
  if (existing) {
    throw createError({ statusCode: 409, message: `Le bulletin n°${numero} existe déjà.` })
  }

  const createdAt = new Date().toISOString()
  await Publication.create({ numero, createdAt })

  try {
    await createPublicationPage(numero)
  } catch (err) {
    await Publication.deleteOne({ numero })
    throw err
  }

  return { success: true, numero, createdAt, page: `/publications/${numero}` }
})
