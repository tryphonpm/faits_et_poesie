import { readMultipartFormData, createError } from 'h3'
import { parseArticleDisplayFields, saveVisuelFile } from '../../utils/articleDisplayFields'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID manquant' })

  const existing = await Article.findOne({ id })
  if (!existing) throw createError({ statusCode: 404, message: `Article "${id}" introuvable` })

  const parts = await readMultipartFormData(event)
  if (!parts) throw createError({ statusCode: 400, message: 'Formulaire vide' })

  const get = (name: string) =>
    parts.find((p) => p.name === name)?.data.toString('utf-8') ?? ''

  const titre = get('titre')
  const sousTitre = get('sous-titre')
  const article = get('article')
  const description = get('description')
  const categorie = get('categorie')
  const supprimerVisuel = get('supprimer-visuel') === 'true'
  const visuelPart = parts.find((p) => p.name === 'visuel' && p.filename)

  if (!titre.trim()) throw createError({ statusCode: 400, message: 'Le titre est obligatoire' })

  const numero = Number(get('numero'))
  if (!Number.isInteger(numero) || numero < 1) {
    throw createError({ statusCode: 400, message: 'Le numéro de bulletin est obligatoire (entier ≥ 1).' })
  }

  const publicationSpecialeField = parts.find((p) => p.name === 'publication-speciale')
  const publicationSpeciale = publicationSpecialeField
    ? publicationSpecialeField.data.toString('utf-8') === 'true'
    : existing.publicationSpeciale

  let visuelPath = existing.visuel

  if (visuelPart?.data && visuelPart.filename) {
    visuelPath = await saveVisuelFile(visuelPart, numero)
  } else if (supprimerVisuel) {
    visuelPath = ''
  }

  const display = parseArticleDisplayFields(get)

  existing.titre = titre
  existing.numero = numero
  existing.publicationSpeciale = publicationSpeciale
  existing.sousTitre = sousTitre
  existing.article = article
  existing.description = description
  existing.categorie = categorie
  existing.visuel = visuelPath
  existing.layout = display.layout
  existing.visuelPosition = display.visuelPosition
  existing.visuelColonnes = display.visuelColonnes
  existing.visuelAlign = display.visuelAlign
  existing.nbColonnes = display.nbColonnes
  existing.nbRows = display.nbRows
  existing.titreFontSize = display.titreFontSize
  existing.masquerTitre = display.masquerTitre
  existing.bordureGauche = display.bordureGauche
  existing.noLettrine = display.noLettrine
  existing.visuelBgBlack = display.visuelBgBlack
  existing.visuelGrayscale = display.visuelGrayscale
  existing.masquerBordureVisuel = display.masquerBordureVisuel
  existing.encadre = display.encadre
  existing.masquerBordureBas = display.masquerBordureBas
  existing.descriptionAlign = display.descriptionAlign
  existing.titreAlign = display.titreAlign

  await existing.save()

  return { success: true, id, visuel: visuelPath }
})
