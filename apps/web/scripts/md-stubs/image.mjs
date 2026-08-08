// Markdown-converter stub for next/image (native ESM so the default import
// interops cleanly). The converter reads src/alt off the props directly; this
// body only exists to keep the import resolvable under Node.
import { createElement } from 'react'

export default function Image({ alt, ...rest }) {
  return createElement('img', { alt, ...rest })
}
