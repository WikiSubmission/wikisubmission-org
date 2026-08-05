/**
 * Extraction stub for @/components/quran-ref. The real component opens a verse
 * dialog (zustand, API client, Radix) — for plain-text extraction we only need
 * the reference itself to appear in the text.
 */
export function QuranRef({ reference }: { reference: string; from?: string }) {
  return <span>[{reference}]</span>
}

export function ScriptureRef({ reference }: { reference: string; from?: string }) {
  return <span>[{reference}]</span>
}
