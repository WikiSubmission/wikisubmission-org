import { unstable_isUnrecognizedActionError } from 'next/navigation'

/**
 * Shown when the browser is running client JS from an older build than the
 * server it just posted to. Next.js bakes a content-hashed ID into each server
 * action reference at build time; after a redeploy the previous build's IDs are
 * gone from the action manifest, so the server answers the POST with
 * `x-nextjs-action-not-found: 1` and the router throws UnrecognizedActionError.
 * Nothing but a reload fixes it — the new IDs only exist in the new bundle.
 */
export const DEPLOY_SKEW_ERROR =
  'This tab is running an older version of the site. Reload the page and try again.'

export const UNREACHABLE_ERROR =
  'Could not reach the server. Check your connection and try again.'

export type FailedAction = { ok: false; error: string }

/**
 * Runs an admin server action and turns a *rejection* into the same
 * `{ ok: false, error }` shape every admin action already returns for handled
 * failures, so callers need one error path instead of two.
 *
 * Without this a deploy mid-session (or a dropped connection) rejects the
 * promise inside `startTransition`, which no call site catches: the rejection
 * lands in the console and the button is left spinning forever.
 *
 * Router control-flow errors (redirect, notFound, forbidden) travel as thrown
 * errors carrying a `NEXT_*` digest and are rethrown untouched — swallowing
 * those would break navigation.
 */
export async function callAdminAction<T extends { ok: boolean }>(
  run: () => Promise<T>
): Promise<T | FailedAction> {
  try {
    return await run()
  } catch (err) {
    if (isRouterControlFlow(err)) throw err
    if (unstable_isUnrecognizedActionError(err))
      return { ok: false, error: DEPLOY_SKEW_ERROR }
    return { ok: false, error: UNREACHABLE_ERROR }
  }
}

function isRouterControlFlow(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const digest = (err as { digest?: unknown }).digest
  return typeof digest === 'string' && digest.startsWith('NEXT_')
}
