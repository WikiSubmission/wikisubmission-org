import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'

// Authenticated image upload proxy for the content editor. Reads the session
// server-side and forwards the multipart body to ws-backend's
// POST /editorial/uploads with the bearer token, so the token never reaches the
// browser (mirrors the server-only editorial-content-client pattern).
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
  const token = session?.accessToken
  if (!token) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 })
  }

  const base = resolveServerApiBaseUrl()
  if (!base) {
    return NextResponse.json({ message: 'Uploads are not configured.' }, { status: 503 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ message: 'Expected a multipart form body.' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${base}/editorial/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json({ message: 'Upload service is unavailable.' }, { status: 502 })
  }

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}
