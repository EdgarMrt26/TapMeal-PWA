import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionSalsa = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  salsaEditar,
  manejoCambioInputEdicion,
  actualizarSalsa,
}) => {

  const [deshabilitado, setDeshabilitado] = useState(false);
  
  const [errores, setErrores] = useState({
    descripcion: "",
    precio: ""
  });

  // Validación en tiempo real
  useEffect(() => {
    const nuevosErrores = { ...errores };

    // Descripción
    const descripcion = salsaEditar.descripcion?.trim() || "";
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
    const precio = parseFloat(salsaEditar.precio);
    if (salsaEditar.precio === "" || isNaN(precio)) {
      nuevosErrores.precio = "El precio es obligatorio";
    } else if (precio < 0) {
      nuevosErrores.precio = "El precio no puede ser negativo";
    } else if (precio > 999) {
      nuevosErrores.precio = "El precio máximo es $999";
    } else {
      nuevosErrores.precio = "";
    }

    setErrores(nuevosErrores);
  }, [salsaEditar]);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    const hayErrores = Object.values(errores).some(err => err !== "");
    if (hayErrores) return;

    setDeshabilitado(true);
    await actualizarSalsa();
    setDeshabilitado(false);
  };

  const formularioValido = 
    !errores.descripcion && 
    !errores.precio &&
    salsaEditar.descripcion?.trim() !== "" &&
    parseFloat(salsaEditar.precio || 0) >= 0;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Salsa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Descripción <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              value={salsaEditar.descripcion || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Ej. Salsa Verde, Salsa Picante..."
              isInvalid={!!errores.descripcion}
              onKeyPress={(e) => {
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
            <Form.Label>Precio (C$) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={salsaEditar.precio || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Ej. 15.00"
              isInvalid={!!errores.precio}
            />
            <Form.Control.Feedback type="invalid">
              {errores.precio}
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
          {deshabilitado ? "Actualizando..." : "Actualizar Salsa"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionSalsa;