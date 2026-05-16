import React, { useState, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";

const FormularioRegistro = ({
  form,
  error,
  cargando,
  manejarCambio,
  registrar,
  irALogin,
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

  // Validaciones en tiempo real
  useEffect(() => {
    const nuevosErrores = {};

    // Nombre - Solo letras y espacios
    const nombre = form.nombre?.trim() || "";
    if (nombre && !/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(nombre)) {
      nuevosErrores.nombre = "Solo se permiten letras y espacios";
    } else if (nombre && nombre.length < 2) {
      nuevosErrores.nombre = "Mínimo 2 caracteres";
    }

    // Apellido - Solo letras y espacios
    const apellido = form.apellido?.trim() || "";
    if (apellido && !/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(apellido)) {
      nuevosErrores.apellido = "Solo se permiten letras y espacios";
    } else if (apellido && apellido.length < 2) {
      nuevosErrores.apellido = "Mínimo 2 caracteres";
    }

    // Teléfono - Exactamente 8 números
    const telefono = form.telefono?.trim() || "";
    if (telefono && !/^\d{8}$/.test(telefono)) {
      nuevosErrores.telefono = "Debe tener exactamente 8 dígitos";
    }

    // Dirección - Letras, números y caracteres básicos
    const direccion = form.direccion?.trim() || "";
    if (direccion && !/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s.,#-]+$/.test(direccion)) {
      nuevosErrores.direccion = "Solo letras, números y (. , # -)";
    }

    // Correo - Solo @gmail.com
    const correo = form.correo?.trim() || "";
    if (correo && !/^[^\s@]+@gmail\.com$/i.test(correo)) {
      nuevosErrores.correo = "Solo se permiten correos @gmail.com";
    }

    // Contraseña - Mínimo 6 caracteres
    const contrasena = form.contrasena || "";
    if (contrasena && contrasena.length < 6) {
      nuevosErrores.contrasena = "Mínimo 6 caracteres";
    }

    // Confirmar Contraseña
    if (form.confirmarContrasena && form.confirmarContrasena !== contrasena) {
      nuevosErrores.confirmarContrasena = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
  }, [form]);

  const esFormularioValido = Object.keys(errores).length === 0;

  return (
    <div style={{
      width: "100%",
      maxWidth: 460,
      background: "white",
      borderRadius: 16,
      padding: "36px 32px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
      fontFamily: "'Segoe UI', sans-serif",
    }}>

      {/* Encabezado */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(255,106,0,0.1)", color: "#ff6a00",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", margin: "0 auto 14px",
        }}>
          <i className="bi bi-person-plus-fill" />
        </div>
        <h4 style={{ fontWeight: 800, color: "#0c0c2c", margin: 0 }}>Crear cuenta</h4>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "4px 0 0" }}>
          Regístrate para ordenar tus platillos favoritos
        </p>
      </div>

      {/* Error general */}
      {error && (
        <Alert variant="danger" style={{ borderRadius: 10, fontSize: "0.88rem" }}>
          <i className="bi bi-exclamation-circle me-2" />{error}
        </Alert>
      )}

      <Form>
        {/* Nombre y Apellido */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
              Nombre <span style={{ color: "#ef4444" }}>*</span>
            </Form.Label>
            <div style={{ position: "relative" }}>
              <i className="bi bi-person" style={iconStyle} />
              <Form.Control
                type="text"
                name="nombre"
                placeholder="Juan"
                value={form.nombre || ""}
                onChange={manejarCambio}
                style={inputStyle}
                isInvalid={!!errores.nombre}
                onKeyPress={(e) => {
                  if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(e.key)) e.preventDefault();
                }}
              />
              <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
              Apellido <span style={{ color: "#ef4444" }}>*</span>
            </Form.Label>
            <div style={{ position: "relative" }}>
              <i className="bi bi-person" style={iconStyle} />
              <Form.Control
                type="text"
                name="apellido"
                placeholder="Pérez"
                value={form.apellido || ""}
                onChange={manejarCambio}
                style={inputStyle}
                isInvalid={!!errores.apellido}
                onKeyPress={(e) => {
                  if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(e.key)) e.preventDefault();
                }}
              />
              <Form.Control.Feedback type="invalid">{errores.apellido}</Form.Control.Feedback>
            </div>
          </Form.Group>
        </div>

        {/* Teléfono */}
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
            Teléfono
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-telephone" style={iconStyle} />
            <Form.Control
              type="tel"
              name="telefono"
              placeholder="88888888"
              value={form.telefono || ""}
              onChange={manejarCambio}
              style={inputStyle}
              isInvalid={!!errores.telefono}
              maxLength={8}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
            />
            <Form.Control.Feedback type="invalid">{errores.telefono}</Form.Control.Feedback>
          </div>
        </Form.Group>

        {/* Dirección */}
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
            Dirección
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-geo-alt" style={iconStyle} />
            <Form.Control
              type="text"
              name="direccion"
              placeholder="Tu dirección"
              value={form.direccion || ""}
              onChange={manejarCambio}
              style={inputStyle}
              isInvalid={!!errores.direccion}
            />
            <Form.Control.Feedback type="invalid">{errores.direccion}</Form.Control.Feedback>
          </div>
        </Form.Group>

        {/* Correo */}
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
            Correo electrónico <span style={{ color: "#ef4444" }}>*</span>
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-envelope" style={iconStyle} />
            <Form.Control
              type="email"
              name="correo"
              placeholder="ejemplo@gmail.com"
              value={form.correo || ""}
              onChange={manejarCambio}
              style={inputStyle}
              isInvalid={!!errores.correo}
            />
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </div>
        </Form.Group>

        {/* Contraseña */}
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
            Contraseña <span style={{ color: "#ef4444" }}>*</span>
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-lock" style={iconStyle} />
            <Form.Control
              type="password"
              name="contrasena"
              placeholder="Mínimo 6 caracteres"
              value={form.contrasena || ""}
              onChange={manejarCambio}
              style={inputStyle}
              isInvalid={!!errores.contrasena}
            />
            <Form.Control.Feedback type="invalid">{errores.contrasena}</Form.Control.Feedback>
          </div>
        </Form.Group>

        {/* Confirmar Contraseña */}
        <Form.Group className="mb-4">
          <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>
            Confirmar contraseña <span style={{ color: "#ef4444" }}>*</span>
          </Form.Label>
          <div style={{ position: "relative" }}>
            <i className="bi bi-lock-fill" style={iconStyle} />
            <Form.Control
              type="password"
              name="confirmarContrasena"
              placeholder="Repite tu contraseña"
              value={form.confirmarContrasena || ""}
              onChange={manejarCambio}
              style={inputStyle}
              isInvalid={!!errores.confirmarContrasena}
            />
            <Form.Control.Feedback type="invalid">{errores.confirmarContrasena}</Form.Control.Feedback>
          </div>
        </Form.Group>

        {/* Botón Registrar */}
        <button
          type="button"
          onClick={registrar}
          disabled={cargando || !esFormularioValido}
          style={{
            width: "100%", 
            padding: "12px",
            background: (cargando || !esFormularioValido) ? "#9ca3af" : "#ff6a00",
            color: "white", 
            border: "none", 
            borderRadius: "10px",
            fontWeight: 700, 
            fontSize: "0.95rem",
            cursor: (cargando || !esFormularioValido) ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </Form>

      {/* Link a Login */}
      <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.88rem", color: "#6b7280" }}>
        ¿Ya tienes cuenta?{" "}
        <span
          onClick={irALogin}
          style={{ color: "#ff6a00", fontWeight: 700, cursor: "pointer" }}
        >
          Inicia sesión
        </span>
      </p>
    </div>
  );
};

export default FormularioRegistro;