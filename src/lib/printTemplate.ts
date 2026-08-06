import type { PodcastTemplate } from "./podcastTemplates";

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Obre una finestra amb el guió de la plantilla en un format net per
 * imprimir o desar en PDF (amb el diàleg d'impressió del navegador).
 */
export function printTemplateGuide(template: PodcastTemplate): void {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;

  let inicio = 0;
  const stepsHtml = template.pasos
    .map((paso) => {
      const row = `
        <li>
          <span class="time">${formatTime(inicio)}</span>
          <span>
            <strong>${escapeHtml(paso.titulo)}</strong>
            <span class="dur">(~${paso.segundos} s)</span>
            <p>${escapeHtml(paso.guion)}</p>
          </span>
        </li>`;
      inicio += paso.segundos;
      return row;
    })
    .join("");

  const effectsHtml = template.efectos
    .map((e) => `<span class="chip">${escapeHtml(e)}</span>`)
    .join("");

  win.document.write(`<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<title>Guió — ${escapeHtml(template.nombre)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #1a1a1a;
    max-width: 680px;
    margin: 40px auto;
    padding: 0 24px;
    line-height: 1.5;
  }
  h1 { font-size: 26px; margin: 0 0 4px; }
  .subtitle { color: #555; font-size: 14px; margin: 0 0 28px; }
  h2 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #666;
    border-bottom: 1px solid #ccc;
    padding-bottom: 6px;
    margin: 28px 0 12px;
  }
  .callout {
    background: #f4f4f0;
    border-left: 3px solid #999;
    padding: 12px 16px;
    font-size: 15px;
    margin: 0;
  }
  ol { list-style: none; margin: 0; padding: 0; }
  ol li {
    display: flex;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px dashed #ddd;
    font-size: 15px;
  }
  ol li:last-child { border-bottom: none; }
  .time {
    font-family: "Courier New", monospace;
    font-weight: bold;
    color: #444;
    flex-shrink: 0;
    width: 46px;
  }
  .dur { color: #888; font-size: 12px; font-weight: normal; }
  li p { margin: 4px 0 0; color: #333; }
  .chip {
    display: inline-block;
    border: 1px solid #999;
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 12px;
    margin: 0 6px 6px 0;
  }
  .print-btn {
    font-family: -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 700;
    padding: 10px 20px;
    border-radius: 999px;
    border: none;
    background: #16324f;
    color: #fff;
    cursor: pointer;
    margin-bottom: 24px;
  }
  @media print {
    .print-btn { display: none; }
    body { margin: 0; }
  }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimeix / Desa en PDF</button>
  <h1>${escapeHtml(template.emoji)} ${escapeHtml(template.nombre)}</h1>
  <p class="subtitle">${escapeHtml(template.descripcion)} — objectiu: ${formatTime(template.duracionObjetivo)}</p>

  <h2>Intro (llegeix-la tal qual)</h2>
  <p class="callout">${escapeHtml(template.intro)}</p>

  <h2>Guió pas a pas</h2>
  <ol>${stepsHtml}</ol>

  <h2>Outro (per acomiadar-te)</h2>
  <p class="callout">${escapeHtml(template.outro)}</p>

  <h2>Efectes de so recomanats</h2>
  <p>${effectsHtml}</p>
</body>
</html>`);
  win.document.close();
}
