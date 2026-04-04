import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)

export const getTemplatePath = (...segments: string[]): string => {
  return path.join(PACKAGE_ROOT, 'templates', ...segments)
}

export const getSkillsPath = (): string => {
  return path.join(PACKAGE_ROOT, 'skills')
}

export const getTemplatesRoot = (): string => {
  return path.join(PACKAGE_ROOT, 'templates')
}
