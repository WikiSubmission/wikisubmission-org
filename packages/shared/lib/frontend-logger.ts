'use client'

import { isDebugSite } from './runtime-env'

type FrontendEventName = 'path_accessed' | 'sort_changed'

type FrontendEventPayload = {
  event: FrontendEventName
  timestamp: string
  pathname: string
} & Record<string, unknown>

/**
 * Navigation breadcrumbs for eyeballing a release. Staging and dev only, so
 * production visitors get a clean console and the payload is never even built
 * there.
 */
export function logFrontendEvent(
  event: FrontendEventName,
  pathname: string,
  details: Record<string, unknown> = {}
) {
  if (!isDebugSite()) return

  const payload: FrontendEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    pathname,
    ...details,
  }

  console.info('[frontend-log]', payload)
}
