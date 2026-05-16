import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroClientes = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
}) => {
  
  const [deshabilitado, setDeshabilitado] = useState(false);
  
  const [errores, setErrores] = useState({
    nombre_cliente: "",
    apellido_cliente: "",
    telefono: "",
    direccion: ""
  });

  // Validación en tiempo real
  useEffect(() => {
    const nuevosErrores = { ...errores };

    // Nombre
    const nombre = nuevoCliente.nombre_cliente?.trim() || "";
    if (!nombre) {
      nuevosErrores.nombre_cliente = "El nombre es obligatorio";
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(nombre)) {
      nuevosErrores.nombre_cliente = "Solo se permiten letras y espacios";
    } else if (nombre.length < 2) {
      nuevosErrores.nombre_cliente = "El nombre debe tener al menos 2 caracteres";
    } else {
      nuevosErrores.nombre_cliente = "";
    }

    // Apellido
    const apellido = nuevoCliente.apellido_cliente?.trim() || "";
    if (!apellido) {
      nuevosErrores.apellido_cliente = "El apellido es obligatorio";
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(apellido)) {
      nuevosErrores.apellido_cliente = "Solo se permiten letras y espacios";
    } else if (apellido.length < 2) {
      nuevosErrores.apellido_cliente = "El apellido debe tener al menos 2 caracteres";
    } else {
      nuevosErrores.apellido_cliente = "";
    }

    // Teléfono: exactamente 8 dígitos
    const telefono = nuevoCliente.telefono?.trim() || "";
    if (telefono && !/^\d+$/.test(telefono)) {
      nuevosErrores.telefono = "Solo se permiten números";
    } else if (telefono && telefono.length !== 8) {
      nuevosErrores.telefono = "El teléfono debe tener exactamente 8 dígitos";
    } else {
      nuevosErrores.telefono = "";
    }

    // Dirección
    const direccion = nuevoCliente.direccion?.trim() || "";
    if (direccion && !/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s.,#-]+$/.test(direccion)) {
      nuevosErrores.direccion = "Caracteres no permitidos";
    } else {
      nuevosErrores.direccion = "";
    }

    setErrores(nuevosErrores);
  }, [nuevoCliente]);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    const hayErrores = Object.values(errores).some(err => err !== "");
    if (hayErrores) return;

    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  const formularioValido = 
    !errores.nombre_cliente &&
    !errores.apellido_cliente &&
    !errores.telefono &&
    nuevoCliente.nombre_cliente?.trim() &&
    nuevoCliente.apellido_cliente?.trim() &&
    nuevoCliente.telefono?.trim().length === 8;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Registrar Nuevo Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_cliente"
                  value={nuevoCliente.nombre_cliente || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej. Jude"
                  isInvalid={!!errores.nombre_cliente}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.nombre_cliente}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="apellido_cliente"
                  value={nuevoCliente.apellido_cliente || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej. Bellingham"
                  isInvalid={!!errores.apellido_cliente}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.apellido_cliente}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              inputMode="numeric"
              maxLength={8}                    // ← Limita a 8 caracteres
              name="telefono"
              value={nuevoCliente.telefono || ""}
              onChange={manejoCambioInput}
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
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="direccion"
              value={nuevoCliente.direccion || ""}
              onChange={manejoCambioInput}
              placeholder="Dirección completa del domicilio"
              isInvalid={!!errores.direccion}
            />
            <Form.Control.Feedback type="invalid">
              {errores.direccion}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="dark"
          onClick={handleRegistrar}
          disabled={!formularioValido || deshabilitado}
        >
          {deshabilitado ? 'Guardando...' : 'Guardar Cliente'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroClientes;