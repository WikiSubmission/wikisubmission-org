import { auth } from '@/auth'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

type AuthenticatedRequest = NextRequest & {
  auth?: unknown
}

type ProxyResponse = Response | Promise<Response | void> | void

export function getPublicProxyResponse(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Let Auth.js handle its own API routes (csrf, signout, callbacks) untouched.
  if (pathname.startsWith('/api/auth')) return NextResponse.next()

  if (pathname === '/privacy-policy') {
    const url = request.nextUrl.clone()
    url.pathname = '/legal/privacy-policy'
    return NextResponse.redirect(url)
  }

  if (pathname === '/terms-of-service') {
    const url = request.nextUrl.clone()
    url.pathname = '/legal/terms-of-use'
    return NextResponse.redirect(url)
  }

  // Quran URL rewriting: /quran?q=foo → /quran/foo
  if (pathname.startsWith('/quran') && searchParams.has('q')) {
    const query = searchParams.get('q')
    const tab = searchParams.get('tab')
    if (query) {
      const url = request.nextUrl.clone()
      url.pathname = `/quran/${query}`
      url.search = ''
      if (tab) url.searchParams.set('tab', tab)
      return NextResponse.redirect(url)
    }
  }

  return null
}

export function isAuthProtectedPath(pathname: string) {
  return (
    pathname === '/me' ||
    pathname.startsWith('/me/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/editor' ||
    pathname.startsWith('/editor/')
  )
}

const authProxy = auth((request: AuthenticatedRequest) => {
  if (!request.auth) {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export default function proxy(request: NextRequest, event: NextFetchEvent): ProxyResponse {
  const publicResponse = getPublicProxyResponse(request)
  if (publicResponse) return publicResponse

  if (isAuthProtectedPath(request.nextUrl.pathname)) {
    return (authProxy as unknown as (request: NextRequest, event: NextFetchEvent) => ProxyResponse)(request, event)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
