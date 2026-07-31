'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useOfflineContent } from '@/hooks/use-offline-content'
import type { BundleDescriptor } from '@/lib/offline/types'

function formatBytes(n: number): string {
  if (n <= 0) return '0 MB'
  const mb = n / (1024 * 1024)
  if (mb < 1) return `${Math.round(n / 1024)} KB`
  return `${mb.toFixed(1)} MB`
}

/** Endonym-free language name in the reader's own UI language, e.g. the code
 *  `fr` renders as "Französisch" for a German user. */
function languageName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

type Translate = ReturnType<typeof useTranslations<'meSettings.offline'>>

/** Friendly label for non-grouped bundles. The library bundle (introduction,
 * proclamation, appendices) is a known kind; anything else falls back to id. */
function orphanLabel(bundle: BundleDescriptor, t: Translate, locale: string): string {
  if (bundle.kind === 'library') {
    return t('libraryBundle', { language: languageName(bundle.lang, locale) })
  }
  return bundle.id
}

/** Bundles grouped for display: one group per language, the text bundle as the
 * main entry and the word-by-word bundle (when the manifest offers one) as a
 * nested sub-entry. */
interface LanguageGroup {
  lang: string
  text: BundleDescriptor
  words?: BundleDescriptor
}

function groupBundles(bundles: BundleDescriptor[]): {
  groups: LanguageGroup[]
  orphans: BundleDescriptor[]
} {
  const texts = bundles.filter((b) => (b.kind ?? 'text') === 'text')
  const words = bundles.filter((b) => b.kind === 'words')

  const wordsByLang = new Map(words.map((b) => [b.lang, b]))
  const groups = texts.map((text) => ({
    lang: text.lang,
    text,
    words: wordsByLang.get(text.lang),
  }))

  // Words bundles without a matching text bundle, plus kinds this client does
  // not recognize: still listed (flat) rather than silently hidden.
  const grouped = new Set(groups.flatMap((g) => [g.text.id, g.words?.id]))
  const orphans = bundles.filter((b) => !grouped.has(b.id))
  return { groups, orphans }
}

export function OfflineSettingsSection() {
  const t = useTranslations('meSettings.offline')
  const tCommon = useTranslations('common')
  const tSettings = useTranslations('settings')
  const locale = useLocale()
  const offline = useOfflineContent()

  if (!offline.loading && !offline.supported) {
    return (
      <section style={cardStyle}>
        <h2 style={h2Style}>{t('heading')}</h2>
        <p style={bodyStyle}>{t('unsupported')}</p>
      </section>
    )
  }

  const bundles = offline.manifest?.bundles ?? []
  const { groups, orphans } = groupBundles(bundles)

  const rowProps = (bundle: BundleDescriptor) => ({
    bundle,
    installed: offline.isInstalled(bundle.id),
    busy: offline.busyId === bundle.id,
    progressPct:
      offline.busyId === bundle.id && offline.progress
        ? progressPercent(offline.progress.received, offline.progress.total)
        : null,
    progressPhase:
      offline.busyId === bundle.id ? (offline.progress?.phase ?? null) : null,
    onInstall: () => offline.install(bundle),
    onRemove: () => offline.remove(bundle.id),
  })

  return (
    <section style={cardStyle}>
      <h2 style={h2Style}>{t('heading')}</h2>
      <p style={bodyStyle}>{t('body')}</p>

      {offline.usage && (
        <p style={mutedStyle}>
          {offline.usage.quota > 0
            ? t('usageWithQuota', {
                used: formatBytes(offline.usage.usage),
                quota: formatBytes(offline.usage.quota),
              })
            : t('usage', { used: formatBytes(offline.usage.usage) })}
        </p>
      )}

      {offline.error && <p style={{ ...bodyStyle, color: 'var(--destructive, #b91c1c)' }}>{offline.error}</p>}

      {offline.loading && <p style={mutedStyle}>{tCommon('loading')}</p>}

      {!offline.loading && bundles.length === 0 && (
        <p style={mutedStyle}>{t('empty')}</p>
      )}

      {groups.map((group) => (
        <div key={group.lang} style={groupStyle}>
          <h3 style={groupHeadingStyle}>{languageName(group.lang, locale)}</h3>
          <ul style={listStyle}>
            <BundleRow {...rowProps(group.text)} label={t('quranText')} />
            {group.words && (
              <BundleRow {...rowProps(group.words)} label={tSettings('wordByWord')} nested />
            )}
          </ul>
        </div>
      ))}

      {orphans.length > 0 && (
        <ul style={{ ...listStyle, marginTop: 16 }}>
          {orphans.map((bundle) => (
            <BundleRow
              key={bundle.id}
              {...rowProps(bundle)}
              label={orphanLabel(bundle, t, locale)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function progressPercent(received: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((received / total) * 100))
}

interface BundleRowProps {
  bundle: BundleDescriptor
  label: string
  /** Indented sub-entry (word-by-word under its language). */
  nested?: boolean
  installed: boolean
  busy: boolean
  progressPct: number | null
  progressPhase: 'download' | 'verify' | 'import' | null
  onInstall: () => void
  onRemove: () => void
}

function BundleRow({
  bundle,
  label,
  nested = false,
  installed,
  busy,
  progressPct,
  progressPhase,
  onInstall,
  onRemove,
}: BundleRowProps) {
  const t = useTranslations('meSettings.offline')
  const PHASE_KEYS = {
    download: 'phaseDownload',
    verify: 'phaseVerify',
    import: 'phaseImport',
  } as const
  return (
    <li style={nested ? nestedRowStyle : rowStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: nested ? 400 : 500 }}>{label}</span>
        <span style={statusStyle}>{formatBytes(bundle.bytes)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {busy && progressPhase && (
          <span style={statusStyle}>
            {t(PHASE_KEYS[progressPhase])}
            {progressPhase === 'download' && progressPct != null ? ` ${progressPct}%` : '…'}
          </span>
        )}
        {!busy && installed && (
          <button type="button" onClick={onRemove} style={ghostButtonStyle}>
            {t('remove')}
          </button>
        )}
        {!busy && !installed && (
          <button type="button" onClick={onInstall} style={buttonStyle}>
            {t('download')}
          </button>
        )}
        {busy && <span style={statusStyle}>{t('working')}</span>}
      </div>
    </li>
  )
}

const cardStyle: React.CSSProperties = {
  padding: '20px 24px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  background: 'var(--ed-surface)',
  marginBottom: 16,
}

const h2Style: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 22,
  fontWeight: 500,
}

const bodyStyle: React.CSSProperties = {
  marginTop: 8,
  color: 'var(--ed-fg-muted)',
  fontSize: 14,
  lineHeight: 1.55,
}

const mutedStyle: React.CSSProperties = { marginTop: 8, color: 'var(--ed-fg-muted)', fontSize: 13 }

const groupStyle: React.CSSProperties = { marginTop: 20 }

const groupHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: '8px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 0',
  borderTop: '1px solid var(--ed-rule)',
}

const nestedRowStyle: React.CSSProperties = {
  ...rowStyle,
  paddingLeft: 20,
  borderTop: '1px dashed var(--ed-rule)',
}

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 2,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 13,
  cursor: 'pointer',
}

const ghostButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
  fontSize: 13,
  cursor: 'pointer',
}
