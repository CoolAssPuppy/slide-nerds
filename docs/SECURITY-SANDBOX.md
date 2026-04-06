# Security and hosting model

## Current decision: no user code hosting

SlideNerds does not host user-uploaded code or static exports. Users deploy their decks to their own infrastructure (Vercel, Netlify, Cloudflare Pages, or any static host) and register the deployed URL with SlideNerds.

This eliminates the entire class of risks associated with hosting untrusted code:
- No server-side code execution on our infrastructure
- No container/VM breakout risk
- No crypto mining or resource abuse
- No phishing hosted on our domain
- No need for content scanning, sandboxing, or build isolation

## What SlideNerds provides (without hosting user code)

- **Deck registry:** Store metadata (name, slug, URL, description) for deployed decks
- **Analytics:** Track views via a JavaScript beacon on the user's deployed site
- **Share links:** Generate shareable URLs with access controls (email, domain, password, expiration)
- **Live presentations:** Real-time slide sync, polls, Q&A, reactions via our API
- **Brand configs:** Store and sync brand configurations
- **Team workspaces:** Shared deck management and collaboration
- **Export:** Server-side PDF/PPTX generation by rendering the user's deployed URL via Puppeteer

## How it works

```
User's infrastructure          SlideNerds service
(Vercel, Netlify, etc.)         (slidenerds.com)

  my-talk.vercel.app  ---------> Deck registered at slidenerds.com/d/my-talk
       |                               |
       |  serves HTML/CSS/JS           |  provides analytics, sharing,
       |  (user controls)              |  live features, export
       |                               |
  Viewer loads deck  ---------> Analytics beacon fires to /api/decks/{id}/analytics
       |                               |
  Live session active ---------> Polls, reactions, Q&A via /api/live/{sessionId}/*
```

## CLI workflow

```bash
slidenerds create my-talk
cd my-talk
npm install
npm run dev

# Deploy to your own host
npx vercel deploy --prod

# Register with SlideNerds
slidenerds login
slidenerds link --name my-talk --url https://my-talk.vercel.app
slidenerds push  # syncs metadata, not code
```

The `--url` flag on `slidenerds link` is required. There is no code upload.

## Why not host user code

Hosting user-uploaded HTML/JS requires solving hard problems that are outside our core value proposition:

### Problems we avoid

1. **Malicious code execution.** User-uploaded Next.js apps can contain arbitrary server-side code. Even static exports can include XSS, credential harvesting, or redirect chains. Vercel solves this with Firecracker microVMs and a dedicated security team. We would need equivalent infrastructure.

2. **Free hosting abuse.** Every free hosting service is exploited for phishing, spam, and crypto mining. Glitch, Netlify, and GitHub Pages all report significant abuse. Preventing this requires content scanning, ML-based phishing detection, abuse reporting pipelines, and dedicated trust & safety operations.

3. **Domain reputation.** Hosting malicious content on `slidenerds.com` subdomains would damage our domain reputation and get us blocklisted by email providers and security tools.

4. **Resource abuse.** User-uploaded static sites can be arbitrarily large, serve as CDNs for unrelated content, or include resource-intensive scripts.

5. **Liability.** Hosting user content creates legal exposure for DMCA, CSAM, and other content liability issues.

### What it would take to host safely

Based on industry research (Vercel, Cloudflare, Netlify):

- **Separate domain** for user content (e.g., `slidenerds-content.com`) registered on the Public Suffix List
- **Per-user random subdomains** to prevent cross-site attacks
- **Content scanning** for phishing, malware, and abuse patterns
- **Strict CSP headers** on all served content (`Content-Security-Policy: sandbox`)
- **File validation** beyond extension checks (magic bytes, content analysis)
- **Resource limits** (file count, total size, bandwidth caps)
- **Abuse reporting** pipeline with automated takedown
- **Trust tiers** (stricter limits on free accounts)

This is a significant investment in infrastructure and operations. It makes sense to defer this until/unless there is strong user demand for integrated hosting.

## Future considerations

If we decide to add hosting later, the safest approach for static slide content:

1. **Static-only hosting.** Accept only pre-built static exports (`next build && next export`). No server-side rendering, no API routes, no middleware.

2. **Content validation at upload time:**
   - Verify the upload contains `index.html` at root (already implemented)
   - Limit file count (already: max 1000)
   - Limit total size by tier (already: 50MB/200MB/500MB)
   - Scan HTML files for suspicious patterns (external form actions, credential input fields, crypto miner scripts)
   - Block uploads containing server-side files (`.js` files with Node.js APIs, `api/` directories)

3. **Serve from a separate domain** with strict CSP:
   ```
   Content-Security-Policy: default-src 'self' 'unsafe-inline' data: blob:; frame-ancestors 'self' *.slidenerds.com; form-action 'none'
   X-Content-Type-Options: nosniff
   Cross-Origin-Opener-Policy: same-origin
   ```

4. **Rate limit uploads** by account and time window.

5. **Automated abuse detection** scanning deployed content periodically.

For now, we avoid all of this complexity by not hosting user code.

## References

- [Vercel Firecracker microVMs](https://www.infoq.com/news/2025/01/vercel-hive/)
- [Cloudflare Workers security model](https://developers.cloudflare.com/workers/reference/security-model/)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Glitch phishing abuse](https://heimdalsecurity.com/blog/glitch-platform-abused-by-phishing-threat-actors/)
- [Public Suffix List](https://publicsuffix.org/)
- [Securely hosting user data (web.dev)](https://web.dev/securely-hosting-user-data/)
