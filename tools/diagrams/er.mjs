import {
  C, doc, text, entity, relation, titleBlock, footnote, legendBox, esc,
} from "../svg.mjs";

export function erDiagram() {
  const W = 1520;
  const H = 1180;

  const usuario = entity(55, 400, 270, "USUARIO", [
    { name: "id_usuario", type: "INT", key: "PK" },
    { name: "nombre", type: "VARCHAR(120)" },
    { name: "correo", type: "VARCHAR(160)", key: "UQ" },
    { name: "telefono", type: "VARCHAR(20)" },
    { name: "contrasena", type: "VARCHAR(255)" },
    { name: "rol", type: "ENUM" },
  ], { color: C.indigo, subtitle: "ENTIDAD BASE · IDENTIDAD", badge: "1FN · 2FN · 3FN" });

  const pasajero = entity(410, 140, 270, "PASAJERO", [
    { name: "id_pasajero", type: "INT", key: "PK" },
    { name: "id_usuario", type: "INT", key: "FK" },
    { name: "metodo_pago_preferido", type: "VARCHAR(40)" },
  ], { color: C.indigo, subtitle: "ESPECIALIZACIÓN 1:1" });

  const moto = entity(410, 300, 270, "MOTOCONCHISTA", [
    { name: "id_motoconchista", type: "INT", key: "PK" },
    { name: "id_usuario", type: "INT", key: "FK" },
    { name: "licencia", type: "VARCHAR(40)" },
    { name: "disponibilidad", type: "BOOLEAN" },
    { name: "datos_bancarios", type: "VARCHAR(255)" },
  ], { color: C.indigo, subtitle: "ESPECIALIZACIÓN 1:1" });

  const admin = entity(410, 520, 270, "ADMINISTRADOR", [
    { name: "id_administrador", type: "INT", key: "PK" },
    { name: "id_usuario", type: "INT", key: "FK" },
    { name: "nivel_permiso", type: "VARCHAR(30)" },
  ], { color: C.indigo, subtitle: "ESPECIALIZACIÓN 1:1" });

  const patrocinador = entity(55, 800, 270, "PATROCINADOR", [
    { name: "id_patrocinador", type: "INT", key: "PK" },
    { name: "nombre_empresa", type: "VARCHAR(140)" },
    { name: "contacto", type: "VARCHAR(140)" },
    { name: "tipo_acuerdo", type: "VARCHAR(60)" },
    { name: "estado", type: "VARCHAR(20)" },
  ], { color: C.rose, subtitle: "ALIADO COMERCIAL" });

  const acuerdo = entity(410, 770, 300, "ACUERDO_PATROCINIO", [
    { name: "id_acuerdo", type: "INT", key: "PK" },
    { name: "id_patrocinador", type: "INT", key: "FK" },
    { name: "id_administrador", type: "INT", key: "FK" },
    { name: "monto", type: "DECIMAL(10,2)" },
    { name: "fecha_inicio", type: "DATE" },
    { name: "fecha_fin", type: "DATE" },
    { name: "estado", type: "VARCHAR(20)" },
  ], { color: C.rose, subtitle: "CONVENIO · 3FN" });

  const viaje = entity(800, 220, 300, "VIAJE", [
    { name: "id_viaje", type: "INT", key: "PK" },
    { name: "id_pasajero", type: "INT", key: "FK" },
    { name: "id_motoconchista", type: "INT", key: "FK" },
    { name: "origen", type: "VARCHAR(200)" },
    { name: "destino", type: "VARCHAR(200)" },
    { name: "distancia_km", type: "DECIMAL(6,2)" },
    { name: "tarifa", type: "DECIMAL(10,2)" },
    { name: "estado", type: "VARCHAR(20)" },
    { name: "fecha_solicitud", type: "DATETIME" },
    { name: "fecha_fin", type: "DATETIME" },
  ], { color: C.teal, subtitle: "NÚCLEO OPERATIVO", badge: "P03–P08" });

  const pago = entity(1200, 150, 280, "PAGO", [
    { name: "id_pago", type: "INT", key: "PK" },
    { name: "id_viaje", type: "INT", key: "FK" },
    { name: "id_administrador", type: "INT", key: "FK" },
    { name: "monto", type: "DECIMAL(10,2)" },
    { name: "metodo", type: "VARCHAR(30)" },
    { name: "estado", type: "VARCHAR(20)" },
    { name: "referencia", type: "VARCHAR(60)" },
    { name: "fecha_pago", type: "DATETIME" },
  ], { color: C.amber, subtitle: "TRANSACCIÓN 1:1 CON VIAJE", badge: "P09" });

  const calificacion = entity(1200, 590, 280, "CALIFICACION", [
    { name: "id_calificacion", type: "INT", key: "PK" },
    { name: "id_viaje", type: "INT", key: "FK" },
    { name: "puntuacion", type: "TINYINT" },
    { name: "comentario", type: "VARCHAR(500)" },
    { name: "fecha", type: "DATETIME" },
  ], { color: C.blue, subtitle: "REPUTACIÓN · P10" });

  const relations = [
    relation([[325, 450], [370, 450], [370, 205], [410, 205]], {
      from: "one", to: "oneOptional", color: C.indigo,
    }),
    relation([[325, 510], [385, 510], [385, 390], [410, 390]], {
      from: "one", to: "oneOptional", color: C.indigo,
    }),
    relation([[325, 560], [395, 560], [395, 585], [410, 585]], {
      from: "one", to: "oneOptional", color: C.indigo,
    }),

    relation([[680, 205], [740, 205], [740, 300], [800, 300]], {
      from: "one", to: "many", color: C.teal, label: "solicita", lx: 750, ly: 250, labelColor: C.teal, anchor: "start",
    }),
    relation([[680, 390], [770, 390], [770, 360], [800, 360]], {
      from: "one", to: "many", color: C.teal, label: "atiende", lx: 782, ly: 348, labelColor: C.teal, anchor: "start",
    }),

    relation([[1100, 280], [1200, 280]], {
      from: "one", to: "oneOptional", color: C.amber, label: "genera", lx: 1150, ly: 270, labelColor: C.amber,
    }),
    relation([[1100, 470], [1150, 470], [1150, 660], [1200, 660]], {
      from: "one", to: "oneOptional", color: C.blue, label: "recibe", lx: 1157, ly: 545, labelColor: C.blue, anchor: "start",
    }),

    relation([[325, 870], [370, 870], [370, 850], [410, 850]], {
      from: "one", to: "many", color: C.rose, label: "firma", lx: 372, ly: 830, labelColor: C.rose, anchor: "start",
    }),
    relation([[545, 650], [545, 770]], {
      from: "one", to: "many", color: C.rose, label: "gestiona", lx: 553, ly: 714, labelColor: C.rose, anchor: "start",
    }),

    // FK opcional: administrador autoriza la liquidación registrada en PAGO
    relation([[680, 585], [730, 585], [730, 1040], [1500, 1040], [1500, 420], [1450, 420], [1450, 405]], {
      from: "one", to: "oneOptional", color: C.slate, dashed: true, radius: 14,
      label: "autoriza liquidación · FK id_administrador", lx: 945, ly: 1028, labelColor: C.slate,
    }),
  ].join("");

  const dots = [
    ["Identidad", C.indigo, 430],
    ["Viaje", C.teal, 555],
    ["Pagos", C.amber, 660],
    ["Reputación", C.blue, 775],
    ["Patrocinio", C.rose, 920],
  ];

  const legend = dots.map(([label, color, x]) =>
    `<circle cx="${x}" cy="97" r="4.5" fill="${color}"/>${text(x + 9, 101, label, { size: 9.5, weight: 650, color: C.muted })}`
  ).join("");

  const pkLegend = `
    <g transform="translate(1110 82)">
      <rect x="0" y="0" width="23" height="15" rx="3.5" fill="#fffbeb" stroke="#f59e0b" stroke-opacity=".5"/>
      ${text(11.5, 10.8, "PK", { size: 7.4, weight: 750, color: "#92400e", anchor: "middle", mono: true })}
      <rect x="31" y="0" width="23" height="15" rx="3.5" fill="#eff6ff" stroke="#60a5fa" stroke-opacity=".5"/>
      ${text(42.5, 10.8, "FK", { size: 7.4, weight: 750, color: "#1d4ed8", anchor: "middle", mono: true })}
      <rect x="62" y="0" width="23" height="15" rx="3.5" fill="#f5f3ff" stroke="#a78bfa" stroke-opacity=".55"/>
      ${text(73.5, 10.8, "UQ", { size: 7.4, weight: 750, color: "#6d28d9", anchor: "middle", mono: true })}
      ${text(96, 10.8, "clave / valor único", { size: 9, weight: 550, color: C.muted })}
    </g>`;

  return doc(W, H, `
    ${titleBlock(W, "Modelo Entidad-Relación · MotoUber", "Especialización de Usuario, núcleo del viaje y entidades transaccionales · Tercera Forma Normal (3FN)", {
      accent: C.indigo,
      right: `${text(1486, 45, "9 tablas · 10 relaciones", { size: 10, weight: 650, color: C.muted, anchor: "end" })}
              ${text(1486, 62, "Notación pata de gallo", { size: 9.2, weight: 500, color: C.muted2, anchor: "end" })}`,
    })}
    ${legend}
    ${pkLegend}
    ${usuario.svg}
    ${pasajero.svg}
    ${moto.svg}
    ${admin.svg}
    ${patrocinador.svg}
    ${acuerdo.svg}
    ${viaje.svg}
    ${pago.svg}
    ${calificacion.svg}
    ${relations}

    <g opacity=".92">
      ${legendBox(55, 1082, C.indigo, C.indigoSoft, "Usuario y especializaciones", "box")}
      ${legendBox(340, 1082, C.teal, C.tealSoft, "Viaje", "box")}
      ${legendBox(470, 1082, C.amber, C.amberSoft, "Pago", "box")}
      ${legendBox(610, 1082, C.blue, C.blueSoft, "Calificación", "box")}
      ${legendBox(780, 1082, C.rose, C.roseSoft, "Patrocinio", "box")}
      ${text(960, 1086, "1 ── N", { size: 10, weight: 750, color: C.slate, mono: true })}
      ${text(1015, 1086, "uno a muchos", { size: 9, weight: 500, color: C.muted })}
      ${text(1110, 1086, "1 ── 0..1", { size: 10, weight: 750, color: C.slate, mono: true })}
      ${text(1180, 1086, "uno a uno opcional", { size: 9, weight: 500, color: C.muted })}
    </g>
    ${footnote(W, 1148, "PK = clave primaria · FK = clave foránea · UQ = restricción de unicidad · La línea punteada representa la FK opcional de autorización de liquidación.", { color: C.muted })}
    ${text(34, 1166, "Cada especialización comparte la PK de USUARIO mediante una FK UNIQUE: un usuario posee exactamente un perfil de rol. Pago y calificación son 1:1 con el viaje.", { size: 9.2, weight: 500, color: C.muted2 })}
  `, { ariaLabel: "Diagrama entidad-relación del sistema MotoUber con nueve entidades, claves y cardinalidades" });
}
