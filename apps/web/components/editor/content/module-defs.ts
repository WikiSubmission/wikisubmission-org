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
  | { kind: 'select'; key: string; label: string; required?: boolean; options?: Array<{ value: string; label: string }>; optionsKey?: string; desc?: string }
  | { kind: 'multiselect'; key: string; label: string; optionsKey: string; desc?: string }
  | { kind: 'number'; key: string; label: string; desc?: string }
  | { kind: 'toggle'; key: string; label: string; desc?: string }
  | { kind: 'tags'; key: string; label: string; desc?: string }
  | { kind: 'pt'; key: string; label: string; desc?: string }
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
    blurb: 'Multilingual articles, drafts and publishing.',
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
          { kind: 'select', key: 'author_id', label: 'Author', optionsKey: 'authors' },
          { kind: 'multiselect', key: 'categories', label: 'Categories', optionsKey: 'categories' },
        ],
      },
      { kind: 'textarea', key: 'excerpt', label: 'Excerpt', rows: 3, desc: 'Short description used for SEO and previews.' },
      { kind: 'text', key: 'thumbnail_url', label: 'Thumbnail URL', mono: true, desc: '16:9 recommended. Hosted image URL.' },
      { kind: 'pt', key: 'thumbnail_text', label: 'Thumbnail text', desc: 'Short rich-text teaser shown on the thumbnail.' },
      { kind: 'pt', key: 'body', label: 'Body' },
    ],
  },

  author: {
    key: 'author',
    label: 'Authors',
    labelSingular: 'Author',
    blurb: 'Author profiles and article relationships.',
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
      { kind: 'number', key: 'user_id', label: 'WS user id', desc: 'Optional link to a WikiSubmission account.' },
    ],
  },

  category: {
    key: 'category',
    label: 'Categories',
    labelSingular: 'Category',
    blurb: 'Article categories.',
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
    blurb: 'Online and physical community listings.',
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
          { kind: 'text', key: 'language', label: 'Language', desc: 'Primary language code, e.g. en.' },
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
      { kind: 'tags', key: 'tags', label: 'Tags', desc: 'Comma-separated.' },
      { kind: 'toggle', key: 'is_active', label: 'Active', desc: 'Inactive communities are hidden from listings.' },

      { kind: 'section', label: 'Online details', when: { key: 'kind', equals: 'online' } },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'platform', label: 'Platform', desc: 'discord, telegram, whatsapp…' },
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
    blurb: 'Quran-scoped appendices.',
    titleKeys: ['title'],
    subtitleKey: 'code',
    fields: [
      { kind: 'text', key: 'title', label: 'Title', required: true, title: true },
      {
        kind: 'row',
        fields: [
          { kind: 'text', key: 'code', label: 'Code', mono: true, required: true, desc: 'Kebab-case or numeric, e.g. 19 or intro.' },
          { kind: 'select', key: 'version_id', label: 'Quran version', required: true, optionsKey: 'quranVersions' },
        ],
      },
      { kind: 'textarea', key: 'snippet', label: 'Snippet', rows: 2, desc: 'One-line teaser shown in appendix lists.' },
      { kind: 'pt', key: 'body', label: 'Body' },
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
