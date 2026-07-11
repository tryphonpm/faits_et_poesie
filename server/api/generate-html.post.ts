import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export default defineEventHandler(async () => {
  try {
    const { stdout, stderr } = await execAsync('nuxt generate', {
      cwd: process.cwd(),
      timeout: 10 * 60 * 1000
    })
    return { success: true, output: stdout + (stderr ? `\nSTDERR:\n${stderr}` : '') }
  } catch (err: any) {
    const detail = [
      err?.message,
      err?.stdout ? `STDOUT:\n${err.stdout}` : '',
      err?.stderr ? `STDERR:\n${err.stderr}` : ''
    ].filter(Boolean).join('\n\n')
    throw createError({ statusCode: 500, message: detail || 'Échec du build Nuxt' })
  }
})
