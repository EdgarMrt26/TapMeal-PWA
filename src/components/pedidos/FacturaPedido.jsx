import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";
import {
  conectarQZ,
  imprimirTexto,
  separador,
  centrar,
  dosColumnas,
  filaDetalle,
} from "../../utils/qzUtils"; // ← ajusta la ruta si es diferente

// ─────────────────────────────────────────────────────────────
//  FacturaPedido.jsx  –  Factura cliente (impresora térmica)
//  Usa QZ Tray como puente entre la PWA y la impresora local
// ─────────────────────────────────────────────────────────────

// Nombre exacto de tu impresora en Windows (Panel de control → Dispositivos e impresoras)
// Si lo dejas en null, usa la impresora predeterminada del sistema
const NOMBRE_IMPRESORA = null;

const FacturaPedido = ({ show, onHide, pedidoId }) => {
  const [factura,     setFactura]     = useState(null);
  const [detalles,    setDetalles]    = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [qzListo,     setQzListo]     = useState(false);
  const [errorQZ,     setErrorQZ]     = useState("");

  // ── Cargar datos ──────────────────────────────
  useEffect(() => {
    if (!show || !pedidoId) return;

    const cargar = async () => {
      setCargando(true);
      try {
        const { data: pedidoData, error: e1 } = await supabase
          .from("Pedido")
          .select(`
            id_pedido, fecha, total,
            Clientes (nombre_cliente, apellido_cliente, telefono, direccion),
            Mesas (id_mesa)
          `)
          .eq("id_pedido", pedidoId)
          .single();
        if (e1) throw e1;
        setFactura(pedidoData);

        const { data: detData, error: e2 } = await supabase
          .from("Detalle_pedido")
          .select(`
            cantidad, precio_unitario,
            Platillos (nombre_platillo)
          `)
          .eq("id_pedido", pedidoId);
        if (e2) throw e2;
        setDetalles(detData || []);
      } catch (err) {
        console.error("Error cargando factura:", err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [show, pedidoId]);

  // ── Conectar QZ Tray al abrir el modal ────────
  useEffect(() => {
    if (!show) return;
    setErrorQZ("");

    const intentarConexion = async () => {
      try {
        await conectarQZ();
        setQzListo(true);
      } catch {
        setQzListo(false);
        setErrorQZ(
          "⚠️ No se pudo conectar con QZ Tray. Asegúrate de que esté instalado y corriendo en esta PC."
        );
      }
    };

    intentarConexion();
  }, [show]);

  // ── Cálculos ──────────────────────────────────
  const subtotal = factura?.total || 0;
  const iva      = subtotal * 0.15;
  const total    = subtotal + iva;

  // ── Generar líneas de la factura ──────────────
  const generarLineas = () => {
    if (!factura) return [];

    const fecha   = new Date(factura.fecha).toLocaleString("es-NI");
    const cliente = `${factura.Clientes?.nombre_cliente || ""} ${factura.Clientes?.apellido_cliente || ""}`.trim();
    const mesa    = factura.Mesas?.id_mesa || "N/A";
    const tel     = factura.Clientes?.telefono  || null;
    const dir     = factura.Clientes?.direccion || null;

    const lineas = [];

    // Encabezado
    lineas.push("\n");
    lineas.push(centrar("TAPMEAL"));
    lineas.push(centrar("FACTURA"));
    lineas.push(separador("="));
    lineas.push(`N° Pedido : ${factura.id_pedido}\n`);
    lineas.push(`Fecha     : ${fecha}\n`);
    lineas.push(`Mesa      : ${mesa}\n`);
    lineas.push(separador());

    // Datos del cliente
    lineas.push(`Cliente : ${cliente}\n`);
    if (tel) lineas.push(`Tel     : ${tel}\n`);
    if (dir) lineas.push(`Dir     : ${dir}\n`);
    lineas.push(separador());

    // Cabecera de ítems
    lineas.push("CANT PRODUCTO              P.UNIT  SUBTOT\n");
    lineas.push(separador());

    // Ítems
    if (detalles.length === 0) {
      lineas.push(centrar("(sin items)"));
    } else {
      detalles.forEach((det) => {
        const subt = det.cantidad * det.precio_unitario;
        lineas.push(
          filaDetalle(
            det.cantidad,
            det.Platillos?.nombre_platillo || "?",
            det.precio_unitario,
            subt
          )
        );
      });
    }

    // Totales
    lineas.push(separador());
    lineas.push(dosColumnas("Subtotal :", `$${subtotal.toFixed(2)}`));
    lineas.push(dosColumnas("IVA (15%):", `$${iva.toFixed(2)}`));
    lineas.push(separador("-"));
    lineas.push(dosColumnas("TOTAL    :", `$${total.toFixed(2)}`));
    lineas.push(separador("="));

    // Pie
    lineas.push(centrar("Gracias por su visita"));
    lineas.push(centrar("TapMeal - Sistema de pedidos"));
    lineas.push("\n\n\n");
    lineas.push("\x1B\x69"); // ESC i — corte parcial

    return lineas;
  };

  // ── Imprimir ──────────────────────────────────
  const imprimir = async () => {
    setImprimiendo(true);
    try {
      await imprimirTexto(NOMBRE_IMPRESORA, generarLineas());
      alert("✅ Factura enviada a la impresora.");
    } catch (err) {
      console.error(err);
      alert("❌ Error al imprimir: " + err.message);
    } finally {
      setImprimiendo(false);
    }
  };

  // ── Preview ───────────────────────────────────
  const preview = generarLineas()
    .join("")
    .replace(/\x1B\x69/g, "")
    .replace(/\x1B./g, "");

  // ── Render ────────────────────────────────────
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🧾 Factura — Pedido #{pedidoId}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cargando ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">Cargando datos...</p>
          </div>
        ) : (
          <>
            {errorQZ && (
              <div className="alert alert-warning py-2 small">{errorQZ}</div>
            )}
            {!errorQZ && qzListo && (
              <div className="alert alert-success py-2 small">
                ✅ QZ Tray conectado — listo para imprimir
              </div>
            )}

            <pre
              style={{
                fontFamily: "Courier New, Courier, monospace",
                fontSize: "12px",
                background: "#f8f8f8",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "12px",
                maxHeight: "55vh",
                overflowY: "auto",
                whiteSpace: "pre",
              }}
            >
              {preview}
            </pre>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button
          variant="success"
          onClick={imprimir}
          disabled={cargando || imprimiendo || !qzListo}
          title={!qzListo ? "QZ Tray no está conectado" : ""}
        >
          {imprimiendo ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Enviando...
            </>
          ) : (
            <>
              <i className="bi bi-printer me-1"></i>
              Imprimir Factura
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FacturaPedido;