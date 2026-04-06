import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const MAIN_HOSTS = ['localhost', 'slidenerds.com', 'www.slidenerds.com']

const LIVE_API_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/live')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: LIVE_API_CORS })
    }

    const response = NextResponse.next()
    for (const [key, value] of Object.entries(LIVE_API_CORS)) {
      response.headers.set(key, value)
    }
    return response
  }

  const hostname = request.headers.get('host')?.split(':')[0] ?? ''

  if (!MAIN_HOSTS.includes(hostname) && !hostname.endsWith('.vercel.app')) {
    const url = request.nextUrl.clone()
    url.pathname = `/api/custom-domain-resolve`
    url.searchParams.set('domain', hostname)
    url.searchParams.set('path', pathname)
    return NextResponse.rewrite(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
