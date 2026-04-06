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
          res.end(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SlideNerds - Logged In</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
  }
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, rgba(62, 207, 142, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(108, 99, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  .card {
    position: relative;
    text-align: center;
    padding: 3.5rem 3rem;
    max-width: 420px;
    width: 100%;
  }
  .check {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(62, 207, 142, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 0 0 12px rgba(62, 207, 142, 0.06), 0 0 0 24px rgba(62, 207, 142, 0.03);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 12px rgba(62, 207, 142, 0.06), 0 0 0 24px rgba(62, 207, 142, 0.03); }
    50% { box-shadow: 0 0 0 16px rgba(62, 207, 142, 0.1), 0 0 0 32px rgba(62, 207, 142, 0.05); }
  }
  .check svg {
    width: 36px;
    height: 36px;
    stroke: #3ECF8E;
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  .subtitle {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.5;
    margin-bottom: 2rem;
  }
  .commands {
    text-align: left;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .commands h2 {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }
  .cmd-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .cmd-row code {
    flex: 1;
    font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .copy-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .copy-btn:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    border-color: rgba(255,255,255,0.2);
  }
  .copy-btn.copied {
    color: #3ECF8E;
    border-color: rgba(62,207,142,0.3);
  }
  .copy-btn svg { width: 14px; height: 14px; }
  .brand {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2rem;
    text-align: center;
  }
</style>
<script>
function copyCmd(btn, text) {
  navigator.clipboard.writeText(text).then(function() {
    btn.classList.add('copied');
    btn.textContent = '\u2713';
    setTimeout(function() {
      btn.classList.remove('copied');
      btn.textContent = '\u2398';
    }, 1500);
  });
}
</script>
</head>
<body>
  <div class="card">
    <div class="check">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h1>You're in</h1>
    <p class="subtitle">Your terminal is now connected to SlideNerds.<br>You can close this window.</p>

    <div class="commands">
      <h2>Try these next</h2>
      <div class="cmd-row">
        <code>slidenerds create my-talk</code>
        <button class="copy-btn" onclick="copyCmd(this,'slidenerds create my-talk')" title="Copy">\u2398</button>
      </div>
      <div class="cmd-row">
        <code>slidenerds link --name my-talk --url https://...</code>
        <button class="copy-btn" onclick="copyCmd(this,'slidenerds link --name my-talk --url ')" title="Copy">\u2398</button>
      </div>
      <div class="cmd-row">
        <code>slidenerds brand set &quot;My Brand&quot;</code>
        <button class="copy-btn" onclick="copyCmd(this,'slidenerds brand set &quot;My Brand&quot;')" title="Copy">\u2398</button>
      </div>
      <div class="cmd-row">
        <code>slidenerds export --pdf</code>
        <button class="copy-btn" onclick="copyCmd(this,'slidenerds export --pdf')" title="Copy">\u2398</button>
      </div>
    </div>

    <p class="brand">SlideNerds</p>
  </div>
</body>
</html>`)

          finish(true)
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SlideNerds - Login Failed</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .card { text-align: center; padding: 3rem; max-width: 420px; }
  h1 { font-size: 1.5rem; font-weight: 700; color: #ef4444; margin-bottom: 0.5rem; }
  p { font-size: 0.95rem; color: rgba(255,255,255,0.5); line-height: 1.5; }
</style>
</head>
<body>
  <div class="card">
    <h1>Login failed</h1>
    <p>No token was received. Please try again from your terminal.</p>
  </div>
</body>
</html>`)

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
    .option('--url <url>', 'Service URL', 'https://www.slidenerds.com')
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
