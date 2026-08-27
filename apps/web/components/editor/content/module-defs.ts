/**
 * Declarative UI definitions for the five content modules. Consumed by the
 * generic list page and DocForm; the backend re-validates every payload, so
 * these definitions only shape the editing surface.
 *
 * Select fields whose options come from data (languages, authors, categories,
 * Quran versions) declare an `optionsKey`; the server page fetches the options
 * and injects them by that key.
 */

export type FieldDef =
  | { kind: 'text'; key: string; label: string; required?: boolean; mono?: boolean; desc?: string; title?: boolean }
  | { kind: 'slug'; key: string; label: string; from: string; desc?: string }
  | { kind: 'textarea'; key: string; label: string; rows?: number; desc?: string }
  | { kind: 'select'; key: string; label: string; required?: boolean; options?: Array<{ value: string; label: string }>; optionsKey?: string; desc?: string; adminOnly?: boolean }
  | { kind: 'multiselect'; key: string; label: string; optionsKey: string; desc?: string }
  | { kind: 'number'; key: string; label: string; desc?: string }
  | { kind: 'toggle'; key: string; label: string; desc?: string; defaultOn?: boolean }
  | { kind: 'tags'; key: string; label: string; desc?: string }
  | { kind: 'image'; key: string; label: string; required?: boolean; desc?: string; aspect?: string }
  | { kind: 'pt'; key: string; label: string; desc?: string }
  | { kind: 'appendixPt'; key: string; label: string; desc?: string }
  | { kind: 'geo'; key: string; label: string; desc?: string }
  | { kind: 'row'; fields: FieldDef[] }
  | { kind: 'section'; label: string; desc?: string; when?: { key: string; equals: string } }

export interface ContentModuleDef {
  key: 'article' | 'author' | 'category' | 'community' | 'appendix'
  label: string
  labelSingular: string
  blurb: string
  /** Field key(s) composing the list row title. */
  titleKeys: string[]
  /** Field key shown as the row's secondary line (besides status). */
  subtitleKey?: string
  fields: FieldDef[]
}

