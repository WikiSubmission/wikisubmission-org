import React from 'react'

export function AppendixContent() {
  // Chronological order → Sura number mapping
  const data: [number, number][] = [
    [1, 96], [2, 68], [3, 73], [4, 74], [5, 1], [6, 111], [7, 81], [8, 87],
    [9, 92], [10, 89], [11, 93], [12, 94], [13, 103], [14, 100], [15, 108],
    [16, 102], [17, 107], [18, 109], [19, 105], [20, 113], [21, 114], [22, 112],
    [23, 53], [24, 80], [25, 97], [26, 91], [27, 85], [28, 95], [29, 106],
    [30, 101], [31, 75], [32, 104], [33, 77], [34, 50], [35, 90], [36, 86],
    [37, 54], [38, 38], [39, 7], [40, 72], [41, 36], [42, 25], [43, 35],
    [44, 19], [45, 20], [46, 56], [47, 26], [48, 27], [49, 28], [50, 17],
    [51, 10], [52, 11], [53, 12], [54, 15], [55, 6], [56, 37], [57, 31],
    [58, 34], [59, 39], [60, 40], [61, 41], [62, 42], [63, 43], [64, 44],
    [65, 45], [66, 46], [67, 51], [68, 88], [69, 18], [70, 16], [71, 71],
    [72, 14], [73, 21], [74, 23], [75, 32], [76, 52], [77, 67], [78, 69],
    [79, 70], [80, 78], [81, 79], [82, 82], [83, 84], [84, 30], [85, 29],
    [86, 83], [87, 2], [88, 8], [89, 3], [90, 33], [91, 60], [92, 4],
    [93, 99], [94, 57], [95, 47], [96, 13], [97, 55], [98, 76], [99, 65],
    [100, 98], [101, 59], [102, 24], [103, 22], [104, 63], [105, 58], [106, 49],
    [107, 66], [108, 64], [109, 61], [110, 62], [111, 48], [112, 5], [113, 9],
    [114, 110],
  ]

  // Split into columns of 19 rows each
  const columns: [number, number][][] = []
  for (let i = 0; i < data.length; i += 19) {
    columns.push(data.slice(i, i + 19))
  }

  return (
    <>
      {/* ── Opening card ─────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Chronological Order of Revelation
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The 114 suras of the Quran, listed in the order they were revealed to the
          Prophet Muhammad.
        </p>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-border/60 overflow-hidden"
      >
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Order → Sura Number
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                {columns.map((_, i) => (
                  <React.Fragment key={i}>
                    <th
                      className="text-left px-3 py-2 font-medium text-muted-foreground font-mono text-xs"
                    >
                      Order
                    </th>
                    <th
                      className="text-left px-3 py-2 font-medium text-muted-foreground text-xs"
                    >
                      Sura
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 19 }).map((_, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col, colIdx) => {
                    const entry = col[rowIdx]
                    if (!entry) {
                      return (
                        <React.Fragment key={colIdx}>
                          <td className="px-3 py-1.5" />
                          <td className="px-3 py-1.5" />
                        </React.Fragment>
                      )
                    }
                    return (
                      <React.Fragment key={colIdx}>
                        <td
                          className="px-3 py-1.5 font-mono text-xs text-muted-foreground"
                        >
                          {entry[0]}
                        </td>
                        <td
                          className="px-3 py-1.5 font-mono text-xs text-primary font-semibold"
                        >
                          {entry[1]}
                        </td>
                      </React.Fragment>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Note ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Prophet Muhammad wrote down the Quran in its chronological order of
          revelation, together with the necessary instructions to place every piece
          in its proper position. This chronological sequence was preserved in early
          Islamic manuscripts and referenced in classical sources including
          Al-Suyuty&apos;s <em>Itqaan</em>.
        </p>
        <p>
          The current arrangement of suras (from longest to shortest, approximately)
          differs from the chronological order but was divinely arranged under the
          Prophet&apos;s supervision. The first sura revealed was Sura 96 (Al-Alaq),
          and the last complete sura was Sura 110 (Al-Nasr).
        </p>
      </section>
    </>
  )
}
