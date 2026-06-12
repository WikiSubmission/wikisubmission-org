import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'
import { MiracleExperience } from './miracle-experience'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('miracle')
  return buildPageMetadata({
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    url: '/miracle',
  })
}

export default function MiraclePage() {
  return <MiracleExperience />
}
