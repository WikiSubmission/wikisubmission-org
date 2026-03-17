/**
 * Server-side API client for use in Server Components only.
 *
 * Uses INTERNAL_API_URL when available (Railway private network) to avoid
 * going through the public internet for server-to-server calls.
 * Falls back to NEXT_PUBLIC_API_URL for local development.
 *
 * Never import this in Client Components — INTERNAL_API_URL is not exposed
 * to the browser and the import will fail at runtime.
 */
import createClient from 'openapi-fetch'
import type { paths } from './types.gen'

export const wsApiServer = createClient<paths>({
  baseUrl: process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
})
