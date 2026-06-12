import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { ScriptureState } from '@/types/bookmarks'

export function useScriptureState(scripture: string, chapter: number): ScriptureState | undefined {
  const { data: session } = useSession()

  const { data } = useQuery<ScriptureState>({
    queryKey: ['scripture-state', scripture, chapter],
    queryFn: () => meApi.getScriptureState(scripture, chapter),
    enabled: !!session?.accessToken && chapter > 0,
    staleTime: 30_000,
  })

  return data
}
