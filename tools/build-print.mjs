/**
 * Edición de impresión: solo diagramas, papel carta y paneles ampliados.
 * Uso: node tools/build-print.mjs
 *
 * Genera diagramas-print.html, autocontenido y sin dependencias externas.
 * Cada panel recorta el SVG original mediante viewBox para conservar el
 * dibujo vectorial y aumentar la escala efectiva del texto.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { C, esc } from "./svg.mjs";
import { erDiagram } from "./diagrams/er.mjs";
import { contextoDiagram } from "./diagrams/contexto.mjs";
import { dfd1Diagram } from "./diagrams/dfd1.mjs";
import { dfd2aDiagram } from "./diagrams/dfd2a.mjs";
import { dfd2bDiagram } from "./diagrams/dfd2b.mjs";
import { dfd2cDiagram } from "./diagrams/dfd2c.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "diagramas-print.html");

const svgs = {
  er: erDiagram(),
  contexto: contextoDiagram(),
  dfd1: dfd1Diagram(),
  dfd2a: dfd2aDiagram(),
  dfd2b: dfd2bDiagram(),
  dfd2c: dfd2cDiagram(),
};

const legend = (items) =>
  items
    .map(
      ([label, color]) =>
        `<span class="legend__item"><i style="background:${color}"></i>${esc(label)}</span>`
    )
    .join("");

const DIAGRAMS = [
  {
    key: "er",
    title: "Modelo Entidad-Relación",
    subtitle: "Nueve entidades, claves y cardinalidades · Tercera Forma Normal (3FN)",
    orientation: "landscape",
    legend: legend([
      ["Identidad", C.indigo],
      ["Viaje", C.teal],
      ["Pagos", C.amber],
      ["Reputación", C.blue],
      ["Patrocinio", C.rose],
    ]),
    legendNote:
      "PK clave primaria · FK clave foránea · UQ valor único · línea punteada: FK opcional de autorización",
    panels: [
      {
        x: 0, y: 110, w: 715, h: 542,
        label: "Usuarios y especializaciones",
        note: "Continúa abajo (panel 2) y a la derecha (panel 3).",
      },
      {
        x: 0, y: 650, w: 715, h: 410,
        label: "Patrocinio y acuerdo",
        note: "Continúa arriba (panel 1) y a la derecha (panel 4).",
      },
      {
        x: 715, y: 110, w: 805, h: 445,
        label: "Viaje y pago",
        note: "Continúa a la izquierda (panel 1) y abajo (panel 4).",
      },
      {
        x: 715, y: 555, w: 805, h: 505,
        label: "Calificación y cierre",
        note: "Continúa arriba (panel 3) y a la izquierda (panel 2).",
      },
    ],
  },
  {
    key: "contexto",
    title: "Diagrama de contexto",
    subtitle: "DFD nivel 0 · un único proceso y cuatro actores externos",
    orientation: "portrait",
    legend: legend([
      ["Flujo de datos", C.slate],
      ["Actor externo", C.indigo],
      ["Frontera del sistema", C.teal],
    ]),
    legendNote: "Los flujos F1–F8 se detallan en la tabla de interfases del dossier.",
    panels: [
      {
        x: 0, y: 70, w: 510, h: 790,
        label: "Actores de demanda",
        note: "Los flujos cortados continúan a la derecha, en el panel 2.",
      },
      {
        x: 510, y: 70, w: 480, h: 790,
        label: "Sistema y actores de oferta",
        note: "Recibe los flujos de los paneles 1 y 3; los verticales están completos.",
      },
      {
        x: 990, y: 70, w: 510, h: 790,
        label: "Actores de gobierno",
        note: "Los flujos cortados continúan a la izquierda, en el panel 2.",
      },
    ],
  },
  {
    key: "dfd1",
    title: "DFD nivel 1 · Vista por dominios",
    subtitle: "Cuatro procesos agregados, almacenes D1–D6 y los actores del sistema",
    orientation: "portrait",
    legend: legend([
      ["Proceso", C.indigo],
      ["Almacén", C.teal],
      ["Flujo", C.slate],
      ["Actor", C.amber],
    ]),
    legendNote: "Los procesos 1.0–4.0 agrupan P01–P12; D5–D6 se desdobla en el DFD 2C.",
    panels: [
      {
        x: 0, y: 70, w: 478, h: 720,
        label: "Identidad y acceso",
        note: "Continúa a la derecha, en el panel 2.",
      },
      {
        x: 478, y: 70, w: 757, h: 720,
        label: "Operación y pagos",
        note: "Recibe los flujos del panel 1 y continúa a la derecha, en el panel 3.",
      },
      {
        x: 1235, y: 70, w: 465, h: 720,
        label: "Servicio y gobierno",
        note: "Recibe los flujos del panel 2; cierra la vista por dominios.",
      },
    ],
  },
  {
    key: "dfd2a",
    title: "DFD nivel 2A · Identidad y acceso",
    subtitle: "P01 Registro de cuentas · P02 Inicio de sesión verificado por rol",
    orientation: "landscape",
    legend: legend([
      ["Proceso", C.indigo],
      ["Almacén", C.teal],
      ["Flujo", C.slate],
      ["Actor", C.indigo],
    ]),
    legendNote: "Un correo pertenece a un solo usuario; cada usuario tiene exactamente un rol.",
    panels: [
      {
        x: 0, y: 70, w: 745, h: 420,
        label: "Actores y procesos",
        note: "Continúa a la derecha, en el panel 2.",
      },
      {
        x: 745, y: 70, w: 455, h: 420,
        label: "Almacén D1 · USUARIO",
        note: "Recibe los flujos del panel 1; aquí se completa la lectura.",
      },
    ],
  },
  {
    key: "dfd2b",
    title: "DFD nivel 2B · Ciclo del viaje",
    subtitle: "P03 solicitud · P04 búsqueda · P05 asignación · P06 cancelación · P07 gestión · P08 precio",
    orientation: "portrait",
    legend: legend([
      ["Proceso", C.teal],
      ["Almacén", C.indigo],
      ["Flujo", C.slate],
      ["Actor", C.indigo],
    ]),
    legendNote: "Cancelaciones y rechazos actualizan el estado; no eliminan el registro del viaje.",
    panels: [
      {
        x: 0, y: 68, w: 610, h: 792,
        label: "Solicitud y cancelación",
        note: "Continúa a la derecha, en el panel 2.",
      },
      {
        x: 610, y: 68, w: 389, h: 792,
        label: "Búsqueda y gestión",
        note: "Recibe el panel 1 y continúa a la derecha, en el panel 3.",
      },
      {
        x: 999, y: 68, w: 361, h: 792,
        label: "Asignación y precio",
        note: "Recibe el panel 2 y continúa a la derecha, en el panel 4.",
      },
      {
        x: 1360, y: 68, w: 240, h: 792,
        label: "Pagos y oferta",
        note: "Recibe el panel 3; aquí se completa el ciclo del viaje.",
      },
    ],
  },
  {
    key: "dfd2c",
    title: "DFD nivel 2C · Dinero, reputación y gobierno",
    subtitle: "P09 pagos · P10 calificación · P11 patrocinio · P12 administración general",
    orientation: "portrait",
    legend: legend([
      ["Proceso", C.amber],
      ["Almacén", C.rose],
      ["Flujo", C.slate],
      ["Actor", C.amber],
    ]),
    legendNote: "El administrador autoriza y revierte liquidaciones; todo cambio queda en D3 para auditoría.",
    panels: [
      {
        x: 0, y: 70, w: 455, h: 790,
        label: "Pagos y liquidación",
        note: "Continúa a la derecha, en el panel 2.",
      },
      {
        x: 455, y: 70, w: 350, h: 790,
        label: "Calificación y viaje",
        note: "Recibe el panel 1 y continúa a la derecha, en el panel 3.",
      },
      {
        x: 805, y: 70, w: 435, h: 790,
        label: "Patrocinio",
        note: "Recibe el panel 2 y continúa a la derecha, en el panel 4.",
      },
      {
        x: 1240, y: 70, w: 460, h: 790,
        label: "Administración y reportes",
        note: "Recibe el panel 3; cierra el nivel 2.",
      },
    ],
  },
];

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

function cropSvg(svg, panel, prefix) {
  const openEnd = svg.indexOf(">");
  const open = svg.slice(0, openEnd);
  const body = svg.slice(openEnd);
  const aria = (open.match(/aria-label="([^"]*)"/) || [])[1] || "Diagrama MotoUber";
  const cropped = `<svg viewBox="${panel.x} ${panel.y} ${panel.w} ${panel.h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">${body}`;
  return namespaceSvg(cropped, prefix);
}

let pageNumber = 0;
const totalDiagramPages = DIAGRAMS.reduce((n, d) => n + d.panels.length, 0);
const ranges = [];
let cursor = 2;
for (const d of DIAGRAMS) {
  ranges.push([d, cursor, cursor + d.panels.length - 1]);
  cursor += d.panels.length;
}

const coverRows = ranges
  .map(
    ([d, from, to]) => `<tr>
      <td><strong>${esc(d.title)}</strong><span>${esc(d.subtitle)}</span></td>
      <td class="num">${d.panels.length}</td>
      <td class="num">${from}–${to}</td>
    </tr>`
  )
  .join("");

const cover = `<section class="page page--cover">
  <div class="cover__top">
    <div class="cover__brand"><span class="cover__mark">M</span> MotoUber</div>
    <div class="eyebrow">Documentación de ingeniería · Edición para impresión</div>
    <h1>Diagramas del sistema</h1>
    <p class="cover__lead">Modelo entidad-relación, diagrama de contexto y DFD de nivel 1 y 2.
    Cada diagrama se divide en paneles ampliados para que las etiquetas se lean en papel carta
    sin acercarse a la hoja.</p>
  </div>

  <div class="cover__card">
    <h2>Contenido</h2>
    <table class="cover__table">
      <thead><tr><th>Diagrama</th><th class="num">Paneles</th><th class="num">Páginas</th></tr></thead>
      <tbody>${coverRows}</tbody>
    </table>
  </div>

  <div class="cover__notes">
    <div><strong>Papel</strong><span>Carta / letter · 8.5 × 11 in</span></div>
    <div><strong>Márgenes</strong><span>8 mm en los cuatro lados</span></div>
    <div><strong>Escala</strong><span>100 % · sin ajustar a la página</span></div>
    <div><strong>Color</strong><span>Imprimir en color para conservar la notación</span></div>
  </div>

  <p class="cover__foot">Cada panel indica su número y los paneles vecinos. Las líneas que llegan
  al borde continúan en el panel adyacente; no falta información. Total: ${totalDiagramPages} paneles
  de diagramas en ${cursor - 1} páginas.</p>
</section>`;

const pages = [];
for (const d of DIAGRAMS) {
  d.panels.forEach((panel, index) => {
    pageNumber++;
    const n = d.panels.length;
    const prefix = `${d.key}-p${index + 1}`;
    const svg = cropSvg(svgs[d.key], panel, prefix);
    const orientationClass = d.orientation === "landscape" ? " page--landscape" : "";
    pages.push(`<section class="page${orientationClass}" data-diagram="${d.key}" data-panel="${index + 1}">
  <header class="page__head">
    <div class="head__main">
      <div class="eyebrow">MotoUber · Diagramas técnicos</div>
      <h1>${esc(d.title)}</h1>
      <p class="subtitle">${esc(d.subtitle)}</p>
      <div class="legend">${d.legend}</div>
    </div>
    <div class="head__side">
      <span class="badge">Panel ${index + 1} de ${n}</span>
      <span class="panel-label">${esc(panel.label)}</span>
    </div>
  </header>
  <div class="page__panel">${svg}</div>
  <footer class="page__foot">
    <span><strong>Panel ${index + 1} de ${n}</strong> · ${esc(panel.label)} · ${esc(d.legendNote)}</span>
    <span class="foot__note">${esc(panel.note)}</span>
  </footer>
</section>`);
  });
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MotoUber · Diagramas para impresión (carta)</title>
<meta name="description" content="Edición para impresión en papel carta de los diagramas del sistema MotoUber.">
<style>
  @page { size: letter; margin: 8mm; }
  @page landscape { size: letter landscape; margin: 8mm; }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; }
  body {
    font-family: 'Segoe UI', Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 100%;
    height: 262mm;
    display: flex;
    flex-direction: column;
    break-after: page;
    page-break-after: always;
    overflow: hidden;
    page: auto;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .page--landscape { page: landscape; height: 198mm; }

  .page__head {
    flex: 0 0 18mm;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6mm;
    padding: 0 0 2.2mm;
    border-bottom: 0.6pt solid #cbd5e1;
  }
  .page--landscape .page__head { flex-basis: 16mm; }

  .head__main { min-width: 0; }
  .eyebrow {
    font-size: 6.5pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748b;
  }
  .page__head h1 {
    margin: 0.6mm 0 0;
    font-size: 13pt;
    line-height: 1.12;
    font-weight: 750;
    letter-spacing: -0.01em;
    color: #0f172a;
  }
  .page--landscape .page__head h1 { font-size: 12pt; }
  .subtitle {
    margin: 0.7mm 0 0;
    font-size: 7.4pt;
    line-height: 1.25;
    color: #475569;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5mm 4mm;
    margin-top: 1.3mm;
    font-size: 6.6pt;
    font-weight: 600;
    color: #475569;
  }
  .legend__item { display: inline-flex; align-items: center; gap: 1.2mm; }
  .legend__item i {
    width: 2.2mm; height: 2.2mm; border-radius: 0.6mm; display: inline-block;
  }

  .head__side {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1.2mm;
    text-align: right;
  }
  .badge {
    display: inline-block;
    padding: 1mm 2.4mm;
    border: 0.7pt solid #c7d2fe;
    border-radius: 2mm;
    background: #eef2ff;
    color: #4338ca;
    font-size: 7.2pt;
    font-weight: 750;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .panel-label {
    max-width: 58mm;
    font-size: 7pt;
    font-weight: 650;
    line-height: 1.2;
    color: #334155;
  }

  .page__panel {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 1.2mm 0;
  }
  .page__panel svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .page__foot {
    flex: 0 0 10mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6mm;
    padding-top: 1.4mm;
    border-top: 0.6pt solid #e2e8f0;
    font-size: 6.6pt;
    line-height: 1.25;
    color: #64748b;
  }
  .page--landscape .page__foot { flex-basis: 8mm; }
  .page__foot strong { color: #334155; font-weight: 750; }
  .foot__note { text-align: right; color: #4338ca; font-weight: 650; }

  /* Portada */
  .page--cover { height: 262mm; justify-content: flex-start; }
  .cover__top { padding-top: 6mm; border-bottom: 0.8pt solid #cbd5e1; padding-bottom: 8mm; }
  .cover__brand {
    display: flex; align-items: center; gap: 2.5mm;
    font-size: 9pt; font-weight: 750; letter-spacing: 0.04em; color: #4338ca;
    margin-bottom: 8mm;
  }
  .cover__mark {
    display: inline-grid; place-items: center;
    width: 8mm; height: 8mm; border-radius: 2mm;
    background: #4338ca; color: #fff; font-size: 12pt; font-weight: 800;
  }
  .page--cover h1 {
    margin: 2mm 0 0;
    font-size: 30pt;
    line-height: 1.05;
    letter-spacing: -0.025em;
    color: #0f172a;
  }
  .cover__lead {
    max-width: 150mm;
    margin: 4mm 0 0;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #334155;
  }
  .cover__card {
    margin-top: 8mm;
    border: 0.7pt solid #cbd5e1;
    border-radius: 3mm;
    padding: 5mm 6mm;
    background: #f8fafc;
  }
  .cover__card h2 {
    margin: 0 0 3mm;
    font-size: 8pt;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4338ca;
  }
  .cover__table { width: 100%; border-collapse: collapse; }
  .cover__table th {
    padding: 0 0 2mm;
    border-bottom: 0.6pt solid #cbd5e1;
    font-size: 6.8pt; font-weight: 750; letter-spacing: 0.08em;
    text-transform: uppercase; color: #64748b; text-align: left;
  }
  .cover__table td {
    padding: 2.2mm 0;
    border-bottom: 0.5pt solid #e2e8f0;
    vertical-align: top;
    font-size: 8.2pt;
    color: #0f172a;
  }
  .cover__table tr:last-child td { border-bottom: 0; }
  .cover__table td span { display: block; margin-top: 0.7mm; font-size: 6.8pt; color: #64748b; }
  .cover__table .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .cover__table th.num { text-align: right; }
  .cover__notes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3mm 8mm;
    margin-top: 7mm;
  }
  .cover__notes div {
    padding-left: 3mm;
    border-left: 1.2mm solid #e0e7ff;
  }
  .cover__notes strong { display: block; font-size: 7pt; letter-spacing: 0.06em; text-transform: uppercase; color: #4338ca; }
  .cover__notes span { display: block; margin-top: 0.6mm; font-size: 8pt; color: #334155; }
  .cover__foot {
    margin-top: auto;
    padding-top: 5mm;
    border-top: 0.6pt solid #e2e8f0;
    font-size: 7.2pt;
    line-height: 1.4;
    color: #64748b;
  }

  @media screen {
    body { background: #e2e8f0; padding: 8mm 0; }
    .page {
      background: #fff;
      margin: 0 auto 8mm;
      box-shadow: 0 1px 3px rgba(15,23,42,.14), 0 10px 30px rgba(15,23,42,.10);
      padding: 0;
      width: 199.9mm;
      height: 263.4mm;
    }
    .page--landscape { width: 263.4mm; height: 199.9mm; }
    .page--cover { width: 199.9mm; height: 263.4mm; }
  }
</style>
</head>
<body>
${cover}
${pages.join("\n")}
</body>
</html>
`;

fs.writeFileSync(OUT, html, "utf8");
console.log(`✓ ${path.basename(OUT)}  ${(html.length / 1024).toFixed(1)} KB`);
console.log(`  Portada + ${totalDiagramPages} paneles = ${cursor - 1} páginas`);
for (const [d, from, to] of ranges) {
  console.log(`  ${d.key.padEnd(9)} ${d.panels.length} paneles  págs. ${from}–${to}`);
}
