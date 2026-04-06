# Security game plan for user-created slide deck uploads

## Executive summary


> **April 2026 update:** The active execution plan for Pro tier items 1-6 is documented in `docs/PRO-TIER-IMPLEMENTATION.md` (open-source deck creation, external hosting, linked telemetry, analytics dashboards, and live services without user code hosting).

Your core concern is valid: if SlideNerds accepts arbitrary Next.js projects and hosts them directly, the platform effectively becomes a multi-tenant application host with all the associated abuse, security, legal, and operational risk.

Based on the current architecture and threat profile, the recommended near-term strategy is:

1. **Do not host user code or uploaded app bundles on SlideNerds domains.**
2. **Require user-managed deployment** (Vercel/Netlify/Cloudflare/etc.) and only register deck URLs in SlideNerds.
3. **Monetize premium collaboration, analytics, access controls, and live presentation capabilities** rather than hosting itself.

This keeps SlideNerds focused on product differentiation while avoiding the highest-risk attack classes.

## What the current security spec already gets right

`docs/SECURITY-SANDBOX.md` makes a strong default decision: no user code hosting. This already removes entire categories of risk:

- Server-side remote code execution on SlideNerds infrastructure
- Escape/isolation complexity from untrusted builds/runtime
- Free hosting abuse (phishing, malware landing pages, crypto mining)
- Reputation damage from malicious content on first-party subdomains
- Significant trust & safety / legal moderation burden

The spec also correctly recognizes that safe hosting requires a separate domain boundary, scanning, limits, trust tiers, and abuse operations.

## Threat model for your specific concern

### Assets to protect

- SlideNerds production infrastructure and secrets
- Customer data (accounts, workspace metadata, analytics)
- Domain reputation and email deliverability
- Payment rails and anti-fraud posture
- Brand trust and enterprise adoption potential

### Adversaries

- Opportunistic abusers seeking free hosting
- Phishing operators using your domain reputation
- Credential harvesters embedding deceptive forms
- Malware distributors and crypto miners
- Curious/malicious users attempting sandbox escape

### Highest-risk attack paths if you host uploads

1. **Malicious static payloads** (phishing pages, wallet drain scripts, fake auth prompts)
2. **Dependency-based abuse** from uploaded app bundles
3. **Origin trust abuse** ("hosted on slidenerds domain" social proof)
4. **Exploit chaining** through browser/runtime vulnerabilities
5. **Resource exhaustion** via oversized assets, bot traffic amplification, and hotlinking
6. **Compliance/legal takedown load** from user-generated hosted content

## Option analysis

### Option A (recommended now): registry-only model (no hosting)

**Model:** User deploys deck externally; SlideNerds stores metadata and provides overlays/features.

**Pros**
- Best risk reduction per engineering hour
- Minimal trust & safety burden
- Faster roadmap execution on differentiated value
- Easier enterprise security narrative

**Cons**
- Less "one-click" onboarding
- Dependency on external hosts for uptime/deploy UX

**Bottom line:** best fit for current stage.

### Option B: static upload hosting with heavy controls

**Model:** Accept prebuilt static exports and host on isolated content domain.

**Pros**
- Better user convenience
- Possible upsell path for managed hosting

**Cons**
- Requires significant security platform investment
- Ongoing abuse review operations
- Higher legal/compliance overhead

**Bottom line:** feasible later, but not now unless there is validated demand and staffing.

### Option C: full Next.js app hosting

**Model:** Accept source/projects and run build/runtime on your infra.

**Pros**
- Maximum convenience for creators

**Cons**
- Highest security and operational risk
- Expensive isolation architecture (microVM/container hardening)
- Competes with mature hosting providers on their strongest axis

**Bottom line:** avoid.

## Recommended strategy and decision criteria

## Strategic decision (next 12 months)

Adopt **Option A** as official policy:

- No code upload to SlideNerds
- `slidenerds link --url` required
- `slidenerds push` syncs metadata/config only
- Exports and live features operate on registered external URLs

## Revisit trigger (only revisit hosting if all are true)

- ≥30% of lost deals explicitly cite no-managed-hosting as blocker
- You have budget for security platform + trust/safety operations
- You can staff on-call for abuse response
- You can launch on isolated domain, never primary app domain

