'use server'

import { Database } from '@/types/supabase-types'
import { supabase } from '@/lib/supabase'

export const getTracks = async () => {
  const { data, error } = await supabase()
    .from('ws_music_tracks')
    .select('*, ws_music_artists(*), ws_music_categories(*)')
    .order('release_date', { ascending: false })
  if (error) throw error
  return data
}

export const getArtists = async () => {
  const { data, error } = await supabase()
    .from('ws_music_artists')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export const getCategories = async () => {
  const { data, error } = await supabase()
    .from('ws_music_categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export const createArtist = async (name: string) => {
  const { data, error } = await supabase()
    .from('ws_music_artists')
    .insert({ name })
    .select()
  if (error) throw error
  return data[0]
}

export const createCategory = async (name: string) => {
  const { data, error } = await supabase()
    .from('ws_music_categories')
    .insert({ name })
    .select()
  if (error) throw error
  return data[0]
}

export const saveTrack = async (
  trackData:
    | Database['public']['Tables']['ws_music_tracks']['Insert']
    | Database['public']['Tables']['ws_music_tracks']['Update'],
  id?: string
) => {
  const res = id
    ? await supabase()
        .from('ws_music_tracks')
        .update(trackData)
        .eq('id', id)
        .select()
    : await supabase()
        .from('ws_music_tracks')
        .insert(
          trackData as Database['public']['Tables']['ws_music_tracks']['Insert']
        )
        .select()

  if (res.error) throw res.error
  if (!res.data || res.data.length === 0)
    throw new Error('No rows were affected.')
  return res.data
}

import { Upload } from '@aws-sdk/lib-storage'
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'
import { s3Client, BUCKET_NAME, CLOUDFRONT_URL } from '@/lib/s3'

export const deleteTrack = async (id: string) => {
  // 1. Get track info before deletion to know artist/category
  const { data: trackInfo } = await supabase()
    .from('ws_music_tracks')
    .select('*, ws_music_artists(name)')
    .eq('id', id)
    .single()

  if (!trackInfo) throw new Error('Track not found')

  // 2. Delete the track
  const res = await supabase()
    .from('ws_music_tracks')
    .delete()
    .eq('id', id)
    .select()

  if (res.error) throw res.error
  if (!res.data || res.data.length === 0)
    throw new Error('No rows were affected.')

  const deletedTrack = res.data[0]

  // 3. Delete the specific file from S3 if it's our CDN URL
  if (deletedTrack.url?.startsWith(CLOUDFRONT_URL)) {
    try {
      const key = deletedTrack.url.replace(`${CLOUDFRONT_URL}/`, '')
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      )
    } catch (s3Error) {
      console.error('Failed to delete S3 object:', s3Error)
    }
  }

  // 4. Orphan Cleanup (Soft attempts)
  try {
    // Artist Cleanup
    if (deletedTrack.artist) {
      const { count: artistTrackCount } = await supabase()
        .from('ws_music_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('artist', deletedTrack.artist)

      if (artistTrackCount === 0) {
        // Delete Artist from DB
        await supabase()
          .from('ws_music_artists')
          .delete()
          .eq('id', deletedTrack.artist)

        // Attempt to delete Artist folder from S3
        const artist = trackInfo.ws_music_artists as unknown as {
          name: string
        } | null
        if (artist?.name) {
          const artistFolderPrefix = `media/zikr/${artist.name}/`
          const listRes = await s3Client.send(
            new ListObjectsV2Command({
              Bucket: BUCKET_NAME,
              Prefix: artistFolderPrefix,
            })
          )

          if (listRes.Contents && listRes.Contents.length > 0) {
            await s3Client.send(
              new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: {
                  Objects: listRes.Contents.map((obj) => ({ Key: obj.Key! })),
                },
              })
            )
          }
        }
      }
    }

    // Category Cleanup
    if (deletedTrack.category) {
      const { count: categoryTrackCount } = await supabase()
        .from('ws_music_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('category', deletedTrack.category)

      if (categoryTrackCount === 0) {
        await supabase()
          .from('ws_music_categories')
          .delete()
          .eq('id', deletedTrack.category)
      }
    }
  } catch (cleanupError) {
    console.error('Failed during orphan cleanup:', cleanupError)
  }

  return res.data
}

export const uploadTrackFile = async (formData: FormData) => {
  const file = formData.get('file') as File
  const artistName = formData.get('artistName') as string
  const trackTitle = formData.get('trackTitle') as string

  if (!file || !artistName || !trackTitle) {
    throw new Error('Missing file, artist name, or track title')
  }

  const extension = file.name.split('.').pop()
  const filePath = `media/zikr/${artistName}/${trackTitle}.${extension}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    },
  })

  await upload.done()

  return `${CLOUDFRONT_URL}/${filePath}`
}
