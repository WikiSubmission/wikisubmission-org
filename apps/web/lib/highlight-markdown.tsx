export const highlightMarkdown = (text?: string | null) => {
  if (!text) return null

  // Split by newlines first
  const lines = text.split('\n')

  return lines.map((line, lineIndex) => (
    <span key={lineIndex}>
      {line.split(/(\*\*.*?\*\*|==.*?==)/g).map((part, index) => {
        const isBold = part.startsWith('**') && part.endsWith('**')
        const isHighlight = part.startsWith('==') && part.endsWith('==')

        if (isBold || isHighlight) {
          return (
            <span
              key={index}
              className="bg-primary/10 text-primary dark:text-primary rounded-sm font-bold"
            >
              {part.slice(2, -2)}
            </span>
          )
        }
        return part
      })}
      {lineIndex < lines.length - 1 && <br />}
    </span>
  ))
}
