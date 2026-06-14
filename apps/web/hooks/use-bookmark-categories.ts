'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import type { BookmarkCategoryData } from '@/types/bookmarks'

const CATEGORIES_KEY = ['bookmark-categories']

export function useBookmarkCategories(): BookmarkCategoryData[] {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery<{ data: BookmarkCategoryData[] }>({
    queryKey: CATEGORIES_KEY,
    queryFn: () => meApi.listBookmarkCategories(),
    enabled: isSignedIn,
    staleTime: 30_000,
  })
  return data?.data ?? []
}

export function useCreateBookmarkCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { name: string; color?: string }) =>
      meApi.createBookmarkCategory(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}

export function useUpdateBookmarkCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; name?: string; color?: string }) =>
      meApi.updateBookmarkCategory(vars.id, { name: vars.name, color: vars.color }),
    onMutate: async ({ id, name, color }) => {
      await qc.cancelQueries({ queryKey: CATEGORIES_KEY })
      const prev = qc.getQueryData<{ data: BookmarkCategoryData[] }>(CATEGORIES_KEY)
      qc.setQueryData<{ data: BookmarkCategoryData[] }>(CATEGORIES_KEY, (old) => {
        if (!old) return old
        return {
          data: old.data.map((c) =>
            c.id === id
              ? { ...c, ...(name ? { name } : {}), ...(color ? { color } : {}) }
              : c
          ),
        }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(CATEGORIES_KEY, ctx.prev)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}

export function useDeleteBookmarkCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => meApi.deleteBookmarkCategory(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CATEGORIES_KEY })
      const prev = qc.getQueryData<{ data: BookmarkCategoryData[] }>(CATEGORIES_KEY)
      qc.setQueryData<{ data: BookmarkCategoryData[] }>(CATEGORIES_KEY, (old) => {
        if (!old) return old
        return { data: old.data.filter((c) => c.id !== id) }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(CATEGORIES_KEY, ctx.prev)
    },
  })
}
