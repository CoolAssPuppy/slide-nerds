import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}))

vi.mock('./config.js', () => ({
  getCredentials: vi.fn(),
  getProjectConfig: vi.fn(),
  getServiceUrl: vi.fn(),
}))

import fs from 'fs-extra'
import { execFile } from 'node:child_process'
import { Command } from 'commander'
import { getCredentials, getProjectConfig, getServiceUrl } from './config.js'
import { checkPushAccess, pushDeck, registerPushCommand } from './push.js'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const makeFetchResponse = (overrides: Partial<{ ok: boolean; status: number; json: Mock }> = {}) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({}),
  ...overrides,
})

const makeAccessOptions = (overrides: Partial<{ serviceUrl: string; accessToken: string }> = {}) => ({
  serviceUrl: 'https://www.slidenerds.com',
  accessToken: 'test-token',
  ...overrides,
})

const makePushOptions = (overrides: Partial<{
  dir: string
  deckId: string
  serviceUrl: string
  accessToken: string
  skipBuild: boolean
}> = {}) => ({
  dir: '/fake/project',
  deckId: 'deck-123',
  serviceUrl: 'https://www.slidenerds.com',
  accessToken: 'test-token',
  ...overrides,
})

const stubFetch = (...responses: ReturnType<typeof makeFetchResponse>[]) => {
  const mock = vi.fn()
  for (const response of responses) {
    mock.mockResolvedValueOnce(response)
  }
  vi.stubGlobal('fetch', mock)
  return mock
}

const stubExecFile = (handler?: (cmd: string, args: string[]) => Error | null) => {
  ;(execFile as unknown as Mock).mockImplementation(
    (_cmd: string, _args: string[], _opts: unknown, callback: (err: Error | null, stdout: string, stderr: string) => void) => {
      const error = handler ? handler(_cmd, _args) : null
      if (error) {
        callback(error, '', error.message)
      } else {
        callback(null, '', '')
      }
    },
  )
}

const stubFsForZip = () => {
  ;(fs.pathExists as Mock).mockImplementation(async (p: string) => {
    if (p.endsWith('/out')) return true
    if (p.endsWith('slidenerds-push.zip')) return false
    return false
  })
  ;(fs.readFile as Mock).mockResolvedValue(Buffer.from('fake-zip'))
  ;(fs.remove as Mock).mockResolvedValue(undefined)
}

const TS_CONFIG_WITH_EXPORT = `import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'export',
}
export default nextConfig`

const TS_CONFIG_WITHOUT_EXPORT = `import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  reactStrictMode: true,
}
export default nextConfig`

const JS_CONFIG_WITHOUT_EXPORT = `const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig`

describe('checkPushAccess', () => {
  it('returns true when push is enabled', async () => {
    const fetchMock = stubFetch(
      makeFetchResponse({ json: vi.fn().mockResolvedValue({ push_enabled: true }) }),
    )

    const result = await checkPushAccess(makeAccessOptions())

    expect(result).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith('https://www.slidenerds.com/api/cli/push-access', {
      headers: { Authorization: 'Bearer test-token' },
    })
  })

  it('returns false when push is disabled', async () => {
    stubFetch(makeFetchResponse({ json: vi.fn().mockResolvedValue({ push_enabled: false }) }))

    const result = await checkPushAccess(makeAccessOptions())

    expect(result).toBe(false)
  })

  it('returns false when push_enabled is absent from response', async () => {
    stubFetch(makeFetchResponse({ json: vi.fn().mockResolvedValue({}) }))

    const result = await checkPushAccess(makeAccessOptions())

    expect(result).toBe(false)
  })

  it('throws Unauthorized on 401 status', async () => {
    stubFetch(makeFetchResponse({ ok: false, status: 401 }))

    await expect(checkPushAccess(makeAccessOptions())).rejects.toThrow('Unauthorized')
  })

  it('throws generic error on non-401 failure', async () => {
    stubFetch(makeFetchResponse({ ok: false, status: 500 }))

    await expect(checkPushAccess(makeAccessOptions())).rejects.toThrow(
      'Unable to verify push access right now. Please try again.',
    )
  })
})

