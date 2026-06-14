import { useQuery } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import type { ScriptureState } from '@/types/bookmarks'

export function useScriptureState(scripture: string, chapter: number): ScriptureState | undefined {
  const { isSignedIn } = useScriptureAuth()

  const { data } = useQuery<ScriptureState>({
    queryKey: ['scripture-state', scripture, chapter],
    queryFn: () => meApi.getScriptureState(scripture, chapter),
    enabled: isSignedIn && chapter > 0,
    staleTime: 30_000,
  })

  return data
}
