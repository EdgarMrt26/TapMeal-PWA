import React, { useState, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";

const FormularioLogin = ({ 
  usuario, 
  contrasena, 
  error, 
  setUsuario, 
  setContrasena, 
  iniciarSesion 
}) => {

  const [errores, setErrores] = useState({});

  // Estilos
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

  // Validación en tiempo real
  useEffect(() => {
    const nuevosErrores = {};

    // Correo electrónico - Solo @gmail.com
    const correo = usuario?.trim() || "";
    if (correo && !/^[^\s@]+@gmail\.com$/i.test(correo)) {
      nuevosErrores.usuario = "Solo se permiten correos @gmail.com";
    }

    // Contraseña - Solo que no esté vacío
    if (contrasena === "") {
      nuevosErrores.contrasena = "La contraseña es obligatoria";
    }

    setErrores(nuevosErrores);
  }, [usuario, contrasena]);

  const esFormularioValido = 
    usuario?.trim() !== "" && 
    contrasena !== "" && 
    Object.keys(errores).length === 0;

  return (
    <div style={{
      minWidth: "320px",
      maxWidth: "400px",
      width: "100%",
      background: "white",
      borderRadius: "16px",
      padding: "36px 32px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
      fontFamily: "'Segoe UI', sans-serif",
    }}>

      {/* Ícono + Título */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(255,106,0,0.1)", color: "#ff6a00",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", margin: "0 auto 14px",
        }}>
          <i className="bi bi-person-fill" />
        </div>
        <h4 style={{ fontWeight: 800, color: "#0c0c2c", margin: 0 }}>Iniciar Sesión</h4>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "4px 0 0" }}>
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Error General */}
      {error && (
        <Alert variant="danger" style={{ borderRadius: 10, fontSize: "0.88rem" }}>
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </Alert>
      )}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>
            Correo electrónico
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-envelope" style={iconStyle} />
            <Form.Control
              type="email"
              placeholder="ejemplo@gmail.com"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={inputStyle}
              isInvalid={!!errores.usuario}
            />
            <Form.Control.Feedback type="invalid">
              {errores.usuario}
            </Form.Control.Feedback>
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#374151" }}>
            Contraseña
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-lock" style={iconStyle} />
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              style={inputStyle}
              isInvalid={!!errores.contrasena}
            />
            <Form.Control.Feedback type="invalid">
              {errores.contrasena}
            </Form.Control.Feedback>
          </div>
        </Form.Group>

        <button
          type="button"
          onClick={iniciarSesion}
          disabled={!esFormularioValido}
          style={{
            width: "100%", 
            padding: "12px",
            background: !esFormularioValido ? "#9ca3af" : "#0c0c2c",
            color: "white",
            border: "none", 
            borderRadius: "10px",
            fontWeight: 700, 
            fontSize: "0.95rem",
            cursor: !esFormularioValido ? "not-allowed" : "pointer",
          }}
        >
          Iniciar Sesión
        </button>
      </Form>
    </div>
  );
};

export default FormularioLogin;