## Security control plan by horizon

### Phase 0: lock the boundary (0-30 days)

1. **Product/UX clarity**
   - Explicitly message "SlideNerds does not host your code" in CLI and dashboard
   - Explain why: safety, ownership, and flexibility

2. **Policy hardening**
   - Update docs/terms to prohibit uploading executable app bundles
   - Clarify acceptable use for registered URLs and live features

3. **URL registration validation**
   - Enforce HTTPS-only URLs
   - Block localhost/private network/link-local targets
   - Verify ownership via token/DNS/HTML challenge

4. **Secure data model**
   - Treat registered deck URLs as untrusted input
   - Store normalized, canonicalized URL forms

### Phase 1: protect "registry + overlay" model (30-90 days)

1. **Outbound fetch hardening (for analytics/export)**
   - SSRF protections on all fetch/render workers
   - Deny internal IP ranges and metadata endpoints
   - Egress allow/deny policy with strict timeouts and size caps

2. **Render/export isolation**
   - Run Puppeteer export jobs in isolated workers with no secret access
   - Use one-time scoped tokens for job communication

3. **Abuse controls for shared links/live sessions**
   - Rate limits by IP, user, workspace, and deck
   - Bot mitigation and anomaly detection for traffic spikes

4. **Tenant isolation and auth**
   - Strong workspace scoping in every API query
   - Security tests for IDOR/missing authorization paths

### Phase 2: enterprise-grade trust posture (90-180 days)

1. **Security governance**
   - STRIDE-based threat model reviews per major feature
   - Security checklist in PR template and release gates

2. **Monitoring and response**
   - Centralized audit logs for sensitive operations
   - Detection rules for suspicious deck URL changes and token abuse
   - Incident runbooks for abuse, data exposure, and account takeover

3. **Third-party risk posture**
   - Vendor risk review for analytics, storage, and auth providers
   - Secret rotation cadence and least-privilege IAM

## Monetization game plan without hosting user code

If hosting is off the table, monetize the control plane around decks:

1. **Team and governance tiers**
   - SSO/SAML, workspace roles, audit logs, domain restrictions

2. **Advanced sharing controls**
   - Expiring links, domain allowlists, watermarking, download controls

3. **Presentation intelligence**
   - Slide-level engagement analytics, audience funnels, CTA conversion tracking

4. **Live presentation suite**
   - Polling, Q&A moderation, reactions, attendee segmentation, CRM export

5. **Premium export pipeline**
   - Branded PDF/PPTX themes, batch exports, scheduled snapshots

6. **Brand/workflow management**
   - Shared brand systems, template libraries, CLI automation for large teams

This monetization strategy aligns with your highest-value capabilities and avoids commodity hosting economics.

## If you eventually pilot uploads, use a strict "static-only" beta

Only proceed behind feature flag and paid beta constraints:

- Accept zip of static export only; reject source repos/build configs
- Serve exclusively from separate content domain on PSL
- Per-upload scanning, per-tenant quotas, and hard bandwidth limits
- Automated takedown + abuse reporting workflow before GA
- Manual review queue for high-risk patterns

If you cannot fund the above controls, do not launch upload hosting.

## Decision matrix (practical)

- **Need fastest safe path to growth?** choose registry-only.
- **Need convenience for select enterprise users?** offer managed onboarding guides to deploy on Vercel/Netlify, not hosting.
- **Need managed hosting revenue?** run a constrained static-only beta with explicit abuse budget.

## Immediate next actions (concrete)

1. Update public positioning to "deploy anywhere, control everything in SlideNerds".
2. Add deck URL ownership verification to `slidenerds link` flow.
3. Implement SSRF-safe fetch layer for export and metadata probes.
4. Add abuse/rate limits to share and live APIs.
5. Define monetization packaging around analytics/sharing/live features.
6. Add a quarterly checkpoint to evaluate whether hosting demand justifies risk.

## Final recommendation

Your instinct is correct: **do not accept arbitrary app uploads now**. Keep SlideNerds as the secure control plane for deck governance, sharing, analytics, and live experiences, while users host code on specialized providers. Revisit managed static hosting only after demand and operational readiness are both clearly demonstrated.