describe('pushDeck', () => {
  describe('with skipBuild', () => {
    it('uploads zip and returns version and url', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForZip()
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          json: vi.fn().mockResolvedValue({ version: 3, deck: { slug: 'my-deck' } }),
        }),
      )

      const result = await pushDeck(makePushOptions({ skipBuild: true }))

      expect(result).toEqual({ version: 3, url: 'https://www.slidenerds.com/d/my-deck' })
    })

    it('throws when out directory does not exist', async () => {
      ;(fs.pathExists as Mock).mockResolvedValue(false)

      await expect(pushDeck(makePushOptions({ skipBuild: true }))).rejects.toThrow(
        'No "out" directory found',
      )
    })

    it('falls back to deckId in url when slug is missing', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForZip()
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          json: vi.fn().mockResolvedValue({ version: 1 }),
        }),
      )

      const result = await pushDeck(makePushOptions({ skipBuild: true }))

      expect(result.url).toBe('https://www.slidenerds.com/d/deck-123')
    })

    it('throws with error message from response body on upload failure', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForZip()
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          ok: false,
          status: 400,
          json: vi.fn().mockResolvedValue({ error: 'Deck is archived' }),
        }),
      )

      await expect(pushDeck(makePushOptions({ skipBuild: true }))).rejects.toThrow('Deck is archived')
    })

    it('throws with HTTP status when response body cannot be parsed', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForZip()
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          ok: false,
          status: 502,
          json: vi.fn().mockRejectedValue(new Error('not json')),
        }),
      )

      await expect(pushDeck(makePushOptions({ skipBuild: true }))).rejects.toThrow('HTTP 502')
    })

    it('sends zip to correct endpoint with auth header', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForZip()
      stubExecFile()
      const fetchMock = stubFetch(
        makeFetchResponse({
          json: vi.fn().mockResolvedValue({ version: 1, deck: { slug: 's' } }),
        }),
      )

      await pushDeck(makePushOptions({ skipBuild: true, deckId: 'abc-99' }))

      expect(fetchMock).toHaveBeenCalledWith(
        'https://www.slidenerds.com/api/decks/abc-99/push',
        expect.objectContaining({
          method: 'POST',
          headers: { Authorization: 'Bearer test-token' },
        }),
      )
    })
  })

  describe('with build', () => {
    const stubFsForBuild = (configFileName: string, configContent: string, opts?: { outDirExists?: boolean }) => {
      const outDirExists = opts?.outDirExists ?? true
      ;(fs.pathExists as Mock).mockImplementation(async (p: string) => {
        if (p.endsWith(configFileName)) return true
        if (p.endsWith('next.config.ts') && configFileName !== 'next.config.ts') return false
        if (p.endsWith('next.config.js') && configFileName !== 'next.config.js') return false
        if (p.endsWith('next.config.mjs') && configFileName !== 'next.config.mjs') return false
        if (p.endsWith('/out')) return outDirExists
        if (p.endsWith('slidenerds-push.zip')) return false
        return false
      })
      ;(fs.readFile as Mock).mockImplementation(async (p: string, encoding?: string) => {
        if (encoding === 'utf-8') return configContent
        return Buffer.from('fake-zip')
      })
      ;(fs.writeFile as Mock).mockResolvedValue(undefined)
      ;(fs.remove as Mock).mockResolvedValue(undefined)
    }

    it('builds and uploads when config already has output export', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForBuild('next.config.ts', TS_CONFIG_WITH_EXPORT)
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          json: vi.fn().mockResolvedValue({ version: 2, deck: { slug: 'talk' } }),
        }),
      )

      const result = await pushDeck(makePushOptions())

      expect(result).toEqual({ version: 2, url: 'https://www.slidenerds.com/d/talk' })
      expect(fs.writeFile).not.toHaveBeenCalledWith(
        expect.stringContaining('next.config'),
        expect.any(String),
      )
    })

    it('patches next.config.ts to add output export when missing', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForBuild('next.config.ts', TS_CONFIG_WITHOUT_EXPORT)
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          json: vi.fn().mockResolvedValue({ version: 1, deck: { slug: 's' } }),
        }),
      )

      await pushDeck(makePushOptions())

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('next.config.ts'),
        expect.stringContaining("output: 'export'"),
      )
    })

    it('restores next.config after build even when build fails', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForBuild('next.config.ts', TS_CONFIG_WITHOUT_EXPORT)
      stubExecFile((cmd, args) => {
        if (args[0] === 'next') return new Error('Build failed')
        return null
      })

      await expect(pushDeck(makePushOptions())).rejects.toThrow('Build failed')

      const writeFileCalls = (fs.writeFile as Mock).mock.calls
      const lastWriteCall = writeFileCalls[writeFileCalls.length - 1]
      expect(lastWriteCall[0]).toContain('next.config.ts')
      expect(lastWriteCall[1]).toBe(TS_CONFIG_WITHOUT_EXPORT)
    })

    it('patches next.config.js with JS pattern when TS pattern does not match', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForBuild('next.config.js', JS_CONFIG_WITHOUT_EXPORT)
      stubExecFile()
      stubFetch(
        makeFetchResponse({
          json: vi.fn().mockResolvedValue({ version: 1, deck: { slug: 's' } }),
        }),
      )

      await pushDeck(makePushOptions())

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('next.config.js'),
        expect.stringContaining("output: 'export'"),
      )
    })

    it('throws when no next.config file exists', async () => {
      ;(fs.pathExists as Mock).mockResolvedValue(false)

      await expect(pushDeck(makePushOptions())).rejects.toThrow(
        'No next.config.ts/js/mjs found',
      )
    })

    it('throws when build does not produce out directory', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      stubFsForBuild('next.config.ts', TS_CONFIG_WITH_EXPORT, { outDirExists: false })
      stubExecFile()

      await expect(pushDeck(makePushOptions())).rejects.toThrow(
        'Build did not produce an "out" directory',
      )
    })
  })
})

