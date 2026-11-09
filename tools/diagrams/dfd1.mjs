import {
  C, doc, text, lines, actor, flow, processBox, store, solidBadge, titleBlock, footnote, legendFlow, legendBox,
} from "../svg.mjs";

export function dfd1Diagram() {
  const W = 1700;
  const H = 835;

  const f = (pts, color, marker, o = {}) => flow(pts, { color, marker, bi: true, ...o });

  return doc(W, H, `
    ${titleBlock(W, "DFD nivel 1 · Vista por dominios", "Cuatro procesos agregados, almacenes D1–D6 y los actores del sistema MotoUber", {
      accent: C.teal,
      right: `${legendBox(1086, 46, C.indigo, C.indigoSoft, "proceso", "process")}
              ${legendBox(1206, 46, C.teal, C.tealSoft, "almacén", "store")}
              ${legendFlow(1332, 46, C.slate, "flujo")}
              ${text(1452, 50, "⇄ bidireccional", { size: 9.2, weight: 600, color: C.muted })}`,
    })}

    <!-- Actores -->
    ${actor(250, 100, 200, 90, "Pasajero", "DEMANDA", { color: C.indigo, soft: C.indigoSoft, icon: "pasajero" })}
    ${actor(700, 100, 200, 90, "Motoconchista", "OFERTA", { color: C.teal, soft: C.tealSoft, icon: "moto" })}
    ${actor(1030, 100, 200, 90, "Administrador", "GOBIERNO", { color: C.amber, soft: C.amberSoft, icon: "admin" })}
    ${actor(1380, 100, 200, 90, "Patrocinador", "ALIADO", { color: C.rose, soft: C.roseSoft, icon: "sponsor" })}

    <!-- Procesos agregados -->
    ${processBox(80, 330, 300, "1.0", "Identidad y acceso", "P01 · registro  |  P02 · inicio de sesión", { color: C.indigo, soft: C.indigoSoft, h: 110 })}
    ${processBox(480, 330, 300, "2.0", "Operación del viaje", "P03–P08 · solicitud, asignación y ejecución", { color: C.teal, soft: C.tealSoft, h: 110 })}
    ${processBox(880, 330, 300, "3.0", "Pagos y finanzas", "P09 · cobro, liquidación y reverso", { color: C.amber, soft: C.amberSoft, h: 110 })}
    ${processBox(1280, 330, 300, "4.0", "Servicio y gobierno", "P10–P12 · reputación, patrocinio y control", { color: C.rose, soft: C.roseSoft, h: 110 })}

    <!-- Flujos Pasajero -->
    ${f([[300, 190], [300, 225], [270, 225], [270, 330]], C.indigo, "indigo")}
    ${solidBadge(270, 275, "F1", C.indigo)}
    ${lines(276, 258, ["registro /", "sesión"], { size: 8.4, weight: 650, color: C.indigo, anchor: "start" })}

    ${f([[350, 190], [350, 255], [550, 255], [550, 330]], C.indigo, "indigo")}
    ${solidBadge(550, 292, "F2", C.indigo)}
    ${text(560, 248, "solicitud / confirmación", { size: 9.2, weight: 650, color: C.indigo })}

    ${f([[350, 100], [350, 90], [940, 90], [940, 330]], C.indigo, "indigo")}
    ${solidBadge(940, 312, "F3", C.indigo)}
    ${text(952, 290, "pago del viaje / comprobante", { size: 9.2, weight: 650, color: C.indigo, anchor: "start" })}

    <!-- Flujos Motoconchista -->
    ${f([[740, 190], [740, 215], [340, 215], [340, 330]], C.teal, "teal")}
    ${solidBadge(340, 275, "F4", C.teal)}
    ${text(590, 208, "registro / sesión", { size: 9.2, weight: 650, color: C.teal })}

    ${f([[820, 190], [820, 250], [760, 250], [760, 330]], C.teal, "teal")}
    ${solidBadge(760, 305, "F5", C.teal)}
    ${text(772, 243, "oferta / estado del viaje", { size: 9.2, weight: 650, color: C.teal, anchor: "end" })}

    ${flow([[880, 360], [860, 360], [860, 190]], { color: C.teal, marker: "teal" })}
    ${solidBadge(860, 280, "F6", C.teal)}
    ${text(872, 270, "liquidación", { size: 9.2, weight: 650, color: C.teal, anchor: "start" })}

    <!-- Flujos Administrador -->
    ${f([[1130, 190], [1130, 330]], C.amber, "amber")}
    ${solidBadge(1130, 300, "F7", C.amber)}
    ${text(1118, 250, "autorización / reporte", { size: 9.2, weight: 650, color: C.amber, anchor: "end" })}

    ${f([[1130, 190], [1130, 255], [1350, 255], [1350, 330]], C.amber, "amber")}
    ${solidBadge(1350, 292, "F8", C.amber)}
    ${text(1140, 220, "gestión / reportes", { size: 9.2, weight: 650, color: C.amber, anchor: "end" })}

    <!-- Flujo Patrocinador -->
    ${f([[1480, 190], [1480, 330]], C.rose, "rose")}
    ${solidBadge(1480, 300, "F9", C.rose)}
    ${text(1492, 250, "convenios / métricas", { size: 9.2, weight: 650, color: C.rose, anchor: "start" })}

    <!-- Flujos entre procesos -->
    ${f([[380, 390], [480, 390]], C.slate, "slate", { width: 1.5 })}
    ${solidBadge(430, 406, "F10", C.slate)}
    ${text(430, 382, "identidad y rol", { size: 8.8, weight: 650, color: C.slate, anchor: "middle" })}

    ${f([[780, 390], [880, 390]], C.slate, "slate", { width: 1.5 })}
    ${solidBadge(830, 406, "F11", C.slate)}
    ${text(830, 382, "viaje + tarifa", { size: 8.8, weight: 650, color: C.slate, anchor: "middle" })}

    ${f([[1180, 390], [1280, 390]], C.slate, "slate", { width: 1.5 })}
    ${solidBadge(1200, 406, "F12", C.slate)}
    ${text(1150, 322, "transacciones", { size: 8.8, weight: 650, color: C.slate, anchor: "middle" })}

    ${flow([[630, 440], [630, 560], [1430, 560], [1430, 440]], { color: C.rose, marker: "rose", width: 1.5 })}
    ${solidBadge(1030, 578, "F13", C.rose)}
    ${text(1055, 552, "viaje finalizado para calificar", { size: 8.8, weight: 650, color: C.rose, anchor: "start" })}

    ${f([[1130, 100], [1130, 80], [210, 80], [210, 330]], C.amber, "amber")}
    ${solidBadge(210, 245, "F14", C.amber)}
    ${text(198, 240, "sesión / rol", { size: 9.2, weight: 650, color: C.amber, anchor: "end" })}

    <!-- Almacenes -->
    ${store(80, 680, 300, "D1", "USUARIO", "perfiles, credenciales y rol", { color: C.indigo, soft: C.indigoSoft })}
    ${store(480, 680, 300, "D2", "VIAJE", "solicitudes, asignación y estado", { color: C.teal, soft: C.tealSoft })}
    ${store(880, 680, 300, "D3", "PAGO", "cobros, liquidaciones y reversos", { color: C.amber, soft: C.amberSoft })}
    ${store(1240, 680, 220, "D4", "CALIFICACION", "reputación del servicio", { color: C.blue, soft: C.blueSoft })}
    ${store(1480, 680, 190, "D5–D6", "PATROCINIO", "patrocinadores y acuerdos", { color: C.rose, soft: C.roseSoft })}

    <!-- Accesos a almacenes -->
    ${f([[230, 440], [230, 680]], C.indigo, "indigo", { width: 1.45 })}
    ${text(240, 570, "usuarios", { size: 8.8, weight: 650, color: C.indigo, anchor: "start" })}

    ${f([[630, 440], [630, 680]], C.teal, "teal", { width: 1.45 })}
    ${text(640, 570, "viajes", { size: 8.8, weight: 650, color: C.teal, anchor: "start" })}

    ${f([[1030, 440], [1030, 680]], C.amber, "amber", { width: 1.45 })}
    ${text(1040, 570, "pagos", { size: 8.8, weight: 650, color: C.amber, anchor: "start" })}

    ${f([[1380, 440], [1380, 680]], C.blue, "blue", { width: 1.45 })}
    ${text(1390, 570, "calificaciones", { size: 8.8, weight: 650, color: C.blue, anchor: "start" })}

    ${f([[1450, 440], [1450, 610], [1570, 610], [1570, 680]], C.rose, "rose", { width: 1.45 })}
    ${text(1575, 652, "patrocinios", { size: 8.8, weight: 650, color: C.rose, anchor: "start" })}

    ${footnote(W, 808, "Los procesos 1.0–4.0 agrupan P01–P12. D5–D6 se desdobla en PATROCINADOR y ACUERDO en el DFD 2C. El detalle de cada flujo y almacén se desarrolla en los DFD nivel 2.")}
  `, { ariaLabel: "DFD nivel 1 de MotoUber con cuatro dominios, actores y almacenes de datos" });
}
