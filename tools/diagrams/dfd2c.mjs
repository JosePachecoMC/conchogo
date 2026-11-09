import {
  C, doc, text, actor, flow, processBox, store, solidBadge, titleBlock, footnote, legendFlow, legendBox,
} from "../svg.mjs";

export function dfd2cDiagram() {
  const W = 1700;
  const H = 900;
  const bi = (pts, color, marker, o = {}) => flow(pts, { color, marker, bi: true, width: 1.55, ...o });

  return doc(W, H, `
    ${titleBlock(W, "DFD nivel 2C · Dinero, reputación y gobierno", "P09 pagos · P10 calificación · P11 patrocinio · P12 administración general", {
      accent: C.amber,
      right: `${legendBox(1060, 46, C.amber, C.amberSoft, "proceso", "process")}
              ${legendBox(1176, 46, C.rose, C.roseSoft, "almacén", "store")}
              ${legendFlow(1290, 46, C.slate, "flujo")}
              ${text(1410, 50, "↺ actor repetido", { size: 9, weight: 600, color: C.muted })}`,
    })}

    <!-- Actores -->
    ${actor(100, 80, 220, 80, "Pasajero", "PAGA EL SERVICIO", { color: C.indigo, soft: C.indigoSoft, icon: "pasajero" })}
    ${actor(490, 80, 220, 80, "Pasajero", "CALIFICA EL SERVICIO", { color: C.indigo, soft: C.indigoSoft, icon: "pasajero", dup: true })}
    ${actor(880, 80, 240, 80, "Patrocinador", "ALIADO COMERCIAL", { color: C.rose, soft: C.roseSoft, icon: "sponsor" })}
    ${actor(1270, 80, 240, 80, "Administrador", "GOBIERNO Y CONTROL", { color: C.amber, soft: C.amberSoft, icon: "admin" })}

    ${actor(60, 475, 180, 70, "Motoconchista", "COBRA", { color: C.teal, soft: C.tealSoft, icon: "moto" })}
    ${actor(250, 475, 150, 70, "Admin", "AUTORIZA", { color: C.amber, soft: C.amberSoft, icon: "admin", dup: true })}

    <!-- Procesos -->
    ${processBox(70, 300, 300, "P09", "Registro y control de pagos", "cobro al pasajero y liquidación al conductor", { color: C.amber, soft: C.amberSoft, h: 100 })}
    ${processBox(460, 300, 300, "P10", "Calificación del servicio", "puntuación y comentario del pasajero", { color: C.blue, soft: C.blueSoft, h: 100 })}
    ${processBox(850, 300, 300, "P11", "Gestión de patrocinio", "convenios, publicidad y estado del aliado", { color: C.rose, soft: C.roseSoft, h: 100 })}
    ${processBox(1240, 300, 300, "P12", "Administración general", "usuarios, supervisión y reportes", { color: C.indigo, soft: C.indigoSoft, h: 100 })}

    <!-- Almacenes -->
    ${store(70, 650, 300, "D3", "PAGO", "cobros, estados y liquidaciones", { color: C.amber, soft: C.amberSoft, h: 80 })}
    ${store(460, 650, 300, "D4", "CALIFICACION", "puntuación y comentarios", { color: C.blue, soft: C.blueSoft, h: 80 })}
    ${store(460, 760, 300, "D2", "VIAJE", "validación del viaje calificado", { color: C.teal, soft: C.tealSoft, h: 70 })}
    ${store(850, 650, 300, "D5", "PATROCINADOR", "empresa, contacto y estado", { color: C.rose, soft: C.roseSoft, h: 80 })}
    ${store(850, 760, 300, "D6", "ACUERDO_PATROCINIO", "monto y vigencia", { color: C.rose, soft: C.roseSoft, h: 70 })}
    ${store(1240, 650, 300, "DR", "REPORTES", "vista de lectura D1–D6", { color: C.slate, soft: C.slateSoft, h: 110 })}

    <!-- P09 -->
    ${flow([[210, 160], [210, 300]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(210, 265, "F1", C.indigo)}
    ${text(220, 238, "pago + comprobante", { size: 8.7, weight: 650, color: C.indigo, anchor: "start" })}

    ${flow([[120, 400], [120, 475]], { color: C.amber, marker: "amber" })}
    ${solidBadge(120, 438, "F2", C.amber)}
    ${text(132, 452, "liquidación", { size: 8.7, weight: 650, color: C.amber, anchor: "start" })}

    ${flow([[330, 475], [330, 400]], { color: C.amber, marker: "amber" })}
    ${solidBadge(330, 442, "F3", C.amber)}
    ${text(342, 456, "autoriza / reversa", { size: 8.7, weight: 650, color: C.amber, anchor: "start" })}

    ${bi([[90, 400], [90, 455], [50, 455], [50, 600], [120, 600], [120, 650]], C.amber, "amber")}
    ${solidBadge(85, 600, "F4", C.amber)}
    ${text(100, 590, "pagos y estados", { size: 8.6, weight: 650, color: C.amber, anchor: "start" })}

    ${flow([[370, 350], [460, 350]], { color: C.slate, marker: "slate" })}
    ${solidBadge(415, 350, "F5", C.slate)}
    ${text(415, 340, "pago confirmado", { size: 8.2, weight: 650, color: C.slate, anchor: "middle" })}

    <!-- P10 -->
    ${flow([[600, 160], [600, 300]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(600, 260, "F6", C.indigo)}
    ${text(610, 236, "puntuación + comentario", { size: 8.7, weight: 650, color: C.indigo, anchor: "start" })}

    ${bi([[610, 400], [610, 650]], C.blue, "blue")}
    ${solidBadge(610, 520, "F7", C.blue)}
    ${text(622, 514, "calificaciones", { size: 8.6, weight: 650, color: C.blue, anchor: "start" })}

    ${bi([[460, 380], [430, 380], [430, 795], [460, 795]], C.teal, "teal")}
    ${solidBadge(430, 690, "F8", C.teal)}
    ${text(420, 620, "valida viaje", { size: 8.5, weight: 650, color: C.teal, anchor: "end" })}

    <!-- P11 -->
    ${flow([[1000, 160], [1000, 300]], { color: C.rose, marker: "rose" })}
    ${solidBadge(1000, 260, "F9", C.rose)}
    ${text(1010, 232, "convenio / publicidad", { size: 8.7, weight: 650, color: C.rose, anchor: "start" })}

    ${bi([[1000, 400], [1000, 650]], C.rose, "rose")}
    ${solidBadge(1000, 520, "F10", C.rose)}
    ${text(1012, 514, "patrocinadores", { size: 8.6, weight: 650, color: C.rose, anchor: "start" })}

    ${bi([[1150, 380], [1190, 380], [1190, 795], [1150, 795]], C.rose, "rose")}
    ${solidBadge(1190, 570, "F11", C.rose)}
    ${text(1200, 564, "acuerdos", { size: 8.6, weight: 650, color: C.rose, anchor: "start" })}

    ${flow([[1150, 350], [1240, 350]], { color: C.rose, marker: "rose" })}
    ${solidBadge(1195, 350, "F12", C.rose)}
    ${text(1195, 340, "acuerdo activo", { size: 8.5, weight: 650, color: C.rose, anchor: "middle" })}

    <!-- P12 -->
    ${bi([[1390, 160], [1390, 300]], C.amber, "amber")}
    ${solidBadge(1390, 260, "F13", C.amber)}
    ${text(1400, 232, "gestión / reportes", { size: 8.7, weight: 650, color: C.amber, anchor: "start" })}

    ${bi([[1390, 400], [1390, 650]], C.slate, "slate", { dashed: true })}
    ${solidBadge(1390, 520, "F14", C.slate)}
    ${text(1402, 514, "consulta D1–D6", { size: 8.6, weight: 650, color: C.slate, anchor: "start" })}

    ${text(1402, 620, "vista de solo lectura · no es una tabla normalizada", { size: 8, weight: 500, color: C.muted2, anchor: "start", italic: true })}
    ${footnote(W, 872, "El administrador autoriza la liquidación y también puede reversarla ante una incidencia. Toda modificación de estado queda registrada en D3 (PAGO) para auditoría.")}
  `, { ariaLabel: "DFD nivel 2C de MotoUber: pagos, calificación, patrocinio y administración" });
}
