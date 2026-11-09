/**
 * Captura de pantalla y PDF de verificación con Brave/Chromium vía DevTools Protocol.
 * Uso: node tools/screens.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "shots");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const PORT = 9334;
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
      const fn = (params) => {
        this.ws.removeEventListener("message", onMsg);
        resolve(params);
      };
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

fs.mkdirSync(OUT, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "motouber-shots-"));
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

    const metrics = await cdp.send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize;
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: size.width, height: size.height, scale: 1 },
    });
    const name = page.replace(/\.html$/, "");
    fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(shot.data, "base64"));
    console.log(`PNG ${name}.png  ${Math.round(size.width)}x${Math.round(size.height)}`);

    const pdf = await cdp.send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
    });
    fs.writeFileSync(path.join(OUT, `${name}.pdf`), Buffer.from(pdf.data, "base64"));
    console.log(`PDF ${name}.pdf`);
  }
} finally {
  try { ws?.close(); } catch {}
  brave.kill();
  await sleep(400);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
