import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { getTemplatePath } from '../template-path.js'

const TEMPLATE_PLACEHOLDER = '{{PROJECT_NAME}}'

const processTemplate = (content: string, projectName: string): string => {
  return content.replaceAll(TEMPLATE_PLACEHOLDER, projectName)
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
    const destRelPath = relPath.replace(/\.tmpl$/, '')
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

export const registerCreateCommand = (program: Command): void => {
  program
    .command('create <name>')
    .description('Create a new slidenerds deck')
    .action(async (name: string) => {
      const targetDir = path.resolve(process.cwd(), name)

      if (await fs.pathExists(targetDir)) {
        console.error(`Error: Directory "${name}" already exists.`)
        process.exit(1)
      }

      console.log(`Creating slidenerds deck: ${name}`)
      const files = await scaffoldProject(name, targetDir)
      console.log(`Created ${files.length} files in ./${name}`)
      console.log('')
      console.log('Next steps:')
      console.log(`  cd ${name}`)
      console.log('  npm install')
      console.log('  npm run dev')
    })
}
