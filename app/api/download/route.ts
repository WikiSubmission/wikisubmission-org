import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const filename = searchParams.get('filename');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch file from source: ${response.statusText}`, { status: response.status });
        }

        const data = await response.arrayBuffer();
        const contentType = response.headers.get('Content-Type') || 'audio/mpeg';

        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename || 'download.mp3'}"`,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
