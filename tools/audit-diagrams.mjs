/**
 * Auditoría geométrica de los diagramas:
 *  - extremos de flujo en esquinas o flotantes
 *  - cruces entre flujos
 *  - líneas que atraviesan etiquetas o cajas
 *  - marcadores inexistentes
 * Uso: node tools/audit-diagrams.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const PORT = 9336;
const PAGES = ["modelo-er.html", "contexto.html", "dfd.html"];
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
        (this.events.get(msg.method) || []).forEach((fn) => fn(msg.params));
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

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "motouber-audit-"));
const brave = spawn(BRAVE, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--window-size=1440,1000", "--remote-allow-origins=*",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });

let ws;
try {
  await waitFor(`http://127.0.0.1:${PORT}/json/version`);
  const targets = await waitFor(`http://127.0.0.1:${PORT}/json/list`);
  const target = targets.find((t) => t.type === "page");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  for (const page of PAGES) {
    const url = pathToFileURL(path.join(ROOT, page)).href;
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url });
    await loaded;
    await sleep(600);

    const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const R = (n) => Math.round(n * 10) / 10;
        const out = [];

        const segIntersect = (a, b) => {
          const x1=a[0], y1=a[1], x2=a[2], y2=a[3], x3=b[0], y3=b[1], x4=b[2], y4=b[3];
          const d = (x2-x1)*(y4-y3) - (y2-y1)*(x4-x3);
          if (Math.abs(d) < 1e-9) return null;
          const t = ((x3-x1)*(y4-y3) - (y3-y1)*(x4-x3)) / d;
          const u = ((x3-x1)*(y2-y1) - (y3-y1)*(x2-x1)) / d;
          if (t < 0.001 || t > 0.999 || u < 0.001 || u > 0.999) return null;
          return [x1 + t*(x2-x1), y1 + t*(y2-y1)];
        };

        const sample = (p, step = 2.5) => {
          const L = p.getTotalLength();
          const n = Math.max(2, Math.ceil(L / step));
          const pts = [];
          for (let i=0; i<=n; i++) {
            const q = p.getPointAtLength((L*i)/n);
            pts.push([q.x, q.y]);
          }
          return pts;
        };

        for (const svg of document.querySelectorAll('.figure__canvas svg')) {
          const vb = svg.viewBox.baseVal;
          const label = svg.getAttribute('aria-label');
          const issues = { endpoints: [], crossings: [], textHits: [], boxHits: [], markers: [], duplicates: [], symbolHits: [] };

          const markerPaths = [...svg.querySelectorAll('path[marker-end]')];
          const relationPaths = [...svg.querySelectorAll('path[fill="none"]')]
            .filter(p => !p.getAttribute('marker-end') && !p.closest('defs') && !p.closest('g[transform]') && p.getTotalLength() > 60);
          const flows = [...markerPaths, ...relationPaths].map((p, i) => {
            const pts = sample(p);
            return { i, p, pts, len: p.getTotalLength(), marker: p.getAttribute('marker-end'), stroke: p.getAttribute('stroke') };
          });

          // Marcadores
          for (const f of flows) {
            if (!f.marker) continue;
            const m = /#([^)]+)/.exec(f.marker);
            if (!m || !svg.getElementById(m[1])) issues.markers.push('flujo ' + (f.i+1) + ': ' + f.marker);
          }

          // Rectángulos de cajas (procesos, actores, almacenes, entidades)
          const boxes = [...svg.querySelectorAll('rect')].map(r => {
            const b = r.getBBox();
            return { x: b.x, y: b.y, w: b.width, h: b.height };
          }).filter(b => b.w >= 140 && b.h >= 55 && !(b.w > vb.width * 0.75 && b.h > vb.height * 0.75));

          // Extremos: cerca de caja o esquina
          for (const f of flows) {
            for (const end of [f.pts[0], f.pts[f.pts.length - 1]]) {
              let best = null;
              for (const b of boxes) {
                const onV = (Math.abs(end[0]-b.x) <= 2 || Math.abs(end[0]-(b.x+b.w)) <= 2) && end[1] >= b.y-2 && end[1] <= b.y+b.h+2;
                const onH = (Math.abs(end[1]-b.y) <= 2 || Math.abs(end[1]-(b.y+b.h)) <= 2) && end[0] >= b.x-2 && end[0] <= b.x+b.w+2;
                if (onV || onH) {
                  const corners = [[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]];
                  const dc = Math.min(...corners.map(c => Math.hypot(c[0]-end[0], c[1]-end[1])));
                  best = { b, corner: dc };
                  break;
                }
              }
              if (!best) issues.endpoints.push({ flow: f.i+1, at: [R(end[0]), R(end[1])], why: 'sin caja' });
              else if (best.corner < 13) issues.endpoints.push({ flow: f.i+1, at: [R(end[0]), R(end[1])], why: 'esquina (' + R(best.corner) + 'px)' });
            }
          }

          // Cruces entre flujos
          for (let i=0; i<flows.length; i++) {
            for (let j=i+1; j<flows.length; j++) {
              const A = flows[i], B = flows[j];
              let hit = null;
              for (let a=0; a<A.pts.length-1 && !hit; a++) {
                for (let b=0; b<B.pts.length-1; b++) {
                  const q = segIntersect([...A.pts[a], ...A.pts[a+1]], [...B.pts[b], ...B.pts[b+1]]);
                  if (!q) continue;
                  const dA = Math.min(Math.hypot(q[0]-A.pts[0][0], q[1]-A.pts[0][1]), Math.hypot(q[0]-A.pts[A.pts.length-1][0], q[1]-A.pts[A.pts.length-1][1]));
                  const dB = Math.min(Math.hypot(q[0]-B.pts[0][0], q[1]-B.pts[0][1]), Math.hypot(q[0]-B.pts[B.pts.length-1][0], q[1]-B.pts[B.pts.length-1][1]));
                  if (dA > 8 && dB > 8) { hit = q; break; }
                }
              }
              if (hit) issues.crossings.push({ a: A.i+1, b: B.i+1, at: [R(hit[0]), R(hit[1])] });
            }
          }

          // Texto atravesado por flujos
          const texts = [...svg.querySelectorAll('text')].map(t => {
            const b = t.getBBox();
            return { s: t.textContent.trim().slice(0, 55), x: b.x, y: b.y, w: b.width, h: b.height, el: t };
          }).filter(t => t.w > 1 && t.h > 1);
          for (const f of flows) {
            for (const t of texts) {
              for (let k=0; k<f.pts.length-1; k++) {
                const [x1,y1] = f.pts[k], [x2,y2] = f.pts[k+1];
                const q = segIntersect([x1,y1,x2,y2], [t.x, t.y, t.x+t.w, t.y]);
                const q2 = segIntersect([x1,y1,x2,y2], [t.x, t.y+t.h, t.x+t.w, t.y+t.h]);
                const q3 = segIntersect([x1,y1,x2,y2], [t.x, t.y, t.x, t.y+t.h]);
                const q4 = segIntersect([x1,y1,x2,y2], [t.x+t.w, t.y, t.x+t.w, t.y+t.h]);
                const inside = (x1 > t.x+0.5 && x1 < t.x+t.w-0.5 && y1 > t.y+0.5 && y1 < t.y+t.h-0.5);
                if (q || q2 || q3 || q4 || inside) {
                  issues.textHits.push({ flow: f.i+1, text: t.s, box: [R(t.x),R(t.y),R(t.w),R(t.h)] });
                  break;
                }
              }
            }
          }

          // Flujos atravesando cajas
          for (const f of flows) {
            for (const b of boxes) {
              let hit = false;
              for (let k=0; k<f.pts.length-1 && !hit; k++) {
                const [x1,y1] = f.pts[k], [x2,y2] = f.pts[k+1];
                for (const yy of [b.y+2, b.y+b.h/2, b.y+b.h-2]) {
                  const q = segIntersect([x1,y1,x2,y2], [b.x+2, yy, b.x+b.w-2, yy]);
                  if (q) { hit = true; break; }
                }
                if (!hit) for (const xx of [b.x+2, b.x+b.w/2, b.x+b.w-2]) {
                  const q = segIntersect([x1,y1,x2,y2], [xx, b.y+2, xx, b.y+b.h-2]);
                  if (q) { hit = true; break; }
                }
              }
              if (hit) issues.boxHits.push({ flow: f.i+1, box: [R(b.x),R(b.y),R(b.w),R(b.h)] });
            }
          }

          // Símbolos de cardinalidad dentro de una caja o encima de un texto
          const crowfeet = [...svg.querySelectorAll('g.crowfoot')].map(g => {
            const r = g.getBoundingClientRect();
            return { r, t: g.getAttribute('transform'), html: g.innerHTML.slice(0, 80) };
          });
          const boxRects = [...svg.querySelectorAll('rect')]
            .filter(r => !r.closest('defs'))
            .map(r => ({ r: r.getBoundingClientRect(), el: r }))
            .filter(o => o.r.width >= 70 && o.r.height >= 40 && !(o.r.width > svg.getBoundingClientRect().width * 0.8 && o.r.height > svg.getBoundingClientRect().height * 0.8));
          for (const s of crowfeet) {
            for (const b of boxRects) {
              const ix = Math.min(s.r.right, b.r.right) - Math.max(s.r.left, b.r.left);
              const iy = Math.min(s.r.bottom, b.r.bottom) - Math.max(s.r.top, b.r.top);
              if (ix > 2 && iy > 2) issues.symbolHits.push({ symbol: s.t, box: [R(b.r.left), R(b.r.top), R(b.r.width), R(b.r.height)], area: R(ix * iy) });
            }
            for (const t of texts) {
              const tr = t.el.getBoundingClientRect();
              const ix = Math.min(s.r.right, tr.right) - Math.max(s.r.left, tr.left);
              const iy = Math.min(s.r.bottom, tr.bottom) - Math.max(s.r.top, tr.top);
              if (ix > 1.5 && iy > 1.5) issues.symbolHits.push({ symbol: s.t, text: t.s, area: R(ix * iy) });
            }
          }
          const ids = texts.map(t => t.s).filter(s => /^F\\d+$/.test(s));
          const seen = new Set();
          for (const id of ids) { if (seen.has(id)) issues.duplicates.push(id); seen.add(id); }

          out.push({ label, issues, flowCount: flows.length, boxCount: boxes.length });
        }
        return out;
      })()`,
    });
    if (exceptionDetails) {
      console.log("ERROR", page, exceptionDetails.exception?.description || exceptionDetails.text);
      continue;
    }
    for (const d of result.value) {
      const n = Object.values(d.issues).reduce((a, v) => a + v.length, 0);
      console.log(`\n=== ${d.label} · ${d.flowCount} flujos, ${d.boxCount} cajas · ${n} avisos ===`);
      for (const [kind, list] of Object.entries(d.issues)) {
        if (!list.length) continue;
        console.log(` ${kind}:`);
        for (const x of list.slice(0, 20)) console.log("   " + JSON.stringify(x));
      }
    }
  }
} finally {
  try { ws?.close(); } catch {}
  brave.kill();
  await sleep(400);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
