import { createHash } from 'node:crypto'

export function getVoterHash(request: Request, ...components: string[]): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return createHash('sha256')
    .update(ip + ':' + components.join(':'))
    .digest('hex')
    .slice(0, 32)
}
