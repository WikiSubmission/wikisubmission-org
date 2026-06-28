# Appendix Audit Prompt

Reusable prompt for auditing a rendered appendix in this app against the canonical
source at masjidtucson.org. Paste it (filling in the number) and let the agent run.

---

## Prompt

Audit `app/(site)/appendices/_content/appendix-N.tsx` against the official reference
`https://masjidtucson.org/quran/appendices/appendixN.html`. Report every factual error,
omission, numbering problem, and verse-quote deviation, grouped by severity with file
line references. Do **not** edit anything until I review the findings.

Method:

1. Read the content file in full.
2. Obtain the reference text **verbatim** (see Caveats — a summary is not acceptable for
   this task).
3. Compare exhaustively:
   - **Every numbered proof (1..N):** the exact integers, the claimed multiple of 19, and
     the operation. Confirm the site reproduces the source's stated numbers.
   - **Verse quotes:** must match the canonical Rashad Khalifa translation word-for-word.
     Flag any paraphrase.
   - **Section order, headings, and completeness:** any proof, table, or section present
     in the source but missing, reordered, or relabeled on the site.
   - **Internal consistency:** a table's stated totals must equal the sum of the cells it
     actually displays (catches "stated 224 but the visible column sums to 558" bugs).
4. Group findings: 🔴 factual errors, 🟠 omissions / broken numbering, 🟡 quote & content
   deviations. Give a short fix recommendation per finding. Wait for approval before editing.

---

## Caveats (learned the hard way)

- **WebFetch summarizes and will refuse verbatim.** Its small model paraphrases, imposes a
  quote-length cap, renumbers points, and silently drops some (in the appendix-2 run it
  skipped proof #38). **Never audit arithmetic or wording from a WebFetch summary.** It is
  fine only for a first orientation pass.
- **The Bash sandbox blocks network** (`curl` exits 56). To get the raw page, run `curl`
  with `dangerouslyDisableSandbox: true`, then strip HTML to text locally:
  - `curl -sL --max-time 30 <url> -o page.html`  (sandbox disabled)
  - Python: drop `<script>`/`<style>`, convert `</tr>`→newline and `<td>`/`<th>`→` | `,
    strip remaining tags, `html.unescape`, collapse whitespace. Tables survive as
    pipe-delimited rows, which is what you need to verify cell-by-cell.
- **Do not recompute gematria from scratch.** The letter values and the running sums are
  self-referential to the book and the book's own arithmetic has quirks (e.g. proof (4)
  adds `40+29+38+38+26`). Verify two things instead: (a) the site faithfully reproduces the
  source's stated numbers, and (b) the site is internally consistent.
- **Watch for reworded verse quotes.** The site frequently paraphrases verses; they must
  match the canonical translation exactly (e.g. 3:81 "confirm what you have", not "confirm
  all existing scriptures").
- **Watch numbering integrity.** The site may renumber, reorder, or drop proofs, leaving
  gaps a reader can see — e.g. a proofs card starting at "(3)" with no (1)/(2), or proof
  (14) exiled far from its source position. Restore the source's full set and order.
- **The site is a rewrite, not a port.** Expect condensed prose and dropped supporting
  arguments (in appendix-2: the Aaron/Torah and Joseph "last messenger" points were cut).
  Decide per finding whether the omission is editorial or a substantive loss.
