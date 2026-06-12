import { wsApiServer } from '@/src/api/server-client'
import { VerseListResult } from './verse-list-result'

export async function VerseListFetcher({ queryText }: { queryText: string }) {
  let data = undefined
  let apiError = false
  try {
    const result = await wsApiServer.GET('/quran', {
      params: {
        query: {
          langs: ['en', 'ar'],
          verses: queryText,
          include_words: true,
          include_root: true,
          include_meaning: true,
          word_langs: ['ar', 'en', 'tl'],
        },
      },
    })
    data = result.data
    apiError = !!result.error
  } catch {
    apiError = true
  }

  return (
    <VerseListResult queryText={queryText} data={data} apiError={apiError} />
  )
}
