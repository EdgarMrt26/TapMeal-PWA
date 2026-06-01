// ─────────────────────────────────────────────
//  qzUtils.js  –  Puente QZ Tray para TapMeal
// ─────────────────────────────────────────────
//
//  REQUISITO: QZ Tray instalado y corriendo en la PC del restaurante
//  Descarga: https://qz.io/download
//
//  USO:
//    import { conectarQZ, imprimirTexto, desconectarQZ } from "./qzUtils";
//
//  ANCHO DE PAPEL:
//    58mm  →  CHARS_POR_LINEA = 32
//    80mm  →  CHARS_POR_LINEA = 42   ← (valor por defecto)
// ─────────────────────────────────────────────

// Carga el script de QZ Tray dinámicamente si no está cargado
const cargarScriptQZ = () =>
  new Promise((resolve, reject) => {
    if (window.qz) return resolve();
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("No se pudo cargar el script de QZ Tray"));
    document.head.appendChild(script);
  });

// ── Conexión ──────────────────────────────────
export const conectarQZ = async () => {
  await cargarScriptQZ();
  if (window.qz.websocket.isActive()) return; // ya conectado
  await window.qz.websocket.connect();
};

export const desconectarQZ = async () => {
  if (window.qz?.websocket?.isActive()) {
    await window.qz.websocket.disconnect();
  }
};

// ── Impresión ─────────────────────────────────
//
//  @param {string} nombreImpresora  – nombre exacto de la impresora en Windows
//                                    (si es null, usa la impresora por defecto)
//  @param {string[]} lineas         – array de strings ya formateados
//
export const imprimirTexto = async (nombreImpresora, lineas) => {
  await conectarQZ();

  const impresora = nombreImpresora
    ? await window.qz.printers.find(nombreImpresora)
    : await window.qz.printers.getDefault();

  const config = window.qz.configs.create(impresora, {
    encoding: "UTF-8",
    copies: 1,
  });

  // Convertimos cada línea a un dato RAW (ESC/POS texto plano)
  const datos = lineas.map((linea) => ({
    type: "raw",
    format: "plain",
    data: linea,
  }));

  await window.qz.print(config, datos);
};

// ── Helpers de formato ────────────────────────

export const CHARS = 42; // Cambia a 32 si tu papel es de 58mm

// Línea separadora
export const separador = (char = "-") => char.repeat(CHARS) + "\n";

// Texto centrado
export const centrar = (texto) => {
  const espacios = Math.max(0, Math.floor((CHARS - texto.length) / 2));
  return " ".repeat(espacios) + texto + "\n";
};

// Dos columnas: izquierda y derecha
export const dosColumnas = (izq, der) => {
  const izqStr = String(izq).substring(0, CHARS - der.length - 1);
  const espacios = CHARS - izqStr.length - String(der).length;
  return izqStr + " ".repeat(Math.max(1, espacios)) + der + "\n";
};

// Texto largo partido en múltiples líneas (word-wrap manual)
export const wrapTexto = (texto, maxChars = CHARS) => {
  if (texto.length <= maxChars) return texto + "\n";
  const lineas = [];
  let restante = texto;
  while (restante.length > maxChars) {
    lineas.push(restante.substring(0, maxChars));
    restante = restante.substring(maxChars);
  }
  if (restante) lineas.push(restante);
  return lineas.join("\n") + "\n";
};

// Fila de detalle: CANT | PRODUCTO (wrap) | PRECIO | SUBTOTAL
// Ejemplo:  2  Pollo a la plancha    $5.00   $10.00
export const filaDetalle = (cantidad, nombre, precioUnit, subtotal) => {
  const cantStr   = String(cantidad).padEnd(4);           // "2   "
  const precioStr = `$${Number(precioUnit).toFixed(2)}`.padStart(7); // " $5.00"
  const subtStr   = `$${Number(subtotal).toFixed(2)}`.padStart(8);   // "  $10.00"
  const anchoNombre = CHARS - cantStr.length - precioStr.length - subtStr.length - 2;

  if (nombre.length <= anchoNombre) {
    return cantStr + nombre.padEnd(anchoNombre) + " " + precioStr + subtStr + "\n";
  }

  // Si el nombre es muy largo: primera línea con precios, resto indentado
  const primerFragmento = nombre.substring(0, anchoNombre).padEnd(anchoNombre);
  const resto = nombre.substring(anchoNombre);
  const indent = " ".repeat(cantStr.length);

  let resultado = cantStr + primerFragmento + " " + precioStr + subtStr + "\n";
  let restante = resto;
  while (restante.length > 0) {
    resultado += indent + restante.substring(0, anchoNombre) + "\n";
    restante = restante.substring(anchoNombre);
  }
  return resultado;
};

// Fila de voucher cocina: CANT | PLATILLO | EXTRA | SALSA
export const filaVoucher = (cantidad, platillo, extra, salsa) => {
  const cantStr  = String(cantidad).padEnd(4);
  const anchoRestante = CHARS - cantStr.length;
  const anchoCada = Math.floor(anchoRestante / 3);

  const platStr  = (platillo || "").substring(0, anchoCada).padEnd(anchoCada);
  const extraStr = (extra    || "-").substring(0, anchoCada).padEnd(anchoCada);
  const salsaStr = (salsa    || "-").substring(0, CHARS - cantStr.length - anchoCada * 2);

  return cantStr + platStr + extraStr + salsaStr + "\n";
};