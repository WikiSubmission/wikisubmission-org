'use client'

import { useSession } from 'next-auth/react'

export interface UserState {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useUser(): UserState {
  const { data: session, status } = useSession()
  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}
