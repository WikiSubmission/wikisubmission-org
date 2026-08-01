import { describe, expect, it } from 'vitest'
import { UnrecognizedActionError } from 'next/dist/client/components/unrecognized-action-error'

import {
  callAdminAction,
  DEPLOY_SKEW_ERROR,
  UNREACHABLE_ERROR,
} from './call-admin-action'

describe('callAdminAction', () => {
  it('passes a successful result through untouched', async () => {
    const result = await callAdminAction(async () => ({
      ok: true as const,
      data: [1, 2],
    }))

    expect(result).toEqual({ ok: true, data: [1, 2] })
  })

  it('passes a handled failure through untouched', async () => {
    const result = await callAdminAction(async () => ({
      ok: false as const,
      error: 'User not found.',
    }))

    expect(result).toEqual({ ok: false, error: 'User not found.' })
  })

  it('reports a stale bundle when the action id is gone from the server', async () => {
    const result = await callAdminAction(async () => {
      throw new UnrecognizedActionError(
        'Server Action "40c749f418" was not found on the server.'
      )
    })

    expect(result).toEqual({ ok: false, error: DEPLOY_SKEW_ERROR })
  })

  it('reports an unreachable server for any other rejection', async () => {
    const result = await callAdminAction(async () => {
      throw new TypeError('Failed to fetch')
    })

    expect(result).toEqual({ ok: false, error: UNREACHABLE_ERROR })
  })

  it('rethrows router control-flow errors so redirects still work', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/auth/sign-in;307;',
    })

    await expect(
      callAdminAction(async () => {
        throw redirect
      })
    ).rejects.toBe(redirect)
  })
})
