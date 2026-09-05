import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'
import { ContactClient } from './contact-client'

export const metadata = buildPageMetadata({
  title: 'Contact | WikiSubmission',
  description: 'Get in touch with the WikiSubmission team for general questions, bug reports, scripture research, or community support.',
  url: '/contact',
})

export default async function ContactPage() {
  const t = await getTranslations('contact')

  return (
    <ContactClient
      heading={t('heading')}
      description={t('description')}
    />
  )
}
