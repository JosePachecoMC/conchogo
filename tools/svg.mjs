/**
 * Helpers para construir los diagramas SVG de MotoUber.
 * SVG autónomo: sin fuentes, imágenes ni scripts externos.
 */

export const C = {
  ink: "#0f172a",
  ink2: "#1e293b",
  muted: "#64748b",
  muted2: "#94a3b8",
  line: "#cbd5e1",
  line2: "#e2e8f0",
  white: "#ffffff",
  indigo: "#4338ca",
  indigo2: "#6366f1",
  indigoSoft: "#eef2ff",
  teal: "#0f766e",
  teal2: "#0d9488",
  tealSoft: "#ecfdf5",
  amber: "#b45309",
  amber2: "#d97706",
  amberSoft: "#fffbeb",
  rose: "#be123c",
  rose2: "#e11d48",
  roseSoft: "#fff1f2",
  blue: "#1d4ed8",
  blue2: "#2563eb",
  blueSoft: "#eff6ff",
  slate: "#475569",
  slateSoft: "#f1f5f9",
  green: "#15803d",
  greenSoft: "#f0fdf4",
  violet: "#6d28d9",
  violetSoft: "#f5f3ff",
};

const FONT = "'Segoe UI',Inter,-apple-system,'Helvetica Neue',Arial,sans-serif";
const MONO = "'Cascadia Mono',Consolas,'Courier New',monospace";

export const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const round = (n) => Math.round(n * 100) / 100;

