import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Proxy for the Quran section
    // Intercepts the URL and clears any prior param / search params
    if (pathname.startsWith('/quran') && searchParams.has('q')) {
        const query = searchParams.get('q');

        if (query) {
            // Create new URL with the query structured as a path segment
            const url = request.nextUrl.clone();
            url.pathname = `/quran/${query}`;

            // Explicitly clear all search parameters as requested
            url.search = '';

            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/quran/:path*',
    ],
}
