import { describe, expect, it } from 'vitest'

// safe-url lives in packages/shared (@/lib/safe-url); the test is colocated in
// apps/web because that is where the vitest project scans, and web is the app
// that both authors links (editor) and renders them (blog).
import { sanitizeUrl } from '@/lib/safe-url'

describe('sanitizeUrl', () => {
  it('accepts safe absolute schemes unchanged', () => {
    expect(sanitizeUrl('https://example.com/a?b=1#c')).toBe('https://example.com/a?b=1#c')
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    expect(sanitizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(sanitizeUrl('tel:+15551234')).toBe('tel:+15551234')
  })

  it('accepts relative, root, query and fragment URLs', () => {
    expect(sanitizeUrl('/blog/post')).toBe('/blog/post')
    expect(sanitizeUrl('post')).toBe('post')
    expect(sanitizeUrl('#footnote')).toBe('#footnote')
    expect(sanitizeUrl('?q=1')).toBe('?q=1')
  })

  it('rejects javascript: and other dangerous schemes', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('JavaScript:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('data:text/html,<script>')).toBeUndefined()
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeUndefined()
    expect(sanitizeUrl('file:///etc/passwd')).toBeUndefined()
  })

  it('sees through whitespace and control-character obfuscation', () => {
    expect(sanitizeUrl('  javascript:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('java\tscript:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('java script:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('java\nscript:alert(1)')).toBeUndefined()
  })

  it('returns undefined for empty or whitespace-only input', () => {
    expect(sanitizeUrl('')).toBeUndefined()
    expect(sanitizeUrl(null)).toBeUndefined()
    expect(sanitizeUrl(undefined)).toBeUndefined()
    expect(sanitizeUrl('   ')).toBeUndefined()
  })
})