/** Ruta ortogonal con esquinas redondeadas. points = [[x,y],...] */
export function orth(points, radius = 12) {
  if (!points || points.length < 2) return "";
  const p = points.map(([x, y]) => [round(x), round(y)]);
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const inLen = Math.hypot(x1 - x0, y1 - y0);
    const outLen = Math.hypot(x2 - x1, y2 - y1);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    if (r < 1) {
      d += ` L ${x1} ${y1}`;
      continue;
    }
    const p1 = [x1 - ((x1 - x0) / inLen) * r, y1 - ((y1 - y0) / inLen) * r];
    const p2 = [x1 + ((x2 - x1) / outLen) * r, y1 + ((y2 - y1) / outLen) * r];
    d += ` L ${round(p1[0])} ${round(p1[1])} Q ${x1} ${y1} ${round(p2[0])} ${round(p2[1])}`;
  }
  const last = p[p.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

const PALETTE = ["ink", "indigo", "teal", "amber", "rose", "slate", "blue", "green", "violet", "white"];

function defs() {
  const markers = PALETTE.map((name) => {
    const color = C[name] || name;
    return `<marker id="ar-${name}" viewBox="0 0 10 10" refX="9.2" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/>
    </marker>
    <marker id="ar-${name}-start" viewBox="0 0 10 10" refX="0.8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 10 0 L 0 5 L 10 10 z" fill="${color}"/>
    </marker>`;
  }).join("");
  return `<defs>
    ${markers}
    <filter id="soft" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.6" flood-color="#0f172a" flood-opacity=".10"/>
    </filter>
    <filter id="soft-lg" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#0f172a" flood-opacity=".16"/>
    </filter>
    <style>
      text{font-family:${FONT};}
      .mono{font-family:${MONO};}
      .halo{paint-order:stroke;stroke-linejoin:round;}
    </style>
  </defs>`;
}

export function doc(w, h, body, opts = {}) {
  const label = opts.ariaLabel || "Diagrama del sistema MotoUber";
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>
    ${defs()}
    ${body}
  </svg>`;
}

export function text(x, y, content, o = {}) {
  const {
    size = 12,
    weight = 600,
    color = C.ink2,
    anchor = "start",
    mono = false,
    halo = false,
    opacity = 1,
    letter = 0,
    italic = false,
    baseline = "auto",
  } = o;
  const style = [
    `font-size:${size}px`,
    `font-weight:${weight}`,
    `fill:${color}`,
    anchor !== "start" ? `text-anchor:${anchor}` : "",
    letter ? `letter-spacing:${letter}` : "",
    opacity !== 1 ? `opacity:${opacity}` : "",
    italic ? "font-style:italic" : "",
    baseline !== "auto" ? `dominant-baseline:${baseline}` : "",
  ].filter(Boolean).join(";");
  const haloAttrs = halo ? 'class="halo" stroke="#ffffff" stroke-width="4.5"' : "";
  return `<text x="${round(x)}" y="${round(y)}" ${mono ? 'class="mono"' : ""} style="${style}" ${haloAttrs}>${esc(content)}</text>`;
}

export function lines(x, y, arr, o = {}) {
  const { size = 11, weight = 600, color = C.ink2, anchor = "middle", lh = 13.5, halo = true, mono = false } = o;
  return arr
    .map((s, i) =>
      text(x, y + i * lh, s, { size, weight, color, anchor, halo, mono })
    )
    .join("");
}

export function flow(points, o = {}) {
  const {
    color = C.slate,
    marker = "slate",
    width = 1.7,
    dashed = false,
    bi = false,
    radius = 12,
    opacity = 1,
  } = o;
  const d = orth(points, radius);
  const dash = dashed ? ' stroke-dasharray="6 4"' : "";
  const start = bi ? ` marker-start="url(#ar-${marker}-start)"` : "";
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash}${start} marker-end="url(#ar-${marker})" opacity="${opacity}"/>`;
}

export function numberBadge(x, y, n, color = C.brand || C.indigo, bg = "#ffffff") {
  return `<g>
    <circle cx="${x}" cy="${y}" r="9.5" fill="${bg}" stroke="${color}" stroke-width="1.4"/>
    ${text(x, y + 3.4, n, { anchor: "middle", size: 9.2, weight: 750, color, mono: true })}
  </g>`;
}

export function solidBadge(x, y, n, color = C.indigo) {
  return `<g>
    <circle cx="${x}" cy="${y}" r="10" fill="${color}"/>
    ${text(x, y + 3.4, n, { anchor: "middle", size: 9.4, weight: 750, color: "#ffffff", mono: true })}
  </g>`;
}

export function titleBlock(w, title, subtitle, o = {}) {
  const { accent = C.indigo, right = "" } = o;
  return `<g>
    <rect x="34" y="26" width="5" height="34" rx="2.5" fill="${accent}"/>
    ${text(50, 44, title, { size: 21, weight: 750, color: C.ink, letter: -0.3 })}
    ${text(50, 64, subtitle, { size: 11.5, weight: 500, color: C.muted })}
    ${right}
  </g>`;
}

export function footnote(w, y, content, o = {}) {
  const { color = C.muted } = o;
  return `<g>
    <line x1="34" y1="${y - 16}" x2="${w - 34}" y2="${y - 16}" stroke="${C.line2}" stroke-width="1"/>
    ${text(34, y, content, { size: 9.8, weight: 500, color })}
  </g>`;
}

/* ------------------------------------------------------------------ */
/* Entidades (modelo E-R)                                             */
/* ------------------------------------------------------------------ */

/**
 * fields: [{name,type,key:'PK'|'FK'|'UQ'|null, nullable?:bool, note?:string}]
 */
export function entity(x, y, w, title, fields, o = {}) {
  const {
    color = C.indigo,
    soft = C.indigoSoft,
    subtitle = "",
    badge = "",
    rowH = 25,
    headerH = 46,
  } = o;
  const h = headerH + fields.length * rowH + 9;
  const rows = fields
    .map((f, i) => {
      const ry = y + headerH + i * rowH;
      const keyColor = f.key === "PK" ? C.amber : f.key === "FK" ? C.blue : C.violet;
      const keyBg = f.key === "PK" ? "#fffbeb" : f.key === "FK" ? "#eff6ff" : "#f5f3ff";
      const keyText = f.key === "PK" ? "#92400e" : f.key === "FK" ? "#1d4ed8" : "#6d28d9";
      const key = f.key
        ? `<rect x="${x + 9}" y="${ry + 5.5}" width="23" height="14" rx="3.5" fill="${keyBg}" stroke="${keyColor}" stroke-opacity=".45" stroke-width=".8"/>
           ${text(x + 20.5, ry + 15.6, f.key, { size: 7.4, weight: 750, color: keyText, anchor: "middle", mono: true })}`
        : "";
      const nameX = x + (f.key ? 38 : 13);
      const typeX = x + w - 11;
      return `<g>
        <line x1="${x + 1}" y1="${ry}" x2="${x + w - 1}" y2="${ry}" stroke="#f1f5f9" stroke-width="1"/>
        ${key}
        ${text(nameX, ry + 17, f.name, { size: 10.3, weight: f.key ? 700 : 550, color: C.ink2, mono: true })}
        ${text(typeX, ry + 17, f.type || "", { size: 9, weight: 500, color: C.muted2, anchor: "end", mono: true })}
      </g>`;
    })
    .join("");

  return {
    height: h,
    width: w,
    svg: `<g filter="url(#soft)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="#ffffff" stroke="${color}" stroke-width="1.4"/>
      <path d="M ${x} ${y + 11} Q ${x} ${y} ${x + 11} ${y} L ${x + w - 11} ${y} Q ${x + w} ${y} ${x + w} ${y + 11} L ${x + w} ${y + headerH} L ${x} ${y + headerH} Z" fill="${color}"/>
      ${text(x + 13, y + (subtitle ? 22 : 28), title, { size: 14, weight: 750, color: "#ffffff", letter: 0.2 })}
      ${subtitle ? text(x + 13, y + 37, subtitle, { size: 8.6, weight: 600, color: "#ffffff", opacity: 0.74, letter: 0.9 }) : ""}
      ${badge ? `<g><rect x="${x + w - 63}" y="${y + 13}" width="50" height="19" rx="5" fill="#ffffff" fill-opacity=".16" stroke="#ffffff" stroke-opacity=".28"/>
        ${text(x + w - 38, y + 26.5, badge, { size: 8.2, weight: 700, color: "#ffffff", anchor: "middle", letter: 0.7 })}</g>` : ""}
      ${rows}
    </g>`,
  };
}

/* ------------------------------------------------------------------ */
/* Procesos, almacenes y actores (DFD)                                */
/* ------------------------------------------------------------------ */

export function processBox(x, y, w, id, title, subtitle = "", o = {}) {
  const { color = C.indigo, soft = C.indigoSoft, h = 96, dashed = false } = o;
  return `<g filter="url(#soft)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#ffffff" stroke="${color}" stroke-width="1.45"${dashed ? ' stroke-dasharray="6 4"' : ""}/>
    <path d="M ${x} ${y + 10} Q ${x} ${y} ${x + 10} ${y} L ${x + w - 10} ${y} Q ${x + w} ${y} ${x + w} ${y + 10} L ${x + w} ${y + 26} L ${x} ${y + 26} Z" fill="${soft}"/>
    <line x1="${x}" y1="${y + 26}" x2="${x + w}" y2="${y + 26}" stroke="${color}" stroke-opacity=".28" stroke-width="1"/>
    ${text(x + 13, y + 18, `${id}  ·  PROCESO`, { size: 8.3, weight: 750, color, letter: 0.9, mono: true })}
    ${text(x + 13, y + 49, title, { size: 13.6, weight: 750, color: C.ink, letter: -0.1 })}
    ${subtitle ? text(x + 13, y + 68, subtitle, { size: 9.4, weight: 500, color: C.muted }) : ""}
  </g>`;
}

export function store(x, y, w, id, name, subtitle = "", o = {}) {
  const { color = C.teal, soft = C.tealSoft, h = 68 } = o;
  return `<g filter="url(#soft)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#ffffff" stroke="${color}" stroke-width="1.3"/>
    <path d="M ${x} ${y + 7} Q ${x} ${y} ${x + 7} ${y} L ${x + 46} ${y} L ${x + 46} ${y + h} L ${x + 7} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 7} Z" fill="${soft}"/>
    <line x1="${x + 46}" y1="${y}" x2="${x + 46}" y2="${y + h}" stroke="${color}" stroke-opacity=".3"/>
    ${text(x + 23, y + 26, id, { size: 11, weight: 750, color, anchor: "middle", mono: true })}
    ${text(x + 23, y + 44, "BD", { size: 7, weight: 700, color, anchor: "middle", letter: 0.8 })}
    ${text(x + 58, y + (subtitle ? 28 : 38), name, { size: 11.6, weight: 750, color: C.ink })}
    ${subtitle ? text(x + 58, y + 46, subtitle, { size: 8.8, weight: 500, color: C.muted }) : ""}
  </g>`;
}

const ICONS = {
  pasajero: `<circle cx="12" cy="7.6" r="3.3"/><path d="M5.4 20c.8-4.1 3.1-6.1 6.6-6.1s5.8 2 6.6 6.1"/>`,
  moto: `<circle cx="5.4" cy="17" r="2.7"/><circle cx="18.6" cy="17" r="2.7"/><path d="M8.1 17h4.7l2.4-5.2h3.4M11 17l-1.4-4.2H6.9m7.2 0-2-3.2H9.5"/>`,
  admin: `<path d="M12 3.4 19 6v5.3c0 4.2-2.9 7.5-7 9.2-4.1-1.7-7-5-7-9.2V6z"/><path d="m9 12 2.1 2.1L15.2 10"/>`,
  sponsor: `<path d="M4 20V6.2h8.6V20M12.6 10H20v10M3 20h18M7 9.3h2.6M7 13h2.6M7 16.6h2.6M16 13h1.2M16 16.6h1.2"/>`,
  system: `<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><path d="M7.5 9h9M7.5 12.5h6.5M7.5 16h4"/>`,
  documento: `<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4M9 11h6M9 14.5h6M9 18h4"/>`,
};

export function iconGlyph(name, x, y, size, color) {
  const scale = size / 24;
  return `<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.system}</g>`;
}

export function actor(x, y, w, h, name, role, o = {}) {
  const { color = C.indigo, soft = C.indigoSoft, icon = "pasajero", dup = false, sub = "" } = o;
  const cy = y + h / 2;
  return `<g filter="url(#soft)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="#ffffff" stroke="${color}" stroke-width="1.25"/>
    <circle cx="${x + 30}" cy="${cy}" r="19" fill="${soft}"/>
    ${iconGlyph(icon, x + 18, cy - 12, 24, color)}
    ${text(x + 58, cy + (sub ? -5 : 4), name, { size: 13, weight: 750, color: C.ink })}
    ${text(x + 58, cy + (sub ? 11 : 19), role, { size: 8.2, weight: 700, color, letter: 0.8 })}
    ${sub ? text(x + 58, cy + 26, sub, { size: 8.2, weight: 500, color: C.muted }) : ""}
    ${dup ? `<g><circle cx="${x + w - 16}" cy="${y + 15}" r="9" fill="${soft}" stroke="${color}" stroke-width="1"/>
      ${text(x + w - 16, y + 18.5, "↺", { size: 10.5, weight: 750, color, anchor: "middle" })}</g>` : ""}
  </g>`;
}

/* ------------------------------------------------------------------ */
/* Notación E-R: pata de gallo                                        */
/* ------------------------------------------------------------------ */

export function crowFoot(x, y, points, o = {}) {
  // points: puntos de la relación; neighbor es el punto contiguo del extremo.
  // El símbolo se dibuja hacia el tramo de la relación, nunca dentro de la entidad.
  const { color = C.slate, card = "one", neighbor = null } = o;
  const prev = neighbor || points[points.length - 2] || [x - 20, y];
  const angle = (Math.atan2(y - prev[1], x - prev[0]) * 180) / Math.PI;
  const g = [];
  g.push(`<g class="crowfoot" transform="translate(${round(x)} ${round(y)}) rotate(${round(angle)})" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round">`);
  if (card === "many") {
    g.push(`<path d="M 0 -7 L -14 0 M 0 0 L -14 0 M 0 7 L -14 0"/>`);
  } else if (card === "oneOptional") {
    g.push(`<line x1="-13" y1="-5.5" x2="-13" y2="5.5"/><circle cx="-21" cy="0" r="4.3" fill="#ffffff"/>`);
  } else {
    g.push(`<line x1="-13" y1="-5.5" x2="-13" y2="5.5"/>`);
  }
  g.push(`</g>`);
  return g.join("");
}

export function relation(points, o = {}) {
  const {
    color = C.slate,
    from = "one",
    to = "many",
    width = 1.55,
    dashed = false,
    label = "",
    lx = 0,
    ly = 0,
    labelColor = C.muted,
    labelSize = 9.4,
    labelLines = null,
    anchor = "middle",
  } = o;
  const last = points[points.length - 1];
  const first = points[0];
  const labelSvg = labelLines
    ? lines(lx, ly, labelLines, { size: labelSize, weight: 650, color: labelColor, anchor, lh: 11.5 })
    : label
      ? text(lx, ly, label, { size: labelSize, weight: 650, color: labelColor, anchor, halo: true })
      : "";
  return `<g>
    <path d="${orth(points)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dashed ? ' stroke-dasharray="5 4"' : ""}/>
    ${crowFoot(first[0], first[1], points, { color, card: from, neighbor: points[1] })}
    ${crowFoot(last[0], last[1], points, { color, card: to, neighbor: points[points.length - 2] })}
    ${labelSvg}
  </g>`;
}

/* ------------------------------------------------------------------ */
/* Leyendas                                                           */
/* ------------------------------------------------------------------ */

export function legendFlow(x, y, color, label, bi = false) {
  return `<g>
    <line x1="${x}" y1="${y}" x2="${x + 30}" y2="${y}" stroke="${color}" stroke-width="1.7" stroke-linecap="round"/>
    ${bi ? `<path d="M ${x} ${y} l 6 -3.2 v 6.4 z" fill="${color}"/>` : ""}
    <path d="M ${x + 30} ${y} l -7 -3.4 v 6.8 z" fill="${color}"/>
    ${text(x + 38, y + 3.6, label, { size: 9.4, weight: 600, color: C.muted })}
  </g>`;
}

export function legendBox(x, y, color, soft, label, kind = "box") {
  if (kind === "store") {
    return `<g>
      <rect x="${x}" y="${y - 8}" width="30" height="16" rx="3" fill="${soft}" stroke="${color}" stroke-width="1"/>
      <line x1="${x + 10}" y1="${y - 8}" x2="${x + 10}" y2="${y + 8}" stroke="${color}" stroke-width="1"/>
      ${text(x + 38, y + 3.6, label, { size: 9.4, weight: 600, color: C.muted })}
    </g>`;
  }
  if (kind === "process") {
    return `<g>
      <rect x="${x}" y="${y - 8}" width="30" height="16" rx="4" fill="#ffffff" stroke="${color}" stroke-width="1.2"/>
      <path d="M ${x} ${y - 4} h 30" stroke="${color}" stroke-width="1.2"/>
      ${text(x + 38, y + 3.6, label, { size: 9.4, weight: 600, color: C.muted })}
    </g>`;
  }
  if (kind === "actor") {
    return `<g>
      <rect x="${x}" y="${y - 8}" width="30" height="16" rx="4" fill="${soft}" stroke="${color}" stroke-width="1"/>
      <circle cx="${x + 15}" cy="${y}" r="3.2" fill="none" stroke="${color}" stroke-width="1.2"/>
      ${text(x + 38, y + 3.6, label, { size: 9.4, weight: 600, color: C.muted })}
    </g>`;
  }
  return `<g>
    <rect x="${x}" y="${y - 8}" width="30" height="16" rx="3" fill="${soft}" stroke="${color}" stroke-width="1"/>
    ${text(x + 38, y + 3.6, label, { size: 9.4, weight: 600, color: C.muted })}
  </g>`;
}
