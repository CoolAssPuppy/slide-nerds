import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const MAIN_HOSTS = ['localhost', 'slidenerds.com', 'www.slidenerds.com']

export const middleware = async (request: NextRequest) => {
  const hostname = request.headers.get('host')?.split(':')[0] ?? ''

  // Custom domain routing: if the hostname isn't our main domain,
  // check if it's a registered custom domain and rewrite to the viewer
  if (!MAIN_HOSTS.includes(hostname) && !hostname.endsWith('.vercel.app')) {
    // Rewrite to a special handler that looks up the custom domain
    const url = request.nextUrl.clone()
    url.pathname = `/api/custom-domain-resolve`
    url.searchParams.set('domain', hostname)
    url.searchParams.set('path', request.nextUrl.pathname)
    return NextResponse.rewrite(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