describe('registerPushCommand', () => {
  const stubProcessExit = () => {
    vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit')
    }) as unknown as (code?: number) => never)
  }

  it('registers a push command on the program', () => {
    const program = new Command()

    registerPushCommand(program)

    const pushCmd = program.commands.find((c) => c.name() === 'push')
    expect(pushCmd).toBeDefined()
    expect(pushCmd?.description()).toBe('Build and upload your deck to slidenerds.com')
  })

  it('exits with 1 when project config is missing', async () => {
    stubProcessExit()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getProjectConfig).mockResolvedValue(null)
    vi.spyOn(process, 'cwd').mockReturnValue('/fake/project')

    const program = new Command()
    registerPushCommand(program)

    await expect(program.parseAsync(['node', 'test', 'push'])).rejects.toThrow('process.exit')
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not linked'))
  })

  it('exits with 1 when credentials are missing', async () => {
    stubProcessExit()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'cwd').mockReturnValue('/fake/project')
    vi.mocked(getProjectConfig).mockResolvedValue({
      deck_id: 'deck-123',
      deck_name: 'Test',
      service_url: 'https://www.slidenerds.com',
    })
    vi.mocked(getCredentials).mockResolvedValue(null)

    const program = new Command()
    registerPushCommand(program)

    await expect(program.parseAsync(['node', 'test', 'push'])).rejects.toThrow('process.exit')
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Not logged in'))
  })

  it('exits with 1 when push access is denied', async () => {
    stubProcessExit()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'cwd').mockReturnValue('/fake/project')
    vi.mocked(getProjectConfig).mockResolvedValue({
      deck_id: 'deck-123',
      deck_name: 'Test',
      service_url: 'https://www.slidenerds.com',
    })
    vi.mocked(getCredentials).mockResolvedValue({
      access_token: 'token',
      refresh_token: 'rt',
      url: 'https://www.slidenerds.com',
    })
    vi.mocked(getServiceUrl).mockResolvedValue('https://www.slidenerds.com')
    stubFetch(makeFetchResponse({ json: vi.fn().mockResolvedValue({ push_enabled: false }) }))

    const program = new Command()
    registerPushCommand(program)

    await expect(program.parseAsync(['node', 'test', 'push'])).rejects.toThrow('process.exit')
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('push not enabled'))
  })

  it('logs version and url on successful push', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(process, 'cwd').mockReturnValue('/fake/project')
    vi.mocked(getProjectConfig).mockResolvedValue({
      deck_id: 'deck-123',
      deck_name: 'Test',
      service_url: 'https://www.slidenerds.com',
    })
    vi.mocked(getCredentials).mockResolvedValue({
      access_token: 'token',
      refresh_token: 'rt',
      url: 'https://www.slidenerds.com',
    })
    vi.mocked(getServiceUrl).mockResolvedValue('https://www.slidenerds.com')
    stubFsForZip()
    stubExecFile()
    stubFetch(
      makeFetchResponse({ json: vi.fn().mockResolvedValue({ push_enabled: true }) }),
      makeFetchResponse({ json: vi.fn().mockResolvedValue({ version: 7, deck: { slug: 'my-talk' } }) }),
    )

    const program = new Command()
    registerPushCommand(program)
    await program.parseAsync(['node', 'test', 'push', '--skip-build'])

    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('version 7'))
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('my-talk'))
  })
})
