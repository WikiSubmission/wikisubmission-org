'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import type { CollectionData, CollectionDetail } from '@/types/collections'

const COLLECTIONS_KEY = ['collections']

export function useCollections(): CollectionData[] {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery<{ data: CollectionData[] }>({
    queryKey: COLLECTIONS_KEY,
    queryFn: () => meApi.listCollections(),
    enabled: isSignedIn,
    staleTime: 30_000,
  })
  return data?.data ?? []
}

export function useCollectionDetail(id: number) {
  const { isSignedIn } = useScriptureAuth()
  return useQuery<{ data: CollectionDetail }>({
    queryKey: ['collection', id],
    queryFn: () => meApi.getCollection(id),
    enabled: isSignedIn && id > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useSharedCollection(token: string) {
  return useQuery<{ data: CollectionDetail }>({
    queryKey: ['shared-collection', token],
    queryFn: () => meApi.getSharedCollection(token),
    enabled: !!token,
    staleTime: 60_000,
  })
}

export function useCreateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      name: string
      description?: string
      is_public?: boolean
    }) => meApi.createCollection(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
  })
}

export function useUpdateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: number
      name: string
      description?: string
      is_public?: boolean
      edit_policy?: 'owner_only' | 'everyone'
      regenerate_token?: boolean
    }) =>
      meApi.updateCollection(vars.id, {
        name: vars.name,
        description: vars.description,
        is_public: vars.is_public,
        edit_policy: vars.edit_policy,
        regenerate_token: vars.regenerate_token,
      }),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: COLLECTIONS_KEY })
      qc.invalidateQueries({ queryKey: ['collection', id] })
    },
  })
}

export function useSubscribeCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shareToken: string) => meApi.subscribeCollection(shareToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
  })
}

export function useUnsubscribeCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (collectionId: number) =>
      meApi.unsubscribeCollection(collectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => meApi.deleteCollection(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
  })
}

export function useAddVerseToCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      collectionId: number
      scripture: string
      verseKey: string
      note?: string
    }) =>
      meApi.addVerseToCollection(vars.collectionId, {
        scripture: vars.scripture,
        verse_key: vars.verseKey,
        note: vars.note,
      }),
    onSuccess: (_res, { collectionId }) =>
      qc.invalidateQueries({ queryKey: ['collection', collectionId] }),
  })
}

export function useRemoveVerseFromCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { collectionId: number; verseId: number }) =>
      meApi.removeVerseFromCollection(vars.collectionId, vars.verseId),
    onSuccess: (_res, { collectionId }) =>
      qc.invalidateQueries({ queryKey: ['collection', collectionId] }),
  })
}
