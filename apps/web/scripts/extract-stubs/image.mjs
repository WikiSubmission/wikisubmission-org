// Extraction stub for next/image (native ESM so the default import
// interops cleanly). Alt text is all that matters for text extraction.
import { createElement } from 'react'

export default function Image({ alt, ...rest }) {
  return createElement('img', { alt, ...rest })
}
