'use client'

type FrontendEventName = 'path_accessed' | 'sort_changed'

type FrontendEventPayload = {
  event: FrontendEventName
  timestamp: string
  pathname: string
} & Record<string, unknown>

export function logFrontendEvent(
  event: FrontendEventName,
  pathname: string,
  details: Record<string, unknown> = {},
) {
  const payload: FrontendEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    pathname,
    ...details,
  }

  console.info('[frontend-log]', payload)
}
