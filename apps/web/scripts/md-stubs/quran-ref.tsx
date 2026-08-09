/**
 * Markdown-converter stub for @/components/quran-ref.
 *
 * The converter walks the React element tree and reads `reference` off the
 * element's props without ever invoking the component, so the body here is
 * never called. It exists only so the import resolves under Node and so the
 * element type carries the name the converter matches on.
 */
export function QuranRef({ reference }: { reference: string; from?: string }) {
  return <span>[{reference}]</span>
}

export function ScriptureRef({ reference }: { reference: string; from?: string }) {
  return <span>[{reference}]</span>
}
