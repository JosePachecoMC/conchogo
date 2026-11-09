import {
  C, doc, text, lines, actor, flow, solidBadge, titleBlock, footnote, iconGlyph, legendFlow, legendBox,
} from "../svg.mjs";

export function contextoDiagram() {
  const W = 1500;
  const H = 900;

  const sysGrad = `
    <defs>
      <linearGradient id="sysGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="55%" stop-color="#3730a3"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
      <radialGradient id="sysGlow" cx="50%" cy="0%" r="85%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity=".20"/>
        <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>`;

  return doc(W, H, `
    ${sysGrad}
    ${titleBlock(W, "Diagrama de contexto · Sistema MotoUber", "DFD nivel 0 · el sistema se representa como un único proceso y cuatro actores externos", {
      accent: C.blue,
      right: `${legendFlow(1080, 46, C.slate, "flujo de datos")}
              ${legendBox(1270, 46, C.indigo, C.indigoSoft, "actor externo", "actor")}`,
    })}

    <!-- Frontera del sistema -->
    <g filter="url(#soft-lg)">
      <rect x="560" y="330" width="380" height="240" rx="20" fill="url(#sysGrad)" stroke="#312e81" stroke-width="1.2"/>
      <rect x="560" y="330" width="380" height="240" rx="20" fill="url(#sysGlow)"/>
      <circle cx="750" cy="371" r="24" fill="#ffffff" fill-opacity=".14" stroke="#ffffff" stroke-opacity=".3"/>
      ${iconGlyph("system", 738, 359, 24, "#ffffff")}
      ${text(750, 416, "MotoUber", { size: 27, weight: 750, color: "#ffffff", anchor: "middle", letter: -0.4 })}
      ${text(750, 435, "SISTEMA DE MOVILIDAD URBANA", { size: 8.6, weight: 700, color: "#c7d2fe", anchor: "middle", letter: 1.7 })}
      <line x1="612" y1="451" x2="888" y2="451" stroke="#ffffff" stroke-opacity=".2"/>
      ${text(750, 472, "PROCESO 0 · PLATAFORMA WEB", { size: 9.4, weight: 750, color: "#a5b4fc", anchor: "middle", letter: 1.3 })}
      ${text(750, 492, "React · API REST · base de datos relacional", { size: 10.2, weight: 500, color: "#e0e7ff", anchor: "middle" })}
      ${text(750, 518, "Autenticación · Viajes · Pagos · Reputación · Patrocinios", { size: 9.6, weight: 500, color: "#c7d2fe", anchor: "middle" })}
      ${text(750, 547, "Frontera del sistema", { size: 8.4, weight: 650, color: "#99f6e4", anchor: "middle", letter: 0.8 })}
    </g>

    <!-- Actores -->
    ${actor(70, 255, 270, 140, "Pasajero", "ACTOR EXTERNO · DEMANDA", { color: C.indigo, soft: C.indigoSoft, icon: "pasajero", sub: "Solicita, paga y califica" })}
    ${actor(590, 70, 320, 140, "Motoconchista", "ACTOR EXTERNO · OFERTA", { color: C.teal, soft: C.tealSoft, icon: "moto", sub: "Recibe, acepta y ejecuta" })}
    ${actor(1160, 255, 270, 140, "Administrador", "ACTOR EXTERNO · GOBIERNO", { color: C.amber, soft: C.amberSoft, icon: "admin", sub: "Supervisa, autoriza y reporta" })}
    ${actor(590, 710, 320, 140, "Patrocinador", "ACTOR EXTERNO · ALIADO", { color: C.rose, soft: C.roseSoft, icon: "sponsor", sub: "Gestiona convenios y publicidad" })}

    <!-- Flujos Pasajero -->
    ${flow([[340, 355], [560, 355]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(450, 355, "F1", C.indigo)}
    ${lines(424, 324, ["registro, solicitud, cancelación,", "pago y calificación"], { size: 9.3, weight: 600, color: C.indigo })}
    ${flow([[560, 375], [340, 375]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(492, 375, "F2", C.indigo)}
    ${lines(425, 397, ["confirmación, datos del conductor,", "tarifa y recibo"], { size: 8.9, weight: 600, color: C.indigo })}

    <!-- Flujos Motoconchista -->
    ${flow([[660, 330], [660, 210]], { color: C.teal, marker: "teal" })}
    ${solidBadge(660, 310, "F3", C.teal)}
    ${lines(646, 264, ["registro / solicitudes,", "asignación y liquidación"], { size: 9.1, weight: 600, color: C.teal, anchor: "end" })}
    ${flow([[820, 210], [820, 330]], { color: C.teal, marker: "teal" })}
    ${solidBadge(820, 310, "F4", C.teal)}
    ${lines(834, 264, ["sesión, disponibilidad,", "aceptación y estado"], { size: 9.1, weight: 600, color: C.teal, anchor: "start" })}

    <!-- Flujos Administrador -->
    ${flow([[1160, 355], [940, 355]], { color: C.amber, marker: "amber" })}
    ${solidBadge(1050, 355, "F5", C.amber)}
    ${lines(1058, 324, ["sesión, gestión,", "supervisión y autorización"], { size: 9.3, weight: 600, color: C.amber })}
    ${flow([[940, 375], [1160, 375]], { color: C.amber, marker: "amber" })}
    ${solidBadge(1008, 375, "F6", C.amber)}
    ${lines(1055, 397, ["reportes, transacciones", "y alertas"], { size: 9.3, weight: 600, color: C.amber })}

    <!-- Flujos Patrocinador -->
    ${flow([[700, 710], [700, 570]], { color: C.rose, marker: "rose" })}
    ${solidBadge(700, 670, "F7", C.rose)}
    ${lines(686, 626, ["convenios,", "publicidad y pagos"], { size: 9.1, weight: 600, color: C.rose, anchor: "end" })}
    ${flow([[820, 570], [820, 710]], { color: C.rose, marker: "rose" })}
    ${solidBadge(820, 670, "F8", C.rose)}
    ${lines(834, 626, ["estado del acuerdo", "y métricas"], { size: 9.1, weight: 600, color: C.rose, anchor: "start" })}

    ${text(750, 64, "Cada flujo se detalla en la tabla de interfases del sistema", { size: 9, weight: 500, color: C.muted2, anchor: "middle", italic: true })}
    ${footnote(W, 872, "DFD nivel 0: no muestra almacenes ni la descomposición interna. Los flujos F1–F8 se especifican en la tabla «Interfases externas» de esta página.")}
  `, { ariaLabel: "Diagrama de contexto de MotoUber con los actores Pasajero, Motoconchista, Administrador y Patrocinador" });
}
