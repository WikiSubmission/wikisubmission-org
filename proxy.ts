import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Proxy for the Quran section
    // Force rewrites the URL to avoid complications at client side
    if (pathname.startsWith('/quran') && searchParams.has('q')) {
        const query = searchParams.get('q');
        const tab = searchParams.get('tab');

        if (query) {
            // Clone URL
            const url = request.nextUrl.clone();

            // Set path
            url.pathname = `/quran/${query}`;

            // Clear search params
            url.search = '';

            // Set search param, if provided: `tab`
            if (tab) {
                url.searchParams.set('tab', tab);
            }

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
