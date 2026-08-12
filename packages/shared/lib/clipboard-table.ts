/**
 * Writes a table to the clipboard in two flavours at once.
 *
 * `text/html` is what rich editors (Docs, Notion, Word) turn into a real table;
 * `text/plain` carries the TSV, which is what spreadsheets paste as a real grid.
 * Offering both on one write lets the destination pick whichever it understands,
 * instead of forcing the user to choose the format up front.
 *
 * Falls back to a plain-text write where `ClipboardItem` is unavailable (Firefox
 * has no async clipboard write for arbitrary types), in which case the markdown
 * flavour is the readable choice.
 */
export function canWriteRichClipboard(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function' &&
    typeof ClipboardItem !== 'undefined'
  )
}

export async function writeTableToClipboard(table: {
  html: string
  tsv: string
  markdown: string
}): Promise<void> {
  if (!canWriteRichClipboard()) {
    await navigator.clipboard.writeText(table.markdown)
    return
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([table.html], { type: 'text/html' }),
        'text/plain': new Blob([table.tsv], { type: 'text/plain' }),
      }),
    ])
  } catch {
    // Some browsers reject the html type even when ClipboardItem exists.
    await navigator.clipboard.writeText(table.tsv)
  }
}
