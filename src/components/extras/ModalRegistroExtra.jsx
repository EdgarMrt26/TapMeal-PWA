import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroExtra = ({
  mostrarModal,
  setMostrarModal,
  nuevoExtra,
  manejoCambioInput,
  agregarExtra,
}) => {
  
  const [deshabilitado, setDeshabilitado] = useState(false);
  
  const [errores, setErrores] = useState({
    descripcion: "",
    precio: ""
  });

  // Validación en tiempo real
  useEffect(() => {
    const nuevosErrores = { ...errores };

    // Descripción: solo letras y espacios (sin números)
    const descripcion = nuevoExtra.descripcion?.trim() || "";
    if (!descripcion) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    } else if (descripcion.length < 3) {
      nuevosErrores.descripcion = "La descripción debe tener al menos 3 caracteres";
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(descripcion)) {
      nuevosErrores.descripcion = "Solo se permiten letras y espacios";
    } else {
      nuevosErrores.descripcion = "";
    }

    // Precio
    const precio = parseFloat(nuevoExtra.precio);
    if (nuevoExtra.precio === "" || isNaN(precio)) {
      nuevosErrores.precio = "El precio es obligatorio";
    } else if (precio < 0) {
      nuevosErrores.precio = "El precio no puede ser negativo";
    } else if (precio > 999) {
      nuevosErrores.precio = "El precio máximo es $999";
    } else {
      nuevosErrores.precio = "";
    }

    setErrores(nuevosErrores);
  }, [nuevoExtra]);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    const hayErrores = Object.values(errores).some(err => err !== "");
    if (hayErrores) return;

    setDeshabilitado(true);
    await agregarExtra();
    setDeshabilitado(false);
  };

  const formularioValido = 
    !errores.descripcion && 
    !errores.precio &&
    nuevoExtra.descripcion?.trim() !== "" &&
    parseFloat(nuevoExtra.precio) > 0;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Extra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Descripción <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              value={nuevoExtra.descripcion || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. Queso extra, Tocino, Salsa..."
              isInvalid={!!errores.descripcion}
              onKeyPress={(e) => {
                // Bloquear números y caracteres especiales
                if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errores.descripcion}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio ($) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={nuevoExtra.precio || ""}
              onChange={manejoCambioInput}
              placeholder="0.00"
              isInvalid={!!errores.precio}
            />
            <Form.Control.Feedback type="invalid">
              {errores.precio}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={!formularioValido || deshabilitado}
        >
          {deshabilitado ? "Guardando..." : "Guardar Extra"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroExtra;