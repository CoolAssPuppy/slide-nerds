import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'

const TelemetryTokenPayloadSchema = z.object({
  v: z.literal(1),
  deckId: z.string().min(1),
  ownerId: z.string().min(1),
  iat: z.number().int(),
  exp: z.number().int(),
})

type TelemetryTokenPayload = z.infer<typeof TelemetryTokenPayloadSchema>

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365
const TOKEN_PREFIX = 'sn_tlm_'

const encodeBase64Url = (value: string): string => {
  return Buffer.from(value, 'utf8').toString('base64url')
}

const decodeBase64Url = (value: string): string => {
  return Buffer.from(value, 'base64url').toString('utf8')
}

const sign = (input: string, secret: string): string => {
  return createHmac('sha256', secret).update(input).digest('base64url')
}

const secureCompare = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export const createTelemetryToken = (
  deckId: string,
  ownerId: string,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string => {
  const now = Math.floor(Date.now() / 1000)
  const payload: TelemetryTokenPayload = {
    v: 1,
    deckId,
    ownerId,
    iat: now,
    exp: now + ttlSeconds,
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload, secret)

  return `${TOKEN_PREFIX}${encodedPayload}.${signature}`
}

export const verifyTelemetryToken = (
  token: string,
  secret: string,
): TelemetryTokenPayload | null => {
  if (!token.startsWith(TOKEN_PREFIX)) return null

  const tokenBody = token.slice(TOKEN_PREFIX.length)
  const [encodedPayload, signature] = tokenBody.split('.')
  if (!encodedPayload || !signature) return null

  const expectedSignature = sign(encodedPayload, secret)
  if (!secureCompare(signature, expectedSignature)) return null

  let payload: TelemetryTokenPayload
  try {
    const raw = JSON.parse(decodeBase64Url(encodedPayload))
    payload = TelemetryTokenPayloadSchema.parse(raw)
  } catch {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp <= now) return null

  return payload
}

export const getTelemetrySecret = (): string => {
  const secret = process.env.SLIDENERDS_TELEMETRY_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('Missing SLIDENERDS_TELEMETRY_SECRET (or NEXTAUTH_SECRET fallback)')
  }
  return secret
}
