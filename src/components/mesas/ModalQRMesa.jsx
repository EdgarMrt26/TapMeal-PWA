import React, { useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

const ModalQRMesa = ({ mostrarModalQR, setMostrarModalQR, mesaSeleccionada }) => {
  const qrRef = useRef(null);
  const [descargando, setDescargando] = useState(false);

  if (!mesaSeleccionada) return null;

  // Construir URL completa para la mesa (ruta del POS)
  const urlMesa = `${window.location.origin}/menu/${mesaSeleccionada.id_mesa}`;

  const descargarQR = async () => {
    if (!qrRef.current) return;
    setDescargando(true);
    try {
      const dataUrl = await toPng(qrRef.current, {
        backgroundColor: "white",
        quality: 1,
      });
      const enlace = document.createElement("a");
      enlace.download = `qr_mesa_${mesaSeleccionada.nombre_mesa.replace(/\s+/g, "_")}.png`;
      enlace.href = dataUrl;
      enlace.click();
    } catch (error) {
      console.error("Error al descargar QR:", error);
      alert("No se pudo descargar el código QR.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Modal
      show={mostrarModalQR}
      onHide={() => setMostrarModalQR(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Código QR - {mesaSeleccionada.nombre_mesa}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="text-muted mb-3">
          Escanea este QR para abrir la mesa en el sistema POS.
        </p>
        <div
          ref={qrRef}
          style={{
            background: "white",
            padding: "16px",
            display: "inline-block",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <QRCode value={urlMesa} size={220} level="H" />
        </div>
        <Form.Text className="text-muted d-block">
          URL: {urlMesa}
        </Form.Text>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalQR(false)}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={descargarQR}
          disabled={descargando}
        >
          {descargando ? "Descargando..." : "📥 Descargar QR"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQRMesa;