import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionClientes = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  clienteEditar,
  manejoCambioInputEdicion,
  actualizarCliente,
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
    const nombre = clienteEditar.nombre_cliente?.trim() || "";
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
    const apellido = clienteEditar.apellido_cliente?.trim() || "";
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
    const telefono = clienteEditar.telefono?.trim() || "";
    if (telefono && !/^\d+$/.test(telefono)) {
      nuevosErrores.telefono = "Solo se permiten números";
    } else if (telefono && telefono.length !== 8) {
      nuevosErrores.telefono = "El teléfono debe tener exactamente 8 dígitos";
    } else {
      nuevosErrores.telefono = "";
    }

    // Dirección
    const direccion = clienteEditar.direccion?.trim() || "";
    if (direccion && !/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s.,#-]+$/.test(direccion)) {
      nuevosErrores.direccion = "Caracteres no permitidos";
    } else {
      nuevosErrores.direccion = "";
    }

    setErrores(nuevosErrores);
  }, [clienteEditar]);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    const hayErrores = Object.values(errores).some(err => err !== "");
    if (hayErrores) return;

    setDeshabilitado(true);
    await actualizarCliente();
    setDeshabilitado(false);
  };

  const formularioValido = 
    !errores.nombre_cliente &&
    !errores.apellido_cliente &&
    !errores.telefono &&
    clienteEditar.nombre_cliente?.trim() &&
    clienteEditar.apellido_cliente?.trim() &&
    clienteEditar.telefono?.trim().length === 8;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="nombre_cliente"
              value={clienteEditar.nombre_cliente || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Ej. Jude"
              isInvalid={!!errores.nombre_cliente}
            />
            <Form.Control.Feedback type="invalid">
              {errores.nombre_cliente}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="apellido_cliente"
              value={clienteEditar.apellido_cliente || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Ej. Bellingham"
              isInvalid={!!errores.apellido_cliente}
            />
            <Form.Control.Feedback type="invalid">
              {errores.apellido_cliente}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              inputMode="numeric"
              maxLength={8}
              name="telefono"
              value={clienteEditar.telefono || ""}
              onChange={manejoCambioInputEdicion}
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
              value={clienteEditar.direccion || ""}
              onChange={manejoCambioInputEdicion}
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
        <Button 
          variant="secondary" 
          onClick={() => setMostrarModalEdicion(false)}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary"
          onClick={handleActualizar}
          disabled={!formularioValido || deshabilitado}
        >
          {deshabilitado ? "Actualizando..." : "Actualizar Cliente"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionClientes;