import { Command } from 'commander'
import http from 'node:http'
import { execFile } from 'node:child_process'
import { saveCredentials, clearCredentials } from './config.js'

const findOpenPort = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer()
    server.listen(0, () => {
      const addr = server.address()
      if (addr && typeof addr === 'object') {
        const port = addr.port
        server.close(() => resolve(port))
      } else {
        reject(new Error('Could not find open port'))
      }
    })
  })
}

const openBrowser = (url: string): void => {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  execFile(cmd, [url], () => {
    // Ignore errors -- user can open manually
  })
}

export const loginFlow = async (serviceUrl: string): Promise<boolean> => {
  const port = await findOpenPort()
  const callbackUrl = `http://localhost:${port}/callback`

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.info('Login timed out.')
      server.close()
      resolve(false)
    }, 5 * 60 * 1000)

    const finish = (success: boolean) => {
      clearTimeout(timeout)
      server.close()
      resolve(success)
    }

    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${port}`)

      if (url.pathname === '/callback') {
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')

        if (accessToken) {
          await saveCredentials({
            access_token: accessToken,
            refresh_token: refreshToken ?? '',
            url: serviceUrl,
          })

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<html><body><h1>Logged in to SlideNerds</h1><p>You can close this window.</p></body></html>')

          finish(true)
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end('<html><body><h1>Login failed</h1><p>No token received.</p></body></html>')

          finish(false)
        }
      }
    })

    server.listen(port, () => {
      const loginUrl = `${serviceUrl}/cli/auth?callback=${encodeURIComponent(callbackUrl)}`
      console.info(`\nOpening browser to log in...\n`)
      console.info(`If the browser doesn't open, visit:\n${loginUrl}\n`)
      openBrowser(loginUrl)
    })
  })
}

export const registerLoginCommand = (program: Command): void => {
  program
    .command('login')
    .description('Authenticate with slidenerds.com')
    .option('--url <url>', 'Service URL', 'https://slidenerds.com')
    .action(async (options: { url: string }) => {
      const success = await loginFlow(options.url)
      if (success) {
        console.info('Logged in successfully.')
      } else {
        console.error('Login failed.')
        process.exit(1)
      }
    })

  program
    .command('logout')
    .description('Clear stored credentials')
    .action(async () => {
      await clearCredentials()
      console.info('Logged out.')
    })
}
