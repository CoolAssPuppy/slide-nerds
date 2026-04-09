import { Command } from 'commander'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'fs-extra'
import { getTemplatePath } from '../template-path.js'

const TEMPLATE_PLACEHOLDER = '{{PROJECT_NAME}}'
const UNDERSCORE_RENAME_PREFIX = '_'
const execFileAsync = promisify(execFile)

const processTemplate = (content: string, projectName: string): string => {
  return content.replaceAll(TEMPLATE_PLACEHOLDER, projectName)
}

const stripTmplExtension = (relPath: string): string => {
  return relPath.replace(/\.tmpl$/, '')
}

const renameUnderscoredDotfile = (relPath: string): string => {
  const segments = relPath.split('/')
  const last = segments[segments.length - 1]
  if (last.startsWith(UNDERSCORE_RENAME_PREFIX)) {
    segments[segments.length - 1] = `.${last.slice(UNDERSCORE_RENAME_PREFIX.length)}`
  }
  return segments.join('/')
}

export const scaffoldProject = async (
  projectName: string,
  targetDir: string,
): Promise<string[]> => {
  const templatesDir = getTemplatePath('next-app')
  const createdFiles: string[] = []

  const templateFiles = await getTemplateFiles(templatesDir)

  for (const relPath of templateFiles) {
    const srcPath = path.join(templatesDir, relPath)
    const destRelPath = renameUnderscoredDotfile(stripTmplExtension(relPath))
    const destPath = path.join(targetDir, destRelPath)

    await fs.ensureDir(path.dirname(destPath))
    const content = await fs.readFile(srcPath, 'utf-8')
    const processed = processTemplate(content, projectName)
    await fs.writeFile(destPath, processed, 'utf-8')
    createdFiles.push(destRelPath)
  }

  return createdFiles
}

const getTemplateFiles = async (dir: string, prefix = ''): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      const subFiles = await getTemplateFiles(path.join(dir, entry.name), relPath)
      files.push(...subFiles)
    } else {
      files.push(relPath)
    }
  }

  return files
}

const initializeGitRepo = async (targetDir: string): Promise<boolean> => {
  try {
    await execFileAsync('git', ['init', '--quiet'], { cwd: targetDir })
    await execFileAsync('git', ['add', '.'], { cwd: targetDir })
    await execFileAsync(
      'git',
      ['commit', '--quiet', '-m', 'Initial slidenerds scaffold'],
      { cwd: targetDir },
    )
    return true
  } catch {
    return false
  }
}

export const registerCreateCommand = (program: Command): void => {
  program
    .command('create <name>')
    .description('Create a new slidenerds deck')
    .option('--no-git', 'Skip git init and initial commit')
    .action(async (name: string, options: { git?: boolean }) => {
      const targetDir = path.resolve(process.cwd(), name)

      if (await fs.pathExists(targetDir)) {
        console.error(`Error: Directory "${name}" already exists.`)
        process.exit(1)
      }

      console.info(`Creating slidenerds deck: ${name}`)
      const files = await scaffoldProject(name, targetDir)
      console.info(`Created ${files.length} files in ./${name}`)

      if (options.git !== false) {
        const initialized = await initializeGitRepo(targetDir)
        if (initialized) {
          console.info('Initialized git repo and created initial commit.')
        }
      }

      console.info('')
      console.info('Next steps:')
      console.info(`  cd ${name}`)
      console.info('  npm install')
      console.info('  npm run dev')
    })
}
