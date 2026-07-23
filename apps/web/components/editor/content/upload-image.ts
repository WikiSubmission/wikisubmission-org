'use client'

/**
 * Client helper: uploads an image through the same-origin route handler
 * (/api/editorial/upload), which attaches the editor's bearer token
 * server-side and forwards to ws-backend. Returns the public CDN URL.
 */
export async function uploadEditorialImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch('/api/editorial/upload', { method: 'POST', body: form })
  if (!res.ok) {
    let message = 'Image upload failed.'
    try {
      const body = (await res.json()) as { message?: string }
      if (body?.message) message = body.message
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new Error(message)
  }

  const body = (await res.json()) as { url?: string }
  if (!body?.url) throw new Error('Upload returned no URL.')
  return body.url
}
