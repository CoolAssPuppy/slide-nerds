import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { getTemplatePath, getSkillsPath } from '../template-path.js'

const TEMPLATE_PLACEHOLDER = '{{PROJECT_NAME}}'

const processTemplate = (content: string, projectName: string): string => {
  return content.replaceAll(TEMPLATE_PLACEHOLDER, projectName)
}

const copySkills = async (targetDir: string): Promise<number> => {
  const skillsSource = getSkillsPath()
  const skillsDest = path.join(targetDir, '.slidenerds', 'skills')
  let count = 0

  if (!(await fs.pathExists(skillsSource))) return count

  const entries = await fs.readdir(skillsSource, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillFile = path.join(skillsSource, entry.name, 'SKILL.md')
    if (await fs.pathExists(skillFile)) {
      const destDir = path.join(skillsDest, entry.name)
      await fs.ensureDir(destDir)
      await fs.copyFile(skillFile, path.join(destDir, 'SKILL.md'))
      count++
    }
  }

  return count
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

  const skillCount = await copySkills(targetDir)

  if (skillCount > 0) {
    createdFiles.push(`.slidenerds/skills/ (${skillCount} skills)`)
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

      console.info(`Creating slidenerds deck: ${name}`)
      const files = await scaffoldProject(name, targetDir)
      const skillsDir = path.join(targetDir, '.slidenerds', 'skills')
      const skillCount = (await fs.pathExists(skillsDir))
        ? (await fs.readdir(skillsDir)).length
        : 0
      console.info(`Created ${files.length - 1} files and ${skillCount} skills in ./${name}`)
      console.info('')
      console.info('Next steps:')
      console.info(`  cd ${name}`)
      console.info('  npm install')
      console.info('  npm run dev')
    })
}
