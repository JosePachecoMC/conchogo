/**
 * Genera el PDF de impresión carta desde diagramas-print.html con Brave/Chromium.
 * Uso: node tools/print-diagrams.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML = path.join(ROOT, "diagramas-print.html");
const PDF = path.join(ROOT, "Diagramas-MotoUber-carta.pdf");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const PORT = 9335;

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
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
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
  once(method) {
    return new Promise((resolve) => {
      const onMsg = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.method === method) {
          this.ws.removeEventListener("message", onMsg);
          resolve(msg.params);
        }
      };
      this.ws.addEventListener("message", onMsg);
    });
  }
}

if (!fs.existsSync(HTML)) throw new Error("Falta diagramas-print.html; ejecuta node tools/build-print.mjs");

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "motouber-print-"));
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

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: pathToFileURL(HTML).href });
  await loaded;
  await sleep(900);

  const evalRes = await cdp.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const out = [];
      document.querySelectorAll('.page').forEach((page) => {
        const svg = page.querySelector('svg');
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const sizes = [...svg.querySelectorAll('text')].map((t) => parseFloat(getComputedStyle(t).fontSize)).filter((n) => n > 0);
        out.push({
          cls: page.className,
          panel: page.dataset.panel || '',
          diagram: page.dataset.diagram || '',
          rect: { w: rect.width, h: rect.height },
          vb: { w: vb.width, h: vb.height },
          min: Math.min(...sizes),
          max: Math.max(...sizes),
          count: sizes.length,
        });
      });
      return out;
    })()`,
  });
  const panels = evalRes.result.value || [];
  const PX_PER_PT = 96 / 72;
  console.log("Panel            Escala   Texto mín.   Texto máx.   <7 pt");
  for (const p of panels) {
    const scale = Math.min(p.rect.w / p.vb.w, p.rect.h / p.vb.h);
    const minPt = (p.min * scale) / PX_PER_PT;
    const maxPt = (p.max * scale) / PX_PER_PT;
    console.log(
      `${(p.diagram + " p" + p.panel).padEnd(15)} ${scale.toFixed(3).padStart(6)}   ${minPt.toFixed(2).padStart(6)} pt   ${maxPt.toFixed(2).padStart(6)} pt   ${minPt < 7 ? "sí" : "no"}`
    );
  }

  const pdf = await cdp.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
  });
  fs.writeFileSync(PDF, Buffer.from(pdf.data, "base64"));
  console.log(`\nPDF ${path.basename(PDF)}  ${(fs.statSync(PDF).size / 1024).toFixed(0)} KB`);
} finally {
  try { ws?.close(); } catch {}
  brave.kill();
  await sleep(400);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
