/**
 * Minimal monochrome SVG glyph set for the editor chrome, ported from the
 * handoff design pack. All use currentColor with a 1.6px stroke. Only the icons
 * the shell and module landing reference are included; more can be ported as
 * later phases need them.
 */
import type { ReactNode, CSSProperties } from 'react'

export interface IconProps {
  size?: number
  className?: string
  style?: CSSProperties
}

interface BaseProps extends IconProps {
  fill?: string
  children: ReactNode
}

function Glyph({ size = 14, className = 'icn', style, fill = 'none', children }: BaseProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IArticles = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" />
    <path d="M8 8h6M8 12h6M8 16h4" />
  </Glyph>
)

export const IQuran = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5z" />
    <path d="M19 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" />
  </Glyph>
)

export const IBibleBook = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M12 7v8M9 11h6" />
  </Glyph>
)

export const IUsers = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 6a3 3 0 0 1 0 6" />
    <path d="M18 20a6 6 0 0 0-3-5.2" />
  </Glyph>
)

export const IUser = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Glyph>
)

export const IIdCard = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <circle cx="8.5" cy="11" r="2" />
    <path d="M5.5 16a3 3 0 0 1 6 0" />
    <path d="M14 9h4M14 12h4M14 15h2.5" />
  </Glyph>
)

export const ITag = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M20 12L12 20l-9-9V3h8z" />
    <circle cx="7" cy="7" r="1" />
  </Glyph>
)

export const ILibrary = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3 6v14" />
    <path d="M7 4v18" />
    <path d="M11 4h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6z" />
  </Glyph>
)

export const IShield = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
  </Glyph>
)

export const ILock = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="5" y="11" width="14" height="9" rx="1.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Glyph>
)

export const ILogout = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Glyph>
)

export const IChevR = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M9 6l6 6-6 6" />
  </Glyph>
)

export const IChevD = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M6 9l6 6 6-6" />
  </Glyph>
)

export const IArrowR = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Glyph>
)

export const IGlobe = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
  </Glyph>
)

export const IPalette = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.2-.9 2.2-2 0-.6-.2-1-.6-1.4-.4-.4-.6-.8-.6-1.3 0-1 .8-1.8 1.8-1.8h1.5A4.7 4.7 0 0 0 21 9.8C21 6 16.9 3 12 3z" />
    <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="8" r="1" fill="currentColor" stroke="none" />
  </Glyph>
)
