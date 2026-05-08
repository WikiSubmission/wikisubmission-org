import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((request) => {
  const { pathname, searchParams } = request.nextUrl

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

  // Gate /me/* routes — requires an active session
  if (pathname.startsWith('/me') && !request.auth) {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
