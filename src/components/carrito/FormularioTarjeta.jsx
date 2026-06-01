import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";

const FormularioTarjeta = ({ show, onHide, onPagoExitoso }) => {
  const [tarjeta, setTarjeta] = useState({
    numero: "",
    nombre: "",
    expiracion: "",
    cvv: "",
  });
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  // Detección visual del tipo de tarjeta según el primer dígito
  const detectarTipoTarjeta = (numero) => {
    const num = numero.replace(/\s/g, "");
    if (num.startsWith("4")) return { nombre: "Visa", color: "#1a73e8", icono: "bi-credit-card-2-front" };
    if (num.startsWith("5")) return { nombre: "Mastercard", color: "#eb001b", icono: "bi-credit-card" };
    return { nombre: "", color: "#6c757d", icono: "bi-credit-card" };
  };

  const tipoTarjeta = detectarTipoTarjeta(tarjeta.numero);

  // Formato del número para la vista previa
  const formatoPreview = (numero) => {
    const num = numero.replace(/\s/g, "");
    if (num.length <= 4) return numero;
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  // Validación de campos
  const validar = () => {
    const nuevosErrores = {};
    if (!/^\d{16}$/.test(tarjeta.numero.replace(/\s/g, ""))) {
      nuevosErrores.numero = "Debe contener 16 dígitos";
    }
    if (!tarjeta.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }
    const [mes] = tarjeta.expiracion.split("/");
    if (!/^\d{2}\/\d{2}$/.test(tarjeta.expiracion) || parseInt(mes) < 1 || parseInt(mes) > 12) {
      nuevosErrores.expiracion = "Formato inválido (MM/YY)";
    }
    if (!/^\d{3,4}$/.test(tarjeta.cvv)) {
      nuevosErrores.cvv = "Debe tener 3 o 4 dígitos";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejo de cambios con formateo automático
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valor = value;

    if (name === "numero") {
      const soloNumeros = value.replace(/\s/g, "").replace(/\D/g, "");
      if (soloNumeros.length > 16) return;
      valor = soloNumeros.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    if (name === "expiracion") {
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length > 4) return;
      if (soloNumeros.length >= 3) {
        valor = soloNumeros.substring(0, 2) + "/" + soloNumeros.substring(2, 4);
      } else if (soloNumeros.length === 2) {
        valor = soloNumeros + "/";
      } else {
        valor = soloNumeros;
      }
    }
    if (name === "cvv") {
      valor = value.replace(/\D/g, "");
      if (valor.length > 4) return;
    }

    setTarjeta({ ...tarjeta, [name]: valor });
    if (errores[name]) {
      setErrores({ ...errores, [name]: undefined });
    }
  };

  // Simulación de procesamiento de pago
  const handlePagar = () => {
    if (!validar()) return;
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      onPagoExitoso();
      onHide();
    }, 1500);
  };

  // Estilos para los inputs
  const inputStyle = {
    paddingLeft: "38px",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "0.92rem",
    height: "44px",
  };

  const iconStyle = {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    fontSize: "1rem",
    zIndex: 1,
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="border-0 rounded-4 shadow-lg">
      <Modal.Header closeButton style={{ borderBottom: "1px solid #f0f0f0", padding: "20px 24px 16px" }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0c0c2c" }}>
          <i className="bi bi-lock-fill me-2" style={{ color: "#ff6a00" }} />
          Pago Seguro
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "24px" }}>
        {/* Vista previa de tarjeta */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tipoTarjeta.color} 0%, ${tipoTarjeta.color}dd 100%)`,
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            color: "white",
            boxShadow: `0 8px 24px ${tipoTarjeta.color}40`,
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, opacity: 0.9 }}>
              {tipoTarjeta.nombre || "Tarjeta"}
            </span>
            <i className={`bi ${tipoTarjeta.icono}`} style={{ fontSize: "1.5rem" }} />
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 600, letterSpacing: "2px", marginTop: "8px" }}>
            {tarjeta.numero ? formatoPreview(tarjeta.numero) : "•••• •••• •••• ••••"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginTop: "8px", opacity: 0.9 }}>
            <span>{tarjeta.nombre || "TITULAR"}</span>
            <span>{tarjeta.expiracion || "MM/YY"}</span>
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>Número de tarjeta</Form.Label>
            <div style={{ position: "relative" }}>
              <i className="bi bi-credit-card" style={iconStyle} />
              <Form.Control
                type="text"
                name="numero"
                placeholder="1234 5678 9012 3456"
                value={tarjeta.numero}
                onChange={handleChange}
                isInvalid={!!errores.numero}
                style={inputStyle}
              />
              <Form.Control.Feedback type="invalid" style={{ fontSize: "0.78rem" }}>{errores.numero}</Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>Nombre del titular</Form.Label>
            <div style={{ position: "relative" }}>
              <i className="bi bi-person" style={iconStyle} />
              <Form.Control
                type="text"
                name="nombre"
                placeholder="Como aparece en la tarjeta"
                value={tarjeta.nombre}
                onChange={handleChange}
                isInvalid={!!errores.nombre}
                style={inputStyle}
              />
              <Form.Control.Feedback type="invalid" style={{ fontSize: "0.78rem" }}>{errores.nombre}</Form.Control.Feedback>
            </div>
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>Fecha de expiración</Form.Label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-calendar" style={iconStyle} />
                  <Form.Control
                    type="text"
                    name="expiracion"
                    placeholder="MM/YY"
                    value={tarjeta.expiracion}
                    onChange={handleChange}
                    isInvalid={!!errores.expiracion}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: "0.78rem" }}>{errores.expiracion}</Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>CVV</Form.Label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-shield-lock" style={iconStyle} />
                  <Form.Control
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={tarjeta.cvv}
                    onChange={handleChange}
                    isInvalid={!!errores.cvv}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: "0.78rem" }}>{errores.cvv}</Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        <div className="d-flex align-items-center justify-content-center mt-3 p-2 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "0.8rem", color: "#166534" }}>
          <i className="bi bi-shield-check me-2" />
          Tus datos están protegidos · Simulación de pago
        </div>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: "1px solid #f0f0f0", padding: "16px 24px" }}>
        <Button variant="light" onClick={onHide} style={{ borderRadius: "10px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>Cancelar</Button>
        <Button
          onClick={handlePagar}
          disabled={procesando}
          style={{
            borderRadius: "10px", fontWeight: 700, fontSize: "0.92rem",
            background: procesando ? "#9ca3af" : "#ff6a00",
            border: "none", padding: "10px 24px",
            boxShadow: "0 4px 12px rgba(255,106,0,0.3)",
          }}
        >
          {procesando ? (
            <><Spinner animation="border" size="sm" className="me-2" /> Procesando...</>
          ) : (
            <><i className="bi bi-lock me-2" /> Pagar</>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormularioTarjeta;