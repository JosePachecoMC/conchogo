/**
 * Verifica que los recortes de diagramas-print.html no partan cajas ni etiquetas.
 * Uso: node tools/verify-print.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML = path.join(ROOT, "diagramas-print.html");
const html = fs.readFileSync(HTML, "utf8");

const num = (attrs, name, fallback = 0) => {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]+)"`));
  return m ? parseFloat(m[1]) : fallback;
};

const cleanText = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const sections = [...html.matchAll(/<section class="page([^"]*)" data-diagram="([^"]+)" data-panel="([^"]+)">([\s\S]*?)<\/section>/g)];
if (!sections.length) throw new Error("No se encontraron paneles en diagramas-print.html");

let cutRects = 0;
let cutTexts = 0;
let checkedRects = 0;
let checkedTexts = 0;

for (const section of sections) {
  const [, cls, diagram, panelNo, body] = section;
  const svgMatch = body.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/);
  if (!svgMatch) continue;
  const svgAttrs = svgMatch[1];
  const svgBody = svgMatch[2];
  const vb = (svgAttrs.match(/viewBox="([^"]+)"/) || [])[1];
  if (!vb) continue;
  const [px, py, pw, ph] = vb.split(/\s+/).map(Number);
  const eps = 1.5;
  const inside = (x, y, w, h) =>
    x >= px - eps && y >= py - eps && x + w <= px + pw + eps && y + h <= py + ph + eps;
  const intersects = (x, y, w, h) =>
    x < px + pw && x + w > px && y < py + ph && y + h > py;

  const rects = [...svgBody.matchAll(/<rect\b([^>]*)\/?>/g)];
  for (const r of rects) {
    const attrs = r[1];
    const x = num(attrs, "x");
    const y = num(attrs, "y");
    const w = num(attrs, "width");
    const h = num(attrs, "height");
    if (w <= 0 || h <= 0) continue;
    if (x === 0 && y === 0 && w > 1000 && h > 500) continue; // fondo del SVG
    if (!intersects(x, y, w, h)) continue;
    checkedRects++;
    if (!inside(x, y, w, h)) {
      cutRects++;
      console.log(`RECT cortado  ${diagram} p${panelNo}  x=${x} y=${y} w=${w} h=${h}  panel=${vb}`);
    }
  }

  const texts = [...svgBody.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)];
  for (const t of texts) {
    const attrs = t[1];
    const content = cleanText(t[2]);
    if (!content) continue;
    const x = num(attrs, "x");
    const y = num(attrs, "y");
    const style = (attrs.match(/style="([^"]*)"/) || [])[1] || "";
    const size = (style.match(/font-size:([\d.]+)px/) || [])[1];
    if (!size) continue;
    const fs = parseFloat(size);
    const anchor = (style.match(/text-anchor:([a-z]+)/) || [])[1] || "start";
    const w = Math.max(fs * 0.55, content.length * fs * 0.56);
    const h = fs * 1.1;
    let x0 = x;
    if (anchor === "middle") x0 = x - w / 2;
    else if (anchor === "end") x0 = x - w;
    const y0 = y - fs * 0.82;
    if (!intersects(x0, y0, w, h)) continue;
    checkedTexts++;
    if (!inside(x0, y0, w, h)) {
      cutTexts++;
      console.log(`TEXTO cortado ${diagram} p${panelNo}  "${content.slice(0, 60)}"  x=${x} y=${y} size=${fs}  panel=${vb}`);
    }
  }
}

console.log(`\nPaneles: ${sections.length} · rects revisados: ${checkedRects} · textos revisados: ${checkedTexts}`);
console.log(`Cortes: ${cutRects} rects, ${cutTexts} textos`);
if (cutRects || cutTexts) process.exitCode = 1;
