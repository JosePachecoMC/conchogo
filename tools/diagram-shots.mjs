/**
 * Captura cada diagrama por separado para revisión visual.
 * Uso: node tools/diagram-shots.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "shots", "diagrams");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const PORT = 9335;
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

fs.mkdirSync(OUT, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "motouber-diag-"));
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

  for (const page of PAGES) {
    const url = pathToFileURL(path.join(ROOT, page)).href;
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url });
    await loaded;
    await sleep(700);

    const { result } = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        window.scrollTo(0, 0);
        const page = ${JSON.stringify(page.replace(/\.html$/, ""))};
        return [...document.querySelectorAll('.figure__canvas svg')].map((svg, i) => {
          const r = svg.getBoundingClientRect();
          const fig = svg.closest('figure');
          const name = fig?.dataset?.name || svg.getAttribute('aria-label') || 'diagrama';
          return {
            name: page + '-' + String(i + 1).padStart(2, '0') + '-' + name,
            x: r.left + window.scrollX,
            y: r.top + window.scrollY,
            w: r.width,
            h: r.height,
            label: svg.getAttribute('aria-label')
          };
        });
      })()`,
    });

    for (const d of result.value) {
      const scale = Math.min(2, 4200 / d.w);
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: d.x, y: d.y, width: d.w, height: d.h, scale },
      });
      const safe = d.name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
      fs.writeFileSync(path.join(OUT, `${safe}.png`), Buffer.from(shot.data, "base64"));
      console.log(`${safe}.png  ${Math.round(d.w)}x${Math.round(d.h)} @${scale.toFixed(2)}  ${d.label}`);
    }
  }
} finally {
  try { ws?.close(); } catch {}
  brave.kill();
  await sleep(400);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
