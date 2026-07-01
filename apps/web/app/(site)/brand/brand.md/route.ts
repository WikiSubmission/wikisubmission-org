import { NextResponse } from 'next/server'
import { buildBrandMarkdown } from '@/app/(site)/brand/content'

export function GET() {
  return new NextResponse(buildBrandMarkdown(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="wikisubmission-brand.md"',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
