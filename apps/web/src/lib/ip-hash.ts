import { createHash } from 'node:crypto'

const extractIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

export const getIpHash = (request: Request, length = 32): string => {
  return createHash('sha256')
    .update(extractIp(request))
    .digest('hex')
    .slice(0, length)
}

export function getVoterHash(request: Request, ...components: string[]): string {
  return createHash('sha256')
    .update(extractIp(request) + ':' + components.join(':'))
    .digest('hex')
    .slice(0, 32)
}