export const CONTENT_MODULE_DEFS: Record<string, ContentModuleDef> = {
  article: {
    key: 'article',
    label: 'Articles',
    labelSingular: 'Article',
    blurb: 'Write, translate and publish articles for the site.',
    titleKeys: ['title'],
    subtitleKey: 'slug',
    fields: [
      { kind: 'text', key: 'title', label: 'Title', required: true, title: true },
      {
        kind: 'row',
        fields: [
          { kind: 'slug', key: 'slug', label: 'Slug', from: 'title' },
          { kind: 'select', key: 'language', label: 'Language', required: true, optionsKey: 'languages' },
        ],
      },
      {
        kind: 'row',
        fields: [
          // Admin-only: a regular editor writes under their own byline, which
          // the form fills in from their account, so the picker would only
          // offer them a way to publish under someone else's name.
          { kind: 'select', key: 'author_id', label: 'Author', optionsKey: 'authors', adminOnly: true },
          { kind: 'multiselect', key: 'categories', label: 'Categories', optionsKey: 'categories' },
        ],
      },
      { kind: 'textarea', key: 'excerpt', label: 'Excerpt', rows: 3, desc: 'A sentence or two. Shows up in search results and article previews.' },
      { kind: 'image', key: 'thumbnail_url', label: 'Thumbnail', aspect: '16 / 9', desc: 'Upload an image, or paste a link to one already online. Wide (16:9) images look best.' },
      { kind: 'pt', key: 'thumbnail_text', label: 'Thumbnail text', desc: 'A short line shown over the thumbnail.' },
      { kind: 'pt', key: 'body', label: 'Body' },
      {
        kind: 'toggle',
        key: 'enable_scripture_refs',
        label: 'Link scripture references',
        defaultOn: true,
        desc: 'Turns verse references in the body into links readers can follow. On unless you turn it off.',
      },
    ],
  },

  author: {
    key: 'author',
    label: 'Authors',
    labelSingular: 'Author',
    blurb: 'Bylines and profiles for the people who write here.',
    titleKeys: ['first_name', 'last_name'],
    subtitleKey: 'slug',
    fields: [
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'first_name', label: 'First name', required: true },
          { kind: 'text', key: 'last_name', label: 'Last name', required: true },
        ],
      },
      { kind: 'slug', key: 'slug', label: 'Slug', from: 'first_name last_name' },
      { kind: 'text', key: 'photo_url', label: 'Photo URL', mono: true },
      { kind: 'textarea', key: 'bio', label: 'Bio', rows: 4 },
      { kind: 'number', key: 'user_id', label: 'WS user id', desc: 'Optional. Links this author to a WikiSubmission account.' },
    ],
  },

  category: {
    key: 'category',
    label: 'Categories',
    labelSingular: 'Category',
    blurb: 'The topics readers use to browse articles.',
    titleKeys: ['name'],
    subtitleKey: 'slug',
    fields: [
      { kind: 'text', key: 'name', label: 'Name', required: true },
      { kind: 'slug', key: 'slug', label: 'Slug', from: 'name' },
      { kind: 'textarea', key: 'description', label: 'Description', rows: 2 },
    ],
  },

  community: {
    key: 'community',
    label: 'Communities',
    labelSingular: 'Community',
    blurb: 'The local groups and online communities listed on the site.',
    titleKeys: ['name'],
    subtitleKey: 'slug',
    fields: [
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'name', label: 'Name', required: true },
          {
            kind: 'select',
            key: 'kind',
            label: 'Kind',
            required: true,
            options: [
              { value: 'online', label: 'Online' },
              { value: 'physical', label: 'Physical' },
            ],
          },
        ],
      },
      {
        kind: 'row',
        fields: [
          { kind: 'slug', key: 'slug', label: 'Slug', from: 'name' },
          { kind: 'text', key: 'language', label: 'Language', desc: 'Two-letter code for the main language, such as en.' },
        ],
      },
      { kind: 'textarea', key: 'description', label: 'Description', rows: 3 },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'image_url', label: 'Image URL', mono: true },
          { kind: 'text', key: 'image_alt', label: 'Image alt text' },
        ],
      },
      { kind: 'tags', key: 'tags', label: 'Tags', desc: 'Separate each tag with a comma.' },
      { kind: 'toggle', key: 'is_active', label: 'Active', desc: 'Turn this off to hide the community from the site without deleting it.' },

      { kind: 'section', label: 'Online details', when: { key: 'kind', equals: 'online' } },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'platform', label: 'Platform', desc: 'Where it meets: discord, telegram, whatsapp…' },
          { kind: 'text', key: 'url', label: 'URL', mono: true },
        ],
      },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'invite_code', label: 'Invite code' },
          { kind: 'number', key: 'member_count', label: 'Member count' },
        ],
      },

      { kind: 'section', label: 'Physical details', when: { key: 'kind', equals: 'physical' } },
      { kind: 'text', key: 'address', label: 'Address' },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'city', label: 'City' },
          { kind: 'text', key: 'country', label: 'Country' },
        ],
      },
      { kind: 'geo', key: 'geo', label: 'Coordinates', desc: 'Decimal degrees, e.g. 43.6548 / -79.3886. Leave both blank to skip the map pin.' },
      { kind: 'text', key: 'meeting_schedule', label: 'Meeting schedule' },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'contact_email', label: 'Contact email', mono: true },
          { kind: 'text', key: 'contact_phone', label: 'Contact phone', mono: true },
        ],
      },
    ],
  },

  appendix: {
    key: 'appendix',
    label: 'Appendices',
    labelSingular: 'Appendix',
    blurb: 'The appendices that accompany a Quran translation.',
    titleKeys: ['title'],
    subtitleKey: 'code',
    fields: [
      { kind: 'text', key: 'title', label: 'Title', required: true, title: true },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'code', label: 'Code', mono: true, required: true, desc: 'How this appendix is addressed in links, e.g. 19 or intro.' },
          { kind: 'select', key: 'version_id', label: 'Quran version', required: true, optionsKey: 'quranVersions' },
        ],
      },
      { kind: 'textarea', key: 'snippet', label: 'Snippet', rows: 2, desc: 'One line, shown wherever appendices are listed.' },
      // Two body carriers while the Portable Text migration is in flight. The
      // reader prefers body_pt and falls back to the markdown, so an appendix
      // that has not been converted keeps rendering from the carrier it has.
      {
        kind: 'appendixPt',
        key: 'body_pt',
        label: 'Body (Portable Text)',
        desc: 'The formatted body. Used in place of the markdown below whenever it has anything in it — clear every block to fall back to the markdown.',
      },
      { kind: 'textarea', key: 'body', label: 'Body (markdown)', rows: 24, desc: 'Older format. Only used when the formatted body above is empty.' },
      // An appendix carries at most one video, always trailing. It is metadata
      // rather than body markdown, so the reader appends it below the body.
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'video_id', label: 'Video ID', mono: true, desc: 'The 11-character YouTube id only, not the whole link. Leave blank for no video.' },
          { kind: 'text', key: 'video_title', label: 'Video title', desc: 'Describes the video for screen readers.' },
        ],
      },
    ],
  },
}

export const CONTENT_MODULE_KEYS = Object.keys(CONTENT_MODULE_DEFS)

/** Composes the list-row title from a doc's fields. */
export function docTitle(def: ContentModuleDef, fields: Record<string, unknown>): string {
  const title = def.titleKeys
    .map((k) => (typeof fields[k] === 'string' ? (fields[k] as string) : ''))
    .filter(Boolean)
    .join(' ')
    .trim()
  return title || 'Untitled'
}
