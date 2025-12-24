export const highlightMarkdown = (text?: string | null) => {
  if (!text) return null;

  // Split by newlines first
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => (
    <span key={lineIndex}>
      {line.split(/(\*\*.*?\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <span
            key={index}
            className="bg-yellow-300 dark:bg-yellow-800 rounded px-0"
          >
            {part.slice(2, -2)}
          </span>
        ) : (
          part
        ),
      )}
      {lineIndex < lines.length - 1 && <br />}
    </span>
  ));
};
