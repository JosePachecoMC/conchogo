/**
 * Generador estático del dossier MotoUber.
 * Uso: node tools/build.mjs
 *
 * Lee src/pages/*.html, sustituye los marcadores {{DIAGRAMA:clave}}
 * por SVG generados y escribe las páginas finales en la raíz.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { erDiagram } from "./diagrams/er.mjs";
import { contextoDiagram } from "./diagrams/contexto.mjs";
import { dfd1Diagram } from "./diagrams/dfd1.mjs";
import { dfd2aDiagram } from "./diagrams/dfd2a.mjs";
import { dfd2bDiagram } from "./diagrams/dfd2b.mjs";
import { dfd2cDiagram } from "./diagrams/dfd2c.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(ROOT, "src", "pages");
const OUT_DIR = ROOT;

const diagrams = {
  er: erDiagram(),
  contexto: contextoDiagram(),
  dfd1: dfd1Diagram(),
  dfd2a: dfd2aDiagram(),
  dfd2b: dfd2bDiagram(),
  dfd2c: dfd2cDiagram(),
};

const NAV = [
  ["index.html", "Inicio"],
  ["modelo-er.html", "Modelo E-R"],
  ["contexto.html", "Contexto"],
  ["dfd.html", "DFD"],
];

const printIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 17h10v4H7z"/><path d="M17 12h1"/></svg>`;
const arrowRight = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const motoMark = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.3" cy="16.8" r="2.9"/><circle cx="18.7" cy="16.8" r="2.9"/><path d="M8.2 16.8h4.6l2.5-5.6h3.1"/><path d="M11.2 16.8 9.7 12H6.7"/><path d="m13 11.2-2.1-3.5H9.1"/></svg>`;
const backTop = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg>`;

function layout(meta, content) {
  const navLinks = NAV.map(([href, label]) =>
    `<a href="${href}"${meta.page === href ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${meta.title} · MotoUber</title>
  <meta name="description" content="${meta.description}">
  <meta name="author" content="Equipo MotoUber">
  <meta name="theme-color" content="#4338ca">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%234338ca'/%3E%3Cg fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='43' r='7'/%3E%3Ccircle cx='46' cy='43' r='7'/%3E%3Cpath d='M25 43h11l5-12h6M32 43l-3-9h-6m10-3-4-6h-5'/%3E%3C/g%3E%3C/svg%3E">
  <link rel="stylesheet" href="assets/css/styles.css">
  ${meta.pageCSS ? `<style>${meta.pageCSS}</style>` : ""}
</head>
<body class="${meta.bodyClass || ""}">
  <a class="skip-link" href="#contenido">Saltar al contenido</a>

  <div class="print-only" style="display:none;padding:0 0 10pt;border-bottom:1px solid #cbd5e1;margin-bottom:12pt;font-size:9pt;color:#475569">
    <strong style="color:#0f172a">MotoUber</strong> · Documentación técnica · ${meta.title}
  </div>

  <header class="topbar no-print">
    <div class="topbar__inner">
      <a class="brand" href="index.html" aria-label="MotoUber, inicio del dossier">
        <span class="brand__mark">${motoMark}</span>
        <span class="brand__text">
          <span class="brand__name">MotoUber</span>
          <span class="brand__sub">Dossier técnico</span>
        </span>
      </a>
      <nav class="nav" aria-label="Navegación principal">
        ${navLinks}
        <button class="nav__print" type="button" data-print title="Imprimir o guardar como PDF">
          ${printIcon}<span>Imprimir</span>
        </button>
      </nav>
    </div>
  </header>

  <main id="contenido">
    ${content}
  </main>

  <footer class="site-footer no-print">
    <div class="site-footer__inner">
      <div><strong>MotoUber</strong> · Documentación de ingeniería · <span data-year>2026</span></div>
      <div>Modelo E-R 3FN · Diagrama de contexto · DFD nivel 1 y 2</div>
      <div><a href="index.html">Volver al índice</a></div>
    </div>
  </footer>

  <button class="to-top no-print" type="button" aria-label="Volver arriba" title="Volver arriba">${backTop}</button>
  <script src="assets/js/ui.js"></script>
</body>
</html>
`;
}

function parsePage(raw, file) {
  const match = raw.match(/^<!--META([\s\S]*?)META-->\s*/);
  if (!match) throw new Error(`Falta el bloque META en ${file}`);
  let meta;
  try {
    meta = JSON.parse(match[1].trim());
  } catch (err) {
    throw new Error(`META inválido en ${file}: ${err.message}`);
  }
  if (!meta.title || !meta.description) throw new Error(`META incompleto en ${file}`);
  meta.page = meta.page || path.basename(file).replace(/\.html$/, "") + ".html";
  return { meta, body: raw.slice(match[0].length) };
}

/**
 * Los SVG comparten defs (marcadores, filtros). Al incrustar varios en una misma
 * página hay que prefijar sus id para no duplicarlos en el documento HTML.
 */
function namespaceSvg(svg, prefix) {
  const ids = [...new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))];
  let out = svg;
  for (const id of ids) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`(\\sid=")${safe}(")`, "g"), `$1${prefix}-${id}$2`)
      .replace(new RegExp(`url\\(#${safe}\\)`, "g"), `url(#${prefix}-${id})`)
      .replace(new RegExp(`(href="#)${safe}(")`, "g"), `$1${prefix}-${id}$2`);
  }
  return out;
}

function injectDiagrams(html, file) {
  const missing = [];
  const seen = new Map();
  const out = html.replace(/\{\{DIAGRAMA:([a-z0-9-]+)\}\}/g, (_, key) => {
    if (!diagrams[key]) {
      missing.push(key);
      return `<!-- diagrama no encontrado: ${key} -->`;
    }
    const n = (seen.get(key) || 0) + 1;
    seen.set(key, n);
    return namespaceSvg(diagrams[key], n === 1 ? key : `${key}-${n}`);
  });
  if (missing.length) throw new Error(`Diagramas inexistentes en ${file}: ${missing.join(", ")}`);
  return out
    .replaceAll("{{arrow}}", arrowRight)
    .replaceAll("{{printIcon}}", printIcon);
}

// Validaciones rápidas del contenido
function validate(html, file) {
  const problems = [];
  if (/href=""/.test(html)) problems.push("enlace vacío");
  if (/src=""/.test(html)) problems.push("src vacío");
  if (/\{\{DIAGRAMA:/.test(html)) problems.push("marcador de diagrama sin resolver");
  if (problems.length) throw new Error(`${file}: ${problems.join(", ")}`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".html")).sort();
let total = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
  const { meta, body } = parsePage(raw, file);
  const content = injectDiagrams(body, file);
  validate(content, file);
  const html = layout(meta, content);
  fs.writeFileSync(path.join(OUT_DIR, file), html, "utf8");
  total++;
  console.log(`✓ ${file}  ${(html.length / 1024).toFixed(1)} KB`);
}

console.log(`\n${total} páginas generadas en ${OUT_DIR}`);
console.log(`Diagramas incrustados: ${Object.keys(diagrams).join(", ")}`);
