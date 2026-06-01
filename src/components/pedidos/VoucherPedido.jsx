import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";
import {
  conectarQZ,
  imprimirTexto,
  separador,
  centrar,
  filaVoucher,
  CHARS,
} from "../../utils/qzUtils"; // ← ajusta la ruta si es diferente

// ─────────────────────────────────────────────────────────────
//  VoucherPedido.jsx  –  Voucher para cocina (impresora térmica)
//  Usa QZ Tray como puente entre la PWA y la impresora local
// ─────────────────────────────────────────────────────────────

// Nombre exacto de tu impresora en Windows (Panel de control → Dispositivos e impresoras)
// Si lo dejas en null, usa la impresora predeterminada del sistema
const NOMBRE_IMPRESORA = null;

const VoucherPedido = ({ show, onHide, pedidoId }) => {
  const [pedido,      setPedido]      = useState(null);
  const [detalles,    setDetalles]    = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [qzListo,     setQzListo]     = useState(false);
  const [errorQZ,     setErrorQZ]     = useState("");

  // ── Cargar datos del pedido ──────────────────
  useEffect(() => {
    if (!show || !pedidoId) return;

    const cargar = async () => {
      setCargando(true);
      try {
        const { data: pedidoData, error: e1 } = await supabase
          .from("Pedido")
          .select(`
            id_pedido, fecha,
            Clientes (nombre_cliente, apellido_cliente),
            Mesas (id_mesa)
          `)
          .eq("id_pedido", pedidoId)
          .single();
        if (e1) throw e1;
        setPedido(pedidoData);

        const { data: detData, error: e2 } = await supabase
          .from("Detalle_pedido")
          .select(`
            cantidad,
            Platillos (nombre_platillo),
            Extras (descripcion),
            Salsas (descripcion)
          `)
          .eq("id_pedido", pedidoId);
        if (e2) throw e2;
        setDetalles(detData || []);
      } catch (err) {
        console.error("Error cargando voucher:", err);
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

  // ── Generar las líneas del voucher ────────────
  const generarLineas = () => {
    if (!pedido) return [];

    const fecha = new Date(pedido.fecha).toLocaleString("es-NI");
    const cliente = `${pedido.Clientes?.nombre_cliente || ""} ${pedido.Clientes?.apellido_cliente || ""}`.trim();
    const mesa = pedido.Mesas?.id_mesa || "N/A";

    const lineas = [];

    // Encabezado
    lineas.push("\n");
    lineas.push(centrar("TAPMEAL"));
    lineas.push(centrar("** ORDEN DE COCINA **"));
    lineas.push(separador("="));
    lineas.push(`Pedido #: ${pedido.id_pedido}\n`);
    lineas.push(`Fecha   : ${fecha}\n`);
    lineas.push(`Mesa    : ${mesa}\n`);
    lineas.push(`Cliente : ${cliente}\n`);
    lineas.push(separador());

    // Cabecera columnas
    const cantH  = "CANT".padEnd(4);
    const platH  = "PLATILLO".padEnd(Math.floor((CHARS - 4) / 3));
    const extraH = "EXTRA".padEnd(Math.floor((CHARS - 4) / 3));
    const salsaH = "SALSA";
    lineas.push(cantH + platH + extraH + salsaH + "\n");
    lineas.push(separador());

    // Detalles
    if (detalles.length === 0) {
      lineas.push(centrar("(sin items)"));
    } else {
      detalles.forEach((det) => {
        lineas.push(
          filaVoucher(
            det.cantidad,
            det.Platillos?.nombre_platillo || "?",
            det.Extras?.descripcion || "-",
            det.Salsas?.descripcion  || "-"
          )
        );
      });
    }

    lineas.push(separador("="));
    lineas.push(centrar("** ENTREGAR A COCINA **"));
    lineas.push("\n\n\n"); // espacio para corte
    lineas.push("\x1B\x69");  // ESC i — corte parcial (la mayoría de impresoras)

    return lineas;
  };

  // ── Imprimir ──────────────────────────────────
  const imprimir = async () => {
    setImprimiendo(true);
    try {
      await imprimirTexto(NOMBRE_IMPRESORA, generarLineas());
      alert("✅ Voucher enviado a la impresora.");
    } catch (err) {
      console.error(err);
      alert("❌ Error al imprimir: " + err.message);
    } finally {
      setImprimiendo(false);
    }
  };

  // ── Preview en pantalla ───────────────────────
  const preview = generarLineas()
    .join("")
    .replace(/\x1B\x69/g, "") // quitar ESC/POS del preview
    .replace(/\x1B./g, "");

  // ── Render ────────────────────────────────────
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🧾 Voucher Cocina — Pedido #{pedidoId}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cargando ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Aviso de estado QZ */}
            {errorQZ && (
              <div className="alert alert-warning py-2 small">{errorQZ}</div>
            )}
            {!errorQZ && qzListo && (
              <div className="alert alert-success py-2 small">
                ✅ QZ Tray conectado — listo para imprimir
              </div>
            )}

            {/* Preview del ticket */}
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
          variant="primary"
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
              Imprimir Voucher
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VoucherPedido;