/**
 * Server-side me-api for use in Server Components only.
 * Creates a per-request client with the caller's bearer token.
 * Never import in Client Components.
 */
import createClient from 'openapi-fetch'
import type { paths, components } from './types.gen'
import { resolveServerApiBaseUrl } from './base-url'

type Scripture = components['parameters']['MeScriptureParam']

const baseUrl = resolveServerApiBaseUrl()

function toScripture(s: string): Scripture {
  return s === 'bible' ? 'bible' : 'quran'
}

async function unwrap<T>(
  p: Promise<{ data?: T; error?: unknown; response: Response }>
): Promise<T> {
  const { data, error, response } = await p
  if (error || !response.ok || data === undefined) {
    throw new Error(`API ${response.status}`)
  }
  return data
}

export function meApiServer(token: string) {
  const authedFetch: typeof globalThis.fetch = (url, init) =>
    globalThis.fetch(url, {
      ...init,
      headers: {
        ...(init?.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    } as RequestInit)

  const client = createClient<paths>({ baseUrl, fetch: authedFetch })

  return {
    getStreak: (scripture: string) =>
      unwrap(
        client.GET('/me/streak', {
          params: { query: { scripture: toScripture(scripture) } },
        })
      ),

    getCoverToCover: (scripture: string) =>
      unwrap(
        client.GET('/me/cover-to-cover', {
          params: { query: { scripture: toScripture(scripture) } },
        })
      ),

    listBookmarkCategories: () => unwrap(client.GET('/me/bookmark-categories')),

    listCollections: () => unwrap(client.GET('/me/collections')),

    getNotes: (scripture: string) =>
      unwrap(
        client.GET('/me/notes', {
          params: { query: { scripture: toScripture(scripture) } },
        })
      ),

    getReadingStats: (
      scripture: string,
      range: '7d' | '30d' | '90d' | '1y' | 'all' = '30d',
      tz?: string,
    ) =>
      unwrap(
        client.GET('/me/reading-stats', {
          params: {
            query: {
              scripture: toScripture(scripture),
              range,
              ...(tz ? { tz } : {}),
            },
          },
        })
      ),
  }
}
