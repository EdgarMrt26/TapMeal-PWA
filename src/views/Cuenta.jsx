import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Accordion, Button, Spinner, Modal, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";

export default function Cuenta() {
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "cliente",
    telefono: "",
    direccion: "",
    id_cliente: null
  });

  // Estado para un mock de modo oscuro
  const [modoOscuro, setModoOscuro] = useState(false);
  const navegar = useNavigate();

  // Estados para Edición de Perfil
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [valoresEdicion, setValoresEdicion] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: ""
  });
  const [errores, setErrores] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: ""
  });
  const [guardando, setGuardando] = useState(false);

  // Estado para notificaciones
  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "exito"
  });

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setCargando(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navegar("/login");
          return;
        }

        const email = session.user.email;
        const rol = session.user.user_metadata?.rol || "cliente";
        const idCliente = session.user.user_metadata?.id_cliente;

        if (rol !== "cliente") {
          // El administrador (o cualquier rol que no sea cliente) no tiene acceso a esta sección
          navegar("/categorias");
          return;
        }

        // Si es cliente, intentamos jalar sus datos de la tabla Clientes
        if (idCliente) {
          const { data: clienteData, error } = await supabase
            .from("Clientes")
            .select("*")
            .eq("id_cliente", idCliente)
            .single();

          if (!error && clienteData) {
            setUsuario({
              nombre: clienteData.nombre_cliente || "Usuario",
              apellido: clienteData.apellido_cliente || "TapMeal",
              email: email,
              rol: "cliente",
              telefono: clienteData.telefono || "No registrado",
              direccion: clienteData.direccion || "No registrada",
              id_cliente: idCliente
            });
          } else {
            // Fallback con datos de sesión
            setUsuario(prev => ({
              ...prev,
              nombre: session.user.user_metadata?.nombre || "Cliente",
              apellido: session.user.user_metadata?.apellido || "",
              email: email,
              rol: "cliente",
              id_cliente: idCliente
            }));
          }
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosUsuario();
  }, [navegar]);

  // Validación en tiempo real del formulario de edición
  useEffect(() => {
    if (!mostrarModalEdicion) return;

    const nuevosErrores = { ...errores };

    // Nombre
    const nombre = valoresEdicion.nombre?.trim() || "";
    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(nombre)) {
      nuevosErrores.nombre = "Solo se permiten letras y espacios";
    } else if (nombre.length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres";
    } else {
      nuevosErrores.nombre = "";
    }

    // Apellido
    const apellido = valoresEdicion.apellido?.trim() || "";
    if (!apellido) {
      nuevosErrores.apellido = "El apellido es obligatorio";
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(apellido)) {
      nuevosErrores.apellido = "Solo se permiten letras y espacios";
    } else if (apellido.length < 2) {
      nuevosErrores.apellido = "El apellido debe tener al menos 2 caracteres";
    } else {
      nuevosErrores.apellido = "";
    }

    // Teléfono: exactamente 8 dígitos
    const telefono = valoresEdicion.telefono?.trim() || "";
    if (!telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (telefono && !/^\d+$/.test(telefono)) {
      nuevosErrores.telefono = "Solo se permiten números";
    } else if (telefono && telefono.length !== 8) {
      nuevosErrores.telefono = "El teléfono debe tener exactamente 8 dígitos";
    } else {
      nuevosErrores.telefono = "";
    }

    // Dirección
    const direccion = valoresEdicion.direccion?.trim() || "";
    if (direccion && !/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s.,#-]+$/.test(direccion)) {
      nuevosErrores.direccion = "Caracteres no permitidos";
    } else {
      nuevosErrores.direccion = "";
    }

    setErrores(nuevosErrores);
  }, [valoresEdicion, mostrarModalEdicion]);

  const abrirEdicion = () => {
    setValoresEdicion({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono === "No registrado" ? "" : usuario.telefono,
      direccion: usuario.direccion === "No registrada" ? "" : usuario.direccion
    });
    setErrores({
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: ""
    });
    setMostrarModalEdicion(true);
  };

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setValoresEdicion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const actualizarPerfil = async () => {
    if (guardando) return;
    setGuardando(true);

    try {
      // 1. Actualizar en la tabla Clientes
      const { error: errorDb } = await supabase
        .from("Clientes")
        .update({
          nombre_cliente: valoresEdicion.nombre.trim(),
          apellido_cliente: valoresEdicion.apellido.trim(),
          telefono: valoresEdicion.telefono.trim(),
          direccion: valoresEdicion.direccion.trim() || null
        })
        .eq("id_cliente", usuario.id_cliente);

      if (errorDb) throw errorDb;

      // 2. Actualizar metadatos en Supabase Auth
      const { error: errorAuth } = await supabase.auth.updateUser({
        data: {
          nombre: valoresEdicion.nombre.trim(),
          apellido: valoresEdicion.apellido.trim()
        }
      });

      if (errorAuth) throw errorAuth;

      // 3. Actualizar estado local
      setUsuario(prev => ({
        ...prev,
        nombre: valoresEdicion.nombre.trim(),
        apellido: valoresEdicion.apellido.trim(),
        telefono: valoresEdicion.telefono.trim(),
        direccion: valoresEdicion.direccion.trim() || "No registrada"
      }));

      setToast({
        mostrar: true,
        mensaje: "Perfil actualizado exitosamente.",
        tipo: "exito"
      });
      setMostrarModalEdicion(false);

    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al actualizar el perfil. Intenta de nuevo.",
        tipo: "error"
      });
    } finally {
      setGuardando(false);
    }
  };

  const formularioValido = 
    !errores.nombre &&
    !errores.apellido &&
    !errores.telefono &&
    !errores.direccion &&
    valoresEdicion.nombre?.trim() &&
    valoresEdicion.apellido?.trim() &&
    valoresEdicion.telefono?.trim().length === 8;

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario-supabase");
    navegar("/");
  };

  if (cargando) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Spinner animation="border" style={{ color: "#ff6a00" }} />
        <h6 className="mt-3 text-muted">Cargando perfil...</h6>
      </div>
    );
  }

  // Iniciales para el avatar
  const iniciales = usuario.rol === "admin" 
    ? "AD" 
    : `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();

  // Accesos directos basados en el Rol (como Facebook)
  const accesosDirectos = usuario.rol === "admin"
    ? [
        { titulo: "Platillos", icono: "bi-egg-fried", ruta: "/productos", color: "#4f46e5", bg: "rgba(79, 70, 229, 0.08)" },
        { titulo: "Pedidos", icono: "bi-receipt", ruta: "/pedidos", color: "#10b981", bg: "rgba(16, 185, 129, 0.08)" },
        { titulo: "Categorías", icono: "bi-tags", ruta: "/categorias", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" },
        { titulo: "Clientes", icono: "bi-people", ruta: "/clientes", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)" },
        { titulo: "Mesas", icono: "bi-hash", ruta: "/mesas", color: "#ec4899", bg: "rgba(236, 72, 153, 0.08)" },
        { titulo: "Menu Admin", icono: "bi-eye", ruta: "/menu-admin", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.08)" },
      ]
    : [
        { titulo: "Ver Menú", icono: "bi-egg-fried", ruta: "/menu", color: "#ff6a00", bg: "rgba(255, 106, 0, 0.08)" },
        { titulo: "Mis Pedidos", icono: "bi-receipt-cutoff", ruta: "/pedidosCliente", color: "#10b981", bg: "rgba(16, 185, 129, 0.08)" },
        { titulo: "Mi Carrito", icono: "bi-cart3", ruta: "/carrito", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)" },
        { titulo: "Escanear Mesa", icono: "bi-qr-code-scan", ruta: "/", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.08)" },
      ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f0f2f5", 
      fontFamily: "'Segoe UI', sans-serif",
      paddingBottom: "80px"
    }}>
      <Container style={{ maxWidth: "560px", paddingTop: "24px" }}>
        
        {/* 👤 PERFIL CABECERA */}
        <Card style={{ 
          border: "none", 
          borderRadius: "16px", 
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          overflow: "hidden",
          marginBottom: "20px"
        }}>
          <Card.Body className="p-4" style={{ position: "relative" }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="perfil-avatar"
                style={{ 
                  background: usuario.rol === 'admin' 
                    ? 'linear-gradient(135deg, #ffcc00, #ff6a00)' 
                    : 'linear-gradient(135deg, #ff8c3a, #ff6a00)' 
                }}
              >
                {iniciales}
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: "#0c0c2c", margin: 0, fontSize: "1.25rem" }}>
                  {usuario.nombre} {usuario.apellido}
                </h4>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "0.85rem" }}>
                  {usuario.email}
                </p>
                <span style={{ 
                  background: usuario.rol === "admin" ? "rgba(245, 158, 11, 0.12)" : "rgba(255, 106, 0, 0.12)",
                  color: usuario.rol === "admin" ? "#d97706" : "#ff6a00",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "inline-block",
                  marginTop: "6px",
                  textTransform: "uppercase"
                }}>
                  {usuario.rol === "admin" ? "⚙️ Admin" : "🍴 Cliente Distinguido"}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 📱 ACCESOS DIRECTOS (GRID) */}
        <h5 style={{ fontWeight: 700, color: "#4b5563", fontSize: "0.95rem", marginBottom: "12px", paddingLeft: "4px" }}>
          Accesos directos
        </h5>
        
        <Row className="g-3 mb-4">
          {accesosDirectos.map((item, index) => (
            <Col xs={4} sm={4} key={index}>
              <div className="acceso-card" onClick={() => navegar(item.ruta)}>
                <div className="acceso-icono" style={{ color: item.color, background: item.bg }}>
                  <i className={`bi ${item.icono}`}></i>
                </div>
                <span style={{ 
                  fontSize: "0.78rem", 
                  fontWeight: 600, 
                  color: "#374151", 
                  textAlign: "center",
                  display: "block",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {item.titulo}
                </span>
              </div>
            </Col>
          ))}
        </Row>

        {/* ⚙️ ACORDEONES (AJUSTES, SOPORTE, INFO) */}
        <Accordion className="mb-4">
          
          {/* Carpeta 1: Configuración de Cuenta */}
          <Card className="accordion-item-custom">
            <Accordion.Item eventKey="0" style={{ border: "none" }}>
              <Accordion.Header className="accordion-button-custom-wrapper">
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justify: "center", fontSize: "0.95rem", color: "#4b5563" }}>
                    <i className="bi bi-gear-fill" style={{ margin: "auto" }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1f2937" }}>Configuración y Privacidad</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa", padding: "16px 20px" }}>
                
                {/* Datos de contacto */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small style={{ fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", fontSize: "0.7rem" }}>
                      Información Personal
                    </small>
                    <Button 
                      variant="link" 
                      onClick={abrirEdicion} 
                      style={{ fontSize: "0.8rem", color: "#ff6a00", fontWeight: 600, padding: 0, textDecoration: "none" }}
                    >
                      <i className="bi bi-pencil-square me-1"></i>Editar
                    </Button>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Nombre:</span>
                    <strong style={{ fontSize: "0.85rem", color: "#374151" }}>{usuario.nombre} {usuario.apellido}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Teléfono:</span>
                    <strong style={{ fontSize: "0.85rem", color: "#374151" }}>{usuario.telefono}</strong>
                  </div>
                  {usuario.rol === "cliente" && (
                    <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Dirección:</span>
                      <strong style={{ fontSize: "0.85rem", color: "#374151" }}>{usuario.direccion}</strong>
                    </div>
                  )}
                </div>

                {/* Preferencias */}
                <div>
                  <small style={{ fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", fontSize: "0.7rem", display: "block", marginBottom: "8px" }}>
                    Preferencias de la App
                  </small>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      <i className="bi bi-moon me-2"></i>Modo Oscuro (Beta)
                    </span>
                    <div className="form-check form-switch" style={{ margin: 0 }}>
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="switchOscuro" 
                        checked={modoOscuro} 
                        onChange={() => setModoOscuro(!modoOscuro)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      <i className="bi bi-translate me-2"></i>Idioma
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ff6a00" }}>Español (ES)</span>
                  </div>
                </div>

              </Accordion.Body>
            </Accordion.Item>
          </Card>

          {/* Carpeta 2: Ayuda y Soporte */}
          <Card className="accordion-item-custom">
            <Accordion.Item eventKey="1" style={{ border: "none" }}>
              <Accordion.Header>
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justify: "center", fontSize: "0.95rem", color: "#4b5563" }}>
                    <i className="bi bi-question-circle-fill" style={{ margin: "auto" }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1f2937" }}>Ayuda y Soporte técnico</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa", padding: "16px 20px" }}>
                
                {/* FAQs del restaurante */}
                <h6 style={{ fontWeight: 700, fontSize: "0.82rem", color: "#374151", marginBottom: "12px" }}>Preguntas Frecuentes</h6>
                
                <div className="mb-3" style={{ background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#111827", margin: "0 0 4px" }}>❓ ¿Cómo realizo mi pago?</p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>Puedes pagar tu pedido directamente en caja o con tu mesero usando efectivo, tarjeta de crédito o débito.</p>
                </div>
                
                <div className="mb-3" style={{ background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#111827", margin: "0 0 4px" }}>❓ ¿Puedo cancelar un pedido?</p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>Sí, siempre y cuando la cocina no haya cambiado el estado del pedido a "En preparación".</p>
                </div>

                <div className="mb-3" style={{ background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#111827", margin: "0 0 4px" }}>❓ ¿Cómo sé mi número de mesa?</p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>Tu mesa se asigna escaneando el código QR impreso en el soporte físico de tu mesa.</p>
                </div>

                {/* Botón WhatsApp */}
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="success" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, fontSize: "0.88rem", borderRadius: "8px" }}>
                    <i className="bi bi-whatsapp"></i>
                    Hablar con Soporte de Mesa
                  </Button>
                </a>
              </Accordion.Body>
            </Accordion.Item>
          </Card>

          {/* Carpeta 3: Información */}
          <Card className="accordion-item-custom">
            <Accordion.Item eventKey="2" style={{ border: "none" }}>
              <Accordion.Header>
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justify: "center", fontSize: "0.95rem", color: "#4b5563" }}>
                    <i className="bi bi-info-circle-fill" style={{ margin: "auto" }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1f2937" }}>Acerca de TapMeal</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa", padding: "16px 20px" }}>
                <div className="text-center py-2">
                  <h6 style={{ fontWeight: 800, color: "#0c0c2c", margin: "0 0 4px" }}>TapMeal PWA</h6>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "12px" }}>Versión 1.0.0 (Estable)</p>
                  <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: 0 }}>
                    Desarrollado para la gestión inteligente de comandas y pedidos digitales en mesa. 
                    <br /><strong>Grupo 6 - Todos los derechos reservados.</strong>
                  </p>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Card>

        </Accordion>

        {/* 🚪 BOTÓN DE LOGOUT */}
        <button className="btn-logout" onClick={cerrarSesion}>
          <i className="bi bi-box-arrow-right"></i>
          Cerrar Sesión
        </button>

      </Container>

      {/* 📝 MODAL DE EDICIÓN DE PERFIL */}
      <Modal
        show={mostrarModalEdicion}
        onHide={() => setMostrarModalEdicion(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 800, color: "#0c0c2c" }}>Editar Mi Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>Nombre <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={valoresEdicion.nombre}
                onChange={manejarCambioInput}
                placeholder="Ej. Jude"
                isInvalid={!!errores.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {errores.nombre}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>Apellido <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="apellido"
                value={valoresEdicion.apellido}
                onChange={manejarCambioInput}
                placeholder="Ej. Bellingham"
                isInvalid={!!errores.apellido}
              />
              <Form.Control.Feedback type="invalid">
                {errores.apellido}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>Teléfono <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                inputMode="numeric"
                maxLength={8}
                name="telefono"
                value={valoresEdicion.telefono}
                onChange={manejarCambioInput}
                placeholder="Ej. 87654321"
                isInvalid={!!errores.telefono}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errores.telefono}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="direccion"
                value={valoresEdicion.direccion}
                onChange={manejarCambioInput}
                placeholder="Dirección completa de tu domicilio"
                isInvalid={!!errores.direccion}
              />
              <Form.Control.Feedback type="invalid">
                {errores.direccion}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setMostrarModalEdicion(false)}
            style={{ borderRadius: "8px", fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={actualizarPerfil}
            disabled={!formularioValido || guardando}
            style={{ background: "#ff6a00", borderColor: "#ff6a00", borderRadius: "8px", fontWeight: 600 }}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🔔 NOTIFICACIÓN TOAST */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast(prev => ({ ...prev, mostrar: false }))}
      />
    </div>
  );
}