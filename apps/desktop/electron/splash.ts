/**
 * Shown while the backend starts. The first launch prepares the library
 * (about a minute); later launches take a few seconds. Static markup with no
 * script: the splash window runs with JavaScript disabled.
 */
export function splashHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<style>
  html, body { margin: 0; height: 100%; background: #14110E; color: #EDE6DA;
    font-family: Georgia, 'Times New Roman', serif; -webkit-user-select: none; user-select: none; }
  main { height: 100%; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; text-align: center; padding: 0 28px; box-sizing: border-box; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; }
  p { margin: 0; font: 13px/1.5 system-ui, sans-serif; color: #A99F90; }
  .bar { width: 140px; height: 3px; border-radius: 2px; background: #2B2620; overflow: hidden; margin-top: 8px; }
  .bar::after { content: ''; display: block; width: 40%; height: 100%; background: #C9A86A;
    animation: slide 1.4s ease-in-out infinite; }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
</style>
</head>
<body>
<main>
  <h1>WikiSubmission</h1>
  <p>Opening the Quran library…</p>
  <p>The first launch prepares the library and can take about a minute.</p>
  <div class="bar"></div>
</main>
</body>
</html>`
}
