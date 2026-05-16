import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCategoria = ({
  mostrarModal,
  setMostrarModal,
  nuevaCategoria,
  manejoCambioInput,
  agregarCategoria,
}) => {
  
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [error, setError] = useState("");

  // Validación en tiempo real
  useEffect(() => {
    const nombre = nuevaCategoria?.nombre_categoria?.trim() || "";

    if (nombre === "") {
      setError("El nombre de la categoría es obligatorio");
    } else if (nombre.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
    } else if (nombre.length > 60) {
      setError("El nombre no puede tener más de 60 caracteres");
    } else {
      setError("");
    }
  }, [nuevaCategoria?.nombre_categoria]);

  const handleRegistrar = async () => {
    if (deshabilitado || error) return;

    setDeshabilitado(true);
    await agregarCategoria();
    setDeshabilitado(false);
  };

  const esFormularioValido = !error && 
    (nuevaCategoria?.nombre_categoria?.trim()?.length || 0) >= 3;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la categoría <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="nombre_categoria"
              value={nuevaCategoria.nombre_categoria || ""}
              onChange={manejoCambioInput}
              placeholder="Ej: Bebidas, Postres, Alitas..."
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => setMostrarModal(false)}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={!esFormularioValido || deshabilitado}
        >
          {deshabilitado ? "Guardando..." : "Guardar Categoría"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCategoria;