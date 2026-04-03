import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TEMPLATES_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'templates',
)

export const getTemplatePath = (...segments: string[]): string => {
  return path.join(TEMPLATES_ROOT, ...segments)
}
