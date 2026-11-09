import {
  C, doc, text, actor, flow, processBox, store, solidBadge, titleBlock, footnote, legendFlow, legendBox,
} from "../svg.mjs";

export function dfd2aDiagram() {
  const W = 1200;
  const H = 545;
  const bi = (pts, color, marker) => flow(pts, { color, marker, bi: true, width: 1.55 });

  return doc(W, H, `
    ${titleBlock(W, "DFD nivel 2A · Identidad y acceso", "P01 Registro de cuentas · P02 Inicio de sesión verificado por rol", {
      accent: C.indigo,
      right: `${legendBox(840, 46, C.indigo, C.indigoSoft, "proceso", "process")}
              ${legendBox(956, 46, C.teal, C.tealSoft, "almacén", "store")}
              ${legendFlow(1068, 46, C.slate, "flujo")}`,
    })}

    ${actor(60, 100, 190, 85, "Pasajero", "ROL · PASAJERO", { color: C.indigo, soft: C.indigoSoft, icon: "pasajero" })}
    ${actor(60, 235, 190, 85, "Motoconchista", "ROL · CONDUCTOR", { color: C.teal, soft: C.tealSoft, icon: "moto" })}
    ${actor(60, 370, 190, 85, "Administrador", "ROL · ADMIN", { color: C.amber, soft: C.amberSoft, icon: "admin" })}

    ${processBox(360, 100, 260, "P01", "Registro de cuentas", "valida datos y crea el perfil de rol", { color: C.indigo, soft: C.indigoSoft, h: 100 })}
    ${processBox(360, 330, 260, "P02", "Inicio de sesión", "verifica credenciales y emite sesión", { color: C.indigo, soft: C.indigoSoft, h: 100 })}

    ${store(820, 215, 260, "D1", "USUARIO", "credenciales, rol y estado", { color: C.teal, soft: C.tealSoft, h: 90 })}

    <!-- P01 -->
    ${bi([[250, 142], [360, 142]], C.indigo, "indigo")}
    ${solidBadge(305, 142, "F1", C.indigo)}
    ${text(305, 132, "datos de registro", { size: 8.6, weight: 650, color: C.indigo, anchor: "middle" })}

    ${bi([[250, 277], [310, 277], [310, 175], [360, 175]], C.teal, "teal")}
    ${solidBadge(310, 242, "F2", C.teal)}
    ${text(298, 238, "datos de registro", { size: 8.6, weight: 650, color: C.teal, anchor: "end" })}

    ${flow([[490, 200], [490, 330]], { color: C.indigo, marker: "indigo" })}
    ${solidBadge(490, 270, "F6", C.indigo)}
    ${text(505, 270, "usuario creado", { size: 8.6, weight: 650, color: C.indigo, anchor: "start" })}

    ${flow([[620, 150], [730, 150], [730, 240], [820, 240]], { color: C.teal, marker: "teal" })}
    ${solidBadge(730, 215, "F7", C.teal)}
    ${text(760, 194, "nuevo usuario + rol", { size: 8.6, weight: 650, color: C.teal, anchor: "start" })}

    <!-- P02 -->
    ${bi([[250, 160], [340, 160], [340, 360], [360, 360]], C.indigo, "indigo")}
    ${solidBadge(340, 220, "F3", C.indigo)}
    ${text(295, 172, "credenciales", { size: 8.6, weight: 650, color: C.indigo, anchor: "middle" })}

    ${bi([[250, 290], [330, 290], [330, 385], [360, 385]], C.teal, "teal")}
    ${solidBadge(330, 338, "F4", C.teal)}
    ${text(320, 376, "credenciales", { size: 8.6, weight: 650, color: C.teal, anchor: "end" })}

    ${bi([[250, 412], [360, 412]], C.amber, "amber")}
    ${solidBadge(305, 412, "F5", C.amber)}
    ${text(305, 402, "credenciales", { size: 8.6, weight: 650, color: C.amber, anchor: "middle" })}

    ${flow([[620, 380], [760, 380], [760, 290], [820, 290]], { color: C.teal, marker: "teal" })}
    ${solidBadge(760, 335, "F8", C.teal)}
    ${text(772, 352, "verifica / actualiza", { size: 8.6, weight: 650, color: C.teal, anchor: "start" })}

    ${text(750, 500, "La sesión incluye el rol para habilitar las rutas y permisos del front-end React.", { size: 9, weight: 500, color: C.muted2, anchor: "middle", italic: true })}
    ${footnote(W, 524, "Regla de negocio: un correo solo puede pertenecer a un usuario y cada usuario tiene exactamente un rol. La contraseña se almacena como hash, nunca en texto plano.")}
  `, { ariaLabel: "DFD nivel 2A de MotoUber: registro de cuentas e inicio de sesión" });
}
