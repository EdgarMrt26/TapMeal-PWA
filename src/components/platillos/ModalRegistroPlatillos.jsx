import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroPlatillos = ({
  mostrarModal,
  setMostrarModal,
  nuevoPlatillo,
  manejoCambioArchivo,
  agregarPlatillo,
  manejoCambioInput,
  categorias,
}) => {

  const [deshabilitado, setDeshabilitado] = useState(false);
  const [errores, setErrores] = useState({
    categoria_platillo: "",
    nombre_platillo: "",
    precio: "",
    imagen: ""
  });

  // Validación en tiempo real
  useEffect(() => {
    const nuevosErrores = { ...errores };

    // Categoría
    if (!nuevoPlatillo.categoria_platillo) {
      nuevosErrores.categoria_platillo = "Debes seleccionar una categoría";
    } else {
      nuevosErrores.categoria_platillo = "";
    }

    // Nombre del platillo: solo letras y espacios
    const nombre = nuevoPlatillo.nombre_platillo?.trim() || "";
    if (!nombre) {
      nuevosErrores.nombre_platillo = "El nombre del platillo es obligatorio";
    } else if (nombre.length < 3) {
      nuevosErrores.nombre_platillo = "El nombre debe tener al menos 3 caracteres";
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(nombre)) {
      nuevosErrores.nombre_platillo = "Solo se permiten letras y espacios";
    } else {
      nuevosErrores.nombre_platillo = "";
    }

    // Precio
    const precio = parseFloat(nuevoPlatillo.precio);
    if (!nuevoPlatillo.precio || isNaN(precio)) {
      nuevosErrores.precio = "El precio es obligatorio";
    } else if (precio <= 0) {
      nuevosErrores.precio = "El precio debe ser mayor a 0";
    } else {
      nuevosErrores.precio = "";
    }

    // Imagen
    if (!nuevoPlatillo.imagen) {
      nuevosErrores.imagen = "Debes seleccionar una imagen";
    } else {
      nuevosErrores.imagen = "";
    }

    setErrores(nuevosErrores);
  }, [nuevoPlatillo]);

  const handleAgregar = async () => {
    if (deshabilitado) return;

    const hayErrores = Object.values(errores).some(err => err !== "");
    if (hayErrores) return;

    setDeshabilitado(true);
    await agregarPlatillo();
    setDeshabilitado(false);
  };

  const formularioValido = 
    !errores.categoria_platillo &&
    !errores.nombre_platillo &&
    !errores.precio &&
    !errores.imagen;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Platillo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="categoria_platillo"
                  value={nuevoPlatillo.categoria_platillo || ""}
                  onChange={manejoCambioInput}
                  isInvalid={!!errores.categoria_platillo}
                >
                  <option value="">Seleccione una categoría...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errores.categoria_platillo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Platillo <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_platillo"
                  value={nuevoPlatillo.nombre_platillo || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Hamburguesa Clásica"
                  isInvalid={!!errores.nombre_platillo}
                  onKeyPress={(e) => {
                    if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.nombre_platillo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Precio ($) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio"
                  value={nuevoPlatillo.precio || ""}
                  onChange={manejoCambioInput}
                  placeholder="0.00"
                  isInvalid={!!errores.precio}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.precio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen del Platillo <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivo}
                  isInvalid={!!errores.imagen}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.imagen}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descripcion"
                  value={nuevoPlatillo.descripcion || ""}
                  onChange={manejoCambioInput}
                  placeholder="Descripción del platillo (opcional)"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>

        <Button 
          variant="primary" 
          onClick={handleAgregar} 
          disabled={!formularioValido || deshabilitado}
        >
          {deshabilitado ? "Guardando..." : "Guardar Platillo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroPlatillos;