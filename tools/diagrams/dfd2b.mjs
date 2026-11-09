import {
  C, doc, text, actor, flow, processBox, store, solidBadge, titleBlock, footnote, legendFlow, legendBox,
} from "../svg.mjs";

export function dfd2bDiagram() {
  const W = 1600;
  const H = 900;
  const bi = (pts, color, marker) => flow(pts, { color, marker, bi: true, width: 1.55 });

  return doc(W, H, `
    ${titleBlock(W, "DFD nivel 2B · Ciclo del viaje", "P03 solicitud · P04 búsqueda · P05 asignación · P06 cancelación · P07 gestión · P08 precio", {
      accent: C.teal,
      right: `${legendBox(1010, 46, C.teal, C.tealSoft, "proceso", "process")}
              ${legendBox(1126, 46, C.indigo, C.indigoSoft, "almacén", "store")}
              ${legendFlow(1240, 46, C.slate, "flujo")}
              ${text(1370, 50, "⇄ solicitud / respuesta", { size: 9, weight: 600, color: C.muted })}`,
    })}

    ${actor(50, 280, 190, 120, "Pasajero", "DEMANDA", { color: C.indigo, soft: C.indigoSoft, icon: "pasajero" })}
    ${actor(1360, 260, 190, 120, "Motoconchista", "OFERTA", { color: C.teal, soft: C.tealSoft, icon: "moto" })}

    ${processBox(320, 90, 240, "P03", "Solicitud de viaje", "registra origen, destino y tarifa base", { color: C.teal, soft: C.tealSoft, h: 96 })}
    ${processBox(660, 90, 240, "P04", "Búsqueda", "filtra conductores disponibles", { color: C.teal, soft: C.tealSoft, h: 96 })}
    ${processBox(1000, 90, 240, "P05", "Asignación", "notifica, acepta y vincula el viaje", { color: C.teal, soft: C.tealSoft, h: 96 })}
    ${processBox(320, 380, 240, "P06", "Cancelación", "anula por pasajero o conductor", { color: C.amber, soft: C.amberSoft, h: 96 })}
    ${processBox(720, 380, 240, "P07", "Gestión del viaje", "en camino, inicio y fin en tiempo real", { color: C.teal, soft: C.tealSoft, h: 96 })}
    ${processBox(1040, 620, 240, "P08", "Cálculo del precio", "confirma distancia y tarifa final", { color: C.amber, soft: C.amberSoft, h: 96 })}
    ${processBox(1360, 620, 190, "P09", "Pagos", "continúa en el DFD 2C", { color: C.amber, soft: C.amberSoft, h: 70, dashed: true })}

    ${store(620, 250, 240, "D2", "VIAJE", "solicitud, estado y tarifa", { color: C.teal, soft: C.tealSoft, h: 80 })}
    ${store(1080, 250, 240, "D1", "USUARIO", "conductores y disponibilidad", { color: C.indigo, soft: C.indigoSoft, h: 80 })}

    <!-- Solicitud -->
    ${bi([[240, 300], [290, 300], [290, 140], [320, 140]], C.indigo, "indigo")}
    ${solidBadge(290, 220, "F1", C.indigo)}
    ${text(300, 208, "origen / destino", { size: 8.7, weight: 650, color: C.indigo, anchor: "start" })}

    ${flow([[560, 140], [640, 140], [640, 250]], { color: C.teal, marker: "teal" })}
    ${solidBadge(590, 140, "F2", C.teal)}
    ${text(570, 210, "nueva solicitud", { size: 8.7, weight: 650, color: C.teal, anchor: "middle" })}

    ${flow([[720, 250], [720, 186]], { color: C.teal, marker: "teal" })}
    ${solidBadge(720, 218, "F3", C.teal)}
    ${text(730, 232, "pendientes", { size: 8.5, weight: 650, color: C.teal, anchor: "start" })}

    <!-- Búsqueda y asignación -->
    ${flow([[1080, 290], [980, 290], [980, 130], [900, 130]], { color: C.teal, marker: "teal" })}
    ${solidBadge(980, 210, "F4", C.teal)}
    ${text(1040, 216, "disponibilidad", { size: 8.6, weight: 650, color: C.teal, anchor: "start" })}

    ${flow([[900, 160], [1000, 160]], { color: C.slate, marker: "slate" })}
    ${solidBadge(950, 160, "F5", C.slate)}
    ${text(920, 178, "candidatos", { size: 8.6, weight: 650, color: C.slate })}

    ${bi([[1240, 160], [1330, 160], [1330, 300], [1360, 300]], C.teal, "teal")}
    ${solidBadge(1330, 235, "F6", C.teal)}
    ${text(1318, 228, "solicitud / respuesta", { size: 8.6, weight: 650, color: C.teal, anchor: "end" })}

    ${flow([[1030, 186], [1030, 230], [800, 230], [800, 250]], { color: C.teal, marker: "teal" })}
    ${solidBadge(900, 230, "F7", C.teal)}
    ${text(880, 218, "asignación", { size: 8.6, weight: 650, color: C.teal, anchor: "middle" })}

    ${flow([[1120, 90], [1120, 84], [150, 84], [150, 280]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(150, 150, "F8", C.indigo)}
    ${text(610, 76, "conductor asignado y ETA", { size: 8.7, weight: 650, color: C.indigo })}

    ${flow([[1240, 130], [1350, 130], [1350, 440], [960, 440]], { color: C.teal, marker: "teal" })}
    ${solidBadge(1350, 200, "F13", C.teal)}
    ${text(1362, 240, "viaje activo", { size: 8.6, weight: 650, color: C.teal, anchor: "start" })}

    <!-- Cancelación -->
    ${bi([[240, 340], [280, 340], [280, 400], [320, 400]], C.amber, "amber")}
    ${solidBadge(280, 370, "F9", C.amber)}
    ${text(292, 362, "cancelación", { size: 8.6, weight: 650, color: C.amber, anchor: "start" })}

    ${flow([[440, 380], [440, 340], [660, 340], [660, 330]], { color: C.amber, marker: "amber" })}
    ${solidBadge(520, 340, "F10", C.amber)}
    ${text(520, 330, "estado cancelado", { size: 8.6, weight: 650, color: C.amber })}

    ${bi([[560, 430], [600, 430], [600, 600], [1400, 600], [1400, 380]], C.amber, "amber")}
    ${solidBadge(760, 600, "F11", C.amber)}
    ${text(870, 592, "cancelación del conductor", { size: 8.7, weight: 650, color: C.amber })}

    <!-- Gestión -->
    ${bi([[820, 380], [820, 330]], C.teal, "teal")}
    ${text(832, 362, "estado", { size: 8.5, weight: 650, color: C.teal, anchor: "start" })}

    ${bi([[960, 420], [1300, 420], [1300, 340], [1360, 340]], C.teal, "teal")}
    ${solidBadge(1120, 420, "F12", C.teal)}
    ${text(1180, 410, "en camino / inicio / fin", { size: 8.7, weight: 650, color: C.teal })}

    ${flow([[800, 476], [800, 560], [1100, 560], [1100, 620]], { color: C.teal, marker: "teal" })}
    ${solidBadge(900, 560, "F14", C.teal)}
    ${text(900, 550, "viaje finalizado", { size: 8.6, weight: 650, color: C.teal })}

    <!-- Precio -->
    ${bi([[1040, 660], [700, 660], [700, 330]], C.teal, "teal")}
    ${solidBadge(700, 440, "F15", C.teal)}
    ${text(698, 490, "distancia / tarifa", { size: 8.6, weight: 650, color: C.teal, anchor: "end" })}

    ${flow([[1280, 668], [1360, 668]], { color: C.amber, marker: "amber" })}
    ${solidBadge(1320, 668, "F16", C.amber)}
    ${text(1320, 658, "monto", { size: 8.5, weight: 650, color: C.amber })}

    ${flow([[1040, 700], [1000, 700], [1000, 780], [140, 780], [140, 400]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(620, 780, "F17", C.indigo)}
    ${text(620, 770, "tarifa confirmada / recibo", { size: 8.7, weight: 650, color: C.indigo })}

    ${footnote(W, 872, "Los flujos de cancelación y rechazo no eliminan el registro: actualizan el estado del viaje y disparan la reversión o liberación del pago en P09.")}
  `, { ariaLabel: "DFD nivel 2B de MotoUber: ciclo completo del viaje, desde la solicitud hasta el cálculo del precio" });
}
