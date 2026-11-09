/**
 * Verificación de renderizado con Brave/Chromium vía DevTools Protocol.
 * Uso: node tools/verify.mjs
 *
 * No sustituye la revisión visual, pero detecta desbordes, anclas rotas,
 * texto fuera del viewBox y errores de consola en las cuatro páginas.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const PORT = 9333;
const PAGES = ["index.html", "modelo-er.html", "contexto.html", "dfd.html"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(url, tries = 80) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    await sleep(250);
  }
  throw new Error(`No responde: ${url}`);
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        const list = this.events.get(msg.method) || [];
        list.forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, fn) {
    const list = this.events.get(method) || [];
    list.push(fn);
    this.events.set(method, list);
  }
  once(method) {
    return new Promise((resolve) => {
      const fn = (params) => {
        const list = this.events.get(method) || [];
        this.events.set(method, list.filter((f) => f !== fn));
        resolve(params);
      };
      this.on(method, fn);
    });
  }
}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "motouber-cdp-"));
const brave = spawn(BRAVE, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--window-size=1440,1000",
  "--remote-allow-origins=*",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore" });

let ws;
try {
  const version = await waitFor(`http://127.0.0.1:${PORT}/json/version`);
  console.log(`Brave ${version.Browser}`);
  const targets = await waitFor(`http://127.0.0.1:${PORT}/json/list`);
  const target = targets.find((t) => t.type === "page");
  if (!target) throw new Error("No hay pestaña disponible");

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");

  const consoleErrors = [];
  cdp.on("Runtime.consoleAPICalled", (p) => {
    if (p.type === "error" || p.type === "warning") {
      consoleErrors.push(`${p.type}: ${p.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
    }
  });
  cdp.on("Runtime.exceptionThrown", (p) => {
    consoleErrors.push(`exception: ${p.exceptionDetails?.text || "desconocida"}`);
  });
  cdp.on("Log.entryAdded", (p) => {
    if (p.entry.level === "error") consoleErrors.push(`log: ${p.entry.text}`);
  });

  const results = [];
  for (const page of PAGES) {
    const url = pathToFileURL(path.join(ROOT, page)).href;
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url });
    await loaded;
    await sleep(700);

    const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `(() => {
        const round = (n) => Math.round(n * 10) / 10;
        const box = (el) => { const r = el.getBoundingClientRect(); return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) }; };
        const unresolved = (document.body.innerText.match(/\\{\\{[^}]+\\}\\}/g) || []);
        const missingAnchors = [...document.querySelectorAll('a[href^="#"]')]
          .map(a => a.getAttribute('href'))
          .filter(h => h.length > 1 && !document.querySelector(h));
        const overflow = [...document.querySelectorAll('body *')]
          .filter(el => {
            if (el.closest('svg') || el.closest('.table-wrap') || el.classList.contains('skip-link')) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2);
          })
          .slice(0, 15)
          .map(el => ({ tag: el.tagName, cls: typeof el.className === 'string' ? el.className : '', box: box(el) }));
        const figures = [...document.querySelectorAll('.figure__canvas svg')].map(svg => {
          const vb = svg.viewBox.baseVal;
          const b = svg.getBBox();
          const outTexts = [...svg.querySelectorAll('text')].map(t => {
            const tb = t.getBBox();
            const out = tb.x < -0.5 || tb.y < -0.5 || tb.x + tb.width > vb.width + 0.5 || tb.y + tb.height > vb.height + 0.5;
            return out ? { text: t.textContent.slice(0, 70), x: round(tb.x), y: round(tb.y), w: round(tb.width), h: round(tb.height) } : null;
          }).filter(Boolean);
          return {
            aria: svg.getAttribute('aria-label'),
            viewBox: [vb.x, vb.y, vb.width, vb.height],
            bbox: { x: round(b.x), y: round(b.y), w: round(b.width), h: round(b.height) },
            outside: b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5,
            outTexts,
            css: box(svg),
          };
        });
        const textOverlaps = [];
        const boxOverlaps = [];
        const foreignText = [];
        for (const svg of document.querySelectorAll('.figure__canvas svg')) {
          const texts = [...svg.querySelectorAll('text')].map(t => {
            const b = t.getBBox();
            return { text: t.textContent.trim().slice(0, 48), x: b.x, y: b.y, w: b.width, h: b.height };
          }).filter(t => t.w > 0 && t.h > 0);
          for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
              const a = texts[i], b = texts[j];
              const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
              const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
              if (ix > 1 && iy > 1) {
                const area = ix * iy;
                const minArea = Math.min(a.w * a.h, b.w * b.h);
                if (area > minArea * 0.18) textOverlaps.push({ a: a.text, b: b.text, area: round(area), minArea: round(minArea) });
              }
            }
          }
          const rects = [...svg.querySelectorAll('rect')].map(r => {
            const b = r.getBBox();
            return { x: b.x, y: b.y, w: b.width, h: b.height };
          }).filter(r => r.w > 100 && r.h > 50 && r.w < 700 && r.h < 500);
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i], b = rects[j];
              const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
              const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
              if (ix > 2 && iy > 2) {
                const area = ix * iy;
                const minArea = Math.min(a.w * a.h, b.w * b.h);
                if (area > minArea * 0.12) boxOverlaps.push({ a: { x: round(a.x), y: round(a.y), w: round(a.w), h: round(a.h) }, b: { x: round(b.x), y: round(b.y), w: round(b.w), h: round(b.h) }, area: round(area) });
              }
            }
          }
          const visibleRects = rects.filter(r => r.w < 450 && r.h < 250);
          for (const t of texts) {
            const cx = t.x + t.w / 2;
            const cy = t.y + t.h / 2;
            for (const r of visibleRects) {
              const inside = cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h;
              if (inside) continue;
              const ix = Math.min(t.x + t.w, r.x + r.w) - Math.max(t.x, r.x);
              const iy = Math.min(t.y + t.h, r.y + r.h) - Math.max(t.y, r.y);
              if (ix > 1 && iy > 1) {
                const area = ix * iy;
                if (area > (t.w * t.h) * 0.15 && area > 20) {
                  foreignText.push({ text: t.text, box: { x: round(r.x), y: round(r.y), w: round(r.w), h: round(r.h) }, area: round(area) });
                }
              }
            }
          }
        }
        const tableOverflow = [...document.querySelectorAll('.table-wrap')]
          .map(w => ({ scroll: w.scrollWidth, client: w.clientWidth }))
          .filter(x => x.scroll > x.client + 2);
        const sections = [...document.querySelectorAll('section.section')].map(s => ({ id: s.id, h: round(s.getBoundingClientRect().height) }));        const textEls = [...document.querySelectorAll('p,li,td,h1,h2,h3,h4,span')]
          .filter(el => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0)
          .slice(0, 10)
          .map(el => ({ tag: el.tagName, cls: typeof el.className === 'string' ? el.className : '', text: el.textContent.trim().slice(0, 60) }));
        return {
          title: document.title,
          url: location.href,
          width: window.innerWidth,
          docWidth: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
          unresolved,
          missingAnchors,
          overflow,
          tableOverflow,
          textOverflow: textEls,
          textOverlaps: textOverlaps.slice(0, 40),
          boxOverlaps: boxOverlaps.slice(0, 40),
          foreignText: foreignText.slice(0, 40),
          figures,
          sections,
          svgTotal: document.querySelectorAll('svg').length,
          brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src),
        };
      })()`,
    });
    if (exceptionDetails) {
      console.error(`\n${page}: error de evaluación`);
      console.error(exceptionDetails.exception?.description || exceptionDetails.text);
      results.push({ page, error: exceptionDetails.text, consoleErrors: [...consoleErrors] });
      continue;
    }
    results.push({ page, ...result.value, consoleErrors: [...consoleErrors] });
    consoleErrors.length = 0;
  }

  fs.writeFileSync(path.join(ROOT, "tools", "verify-report.json"), JSON.stringify(results, null, 2), "utf8");
  for (const r of results) {
    if (r.error) { console.log(`\n=== ${r.page} === ERROR: ${r.error}`); continue; }
    console.log(`\n=== ${r.page} ===`);
    console.log(`title: ${r.title}`);
    console.log(`viewport: ${r.width}  doc: ${r.docWidth}  height: ${r.height}  overflowX: ${r.horizontalOverflow}`);
    console.log(`unresolved: ${r.unresolved.length}  missingAnchors: ${r.missingAnchors.length}  brokenImages: ${r.brokenImages.length}`);
    console.log(`overflow elements: ${r.overflow.length}  table overflow: ${r.tableOverflow.length}  text overflow: ${r.textOverflow.length}`);
    console.log(`text overlaps: ${r.textOverlaps.length}  box overlaps: ${r.boxOverlaps.length}  foreign text: ${r.foreignText.length}`);
    console.log(`sections: ${r.sections.length}  svg total: ${r.svgTotal}`);
    for (const f of r.figures) {
      console.log(`  SVG ${f.viewBox.join("x")} bbox ${f.bbox.w}x${f.bbox.h} outside=${f.outside} outTexts=${f.outTexts.length}`);
      f.outTexts.forEach(t => console.log(`    text outside: ${t.text} @ ${t.x},${t.y} ${t.w}x${t.h}`));
    }
    if (r.overflow.length) console.log("  overflow sample:", JSON.stringify(r.overflow.slice(0, 5)));
    if (r.textOverflow.length) console.log("  text overflow sample:", JSON.stringify(r.textOverflow.slice(0, 5)));
    if (r.missingAnchors.length) console.log("  missing anchors:", r.missingAnchors.join(", "));
    if (r.textOverlaps.length) console.log("  text overlaps:", JSON.stringify(r.textOverlaps.slice(0, 8)));
    if (r.boxOverlaps.length) console.log("  box overlaps:", JSON.stringify(r.boxOverlaps.slice(0, 8)));
    if (r.foreignText.length) console.log("  foreign text:", JSON.stringify(r.foreignText.slice(0, 8)));
    if (r.consoleErrors.length) console.log("  console:", r.consoleErrors.join(" | "));
  }
} finally {
  try { ws?.close(); } catch {}
  brave.kill();
  await sleep(400);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
