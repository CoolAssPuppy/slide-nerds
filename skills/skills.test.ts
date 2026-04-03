import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const SKILLS_DIR = path.resolve(__dirname)

const REQUIRED_FRONTMATTER_FIELDS = ['name', 'description'] as const

const parseSkillFrontmatter = (content: string): Record<string, string> | null => {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null

  const frontmatter: Record<string, string> = {}
  const lines = match[1].split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()
    frontmatter[key] = value
  }

  return frontmatter
}

const getSkillDirectories = (): string[] => {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

describe('Skill library validation', () => {
  const skillDirs = getSkillDirectories()

  it('should have at least 9 skills', () => {
    expect(skillDirs.length).toBeGreaterThanOrEqual(9)
  })

  for (const skillDir of skillDirs) {
    describe(`skills/${skillDir}`, () => {
      const skillPath = path.join(SKILLS_DIR, skillDir, 'SKILL.md')

      it('should have a SKILL.md file', () => {
        expect(fs.existsSync(skillPath)).toBe(true)
      })

      it('should have valid YAML frontmatter with required fields', () => {
        const content = fs.readFileSync(skillPath, 'utf-8')
        const frontmatter = parseSkillFrontmatter(content)

        expect(frontmatter).not.toBeNull()

        for (const field of REQUIRED_FRONTMATTER_FIELDS) {
          expect(frontmatter).toHaveProperty(field)
          expect(frontmatter![field].length).toBeGreaterThan(0)
        }
      })

      it('should have name matching directory name', () => {
        const content = fs.readFileSync(skillPath, 'utf-8')
        const frontmatter = parseSkillFrontmatter(content)

        expect(frontmatter!.name).toBe(skillDir)
      })

      it('should have meaningful content after frontmatter', () => {
        const content = fs.readFileSync(skillPath, 'utf-8')
        const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n\n([\s\S]+)/)

        expect(bodyMatch).not.toBeNull()
        expect(bodyMatch![1].trim().length).toBeGreaterThan(100)
      })
    })
  }
})
