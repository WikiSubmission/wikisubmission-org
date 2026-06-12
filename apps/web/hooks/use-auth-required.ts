'use client'

import { useUser } from './use-user'
import { useSignInPromptStore } from '@/store/sign-in-prompt'

export function useAuthRequired() {
  const { isAuthenticated } = useUser()
  const open = useSignInPromptStore((s) => s.open)

  return function withAuth<T extends unknown[]>(
    action: (...args: T) => void,
  ): (...args: T) => void {
    return (...args: T) => {
      if (!isAuthenticated) {
        open()
        return
      }
      action(...args)
    }
  }
}
