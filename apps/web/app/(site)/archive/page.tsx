import ArchiveClient from './archive-client'
import { buildPageMetadata } from '@/constants/metadata'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  const t = await getTranslations('archive')
  if (q) {
    return buildPageMetadata({
      title: t('metadataSearchTitle', { query: q }),
      description: t('metadataSearchDescription', { query: q }),
      url: `https://wikisubmission.org/archive?q=${encodeURIComponent(q)}`,
    })
  }
  return buildPageMetadata({
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    url: 'https://wikisubmission.org/archive',
  })
}

export default function ArchivePage() {
  return <ArchiveClient />
}
