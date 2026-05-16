import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Table, Row, Col } from "react-bootstrap";

const ModalRegistroPedido = ({
  mostrarModal,
  setMostrarModal,
  nuevoPedido,
  manejoCambioInput,
  agregarPedido,
  clientes,
  tiposPedido,
  mesas,
  platillos,
  extras,
  detallesPedido,
  setDetallesPedido,
  setNuevoPedido,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  // Estado local para agregar un item al detalle
  const [itemActual, setItemActual] = useState({
    id_platillo: "",
    id_extra: "",
    cantidad: 1,
    precio_unitario: 0,
  });

  // Actualizar precio unitario cuando cambia el platillo
  useEffect(() => {
    if (itemActual.id_platillo) {
      const platillo = platillos.find(
        (p) => p.id_platillo === parseInt(itemActual.id_platillo)
      );
      if (platillo) {
        setItemActual((prev) => ({ ...prev, precio_unitario: platillo.precio }));
      }
    }
  }, [itemActual.id_platillo, platillos]);

  // Recalcular el total del pedido cuando cambian los detalles
  useEffect(() => {
    const nuevoTotal = detallesPedido.reduce((acc, item) => {
      const subtotalItem = item.precio_unitario * item.cantidad;
      // Sumar precio del extra si existe
      let precioExtra = 0;
      if (item.id_extra) {
        const extra = extras.find((e) => e.id_extra === parseInt(item.id_extra));
        if (extra) precioExtra = extra.precio;
      }
      return acc + subtotalItem + (precioExtra * item.cantidad);
    }, 0);

    setNuevoPedido((prev) => ({ ...prev, total: nuevoTotal }));
  }, [detallesPedido, extras, setNuevoPedido]);

  const handleAgregarDetalle = () => {
    if (!itemActual.id_platillo || itemActual.cantidad <= 0) return;

    const platillo = platillos.find(
      (p) => p.id_platillo === parseInt(itemActual.id_platillo)
    );
    const extra = extras.find(
      (e) => e.id_extra === parseInt(itemActual.id_extra)
    );

    const nuevoDetalle = {
      ...itemActual,
      nombre_platillo: platillo ? platillo.nombre_platillo : "",
      nombre_extra: extra ? extra.descripcion : "Ninguno",
    };

    setDetallesPedido([...detallesPedido, nuevoDetalle]);
    setItemActual({
      id_platillo: "",
      id_extra: "",
      cantidad: 1,
      precio_unitario: 0,
    });
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = detallesPedido.filter((_, i) => i !== index);
    setDetallesPedido(nuevosDetalles);
  };

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarPedido();
    setDeshabilitado(false);
  };

  const esValido =
    nuevoPedido.id_cliente &&
    nuevoPedido.id_tipo &&
    nuevoPedido.id_mesa &&
    nuevoPedido.estado &&
    detallesPedido.length > 0;

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
        <Modal.Title>Registrar Pedido y Detalles</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  name="id_cliente"
                  value={nuevoPedido.id_cliente}
                  onChange={manejoCambioInput}
                >
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre_cliente} {c.apellido_cliente}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="id_tipo"
                  value={nuevoPedido.id_tipo}
                  onChange={manejoCambioInput}
                >
                  <option value="">Seleccione...</option>
                  {tiposPedido.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Mesa</Form.Label>
                <Form.Select
                  name="id_mesa"
                  value={nuevoPedido.id_mesa}
                  onChange={manejoCambioInput}
                >
                  <option value="">Seleccione...</option>
                  {mesas.map((m) => (
                    <option key={m.id_mesa} value={m.id_mesa}>
                      Mesa {m.id_mesa}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5>Añadir Platillos al Detalle</h5>
          <Row className="align-items-end mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Platillo</Form.Label>
                <Form.Select
                  value={itemActual.id_platillo}
                  onChange={(e) =>
                    setItemActual({ ...itemActual, id_platillo: e.target.value })
                  }
                >
                  <option value="">Seleccione platillo...</option>
                  {platillos.map((p) => (
                    <option key={p.id_platillo} value={p.id_platillo}>
                      {p.nombre_platillo} (${p.precio})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Extra (Opcional)</Form.Label>
                <Form.Select
                  value={itemActual.id_extra}
                  onChange={(e) =>
                    setItemActual({ ...itemActual, id_extra: e.target.value })
                  }
                >
                  <option value="">Sin extra</option>
                  {extras.map((e) => (
                    <option key={e.id_extra} value={e.id_extra}>
                      {e.descripcion} (+${e.precio})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Cant.</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={itemActual.cantidad}
                  onChange={(e) =>
                    setItemActual({ ...itemActual, cantidad: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button
                variant="success"
                className="w-100"
                onClick={handleAgregarDetalle}
                disabled={!itemActual.id_platillo}
              >
                <i className="bi bi-plus-lg me-1"></i> Añadir
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Platillo</th>
                <th>Extra</th>
                <th>Cant.</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {detallesPedido.map((item, index) => {
                const precioExtra = item.id_extra ? (extras.find(e => e.id_extra === parseInt(item.id_extra))?.precio || 0) : 0;
                const subtotal = (item.precio_unitario + precioExtra) * item.cantidad;
                return (
                  <tr key={index}>
                    <td>{item.nombre_platillo}</td>
                    <td>{item.nombre_extra}</td>
                    <td>{item.cantidad}</td>
                    <td>${subtotal.toFixed(2)}</td>
                    <td className="text-center">
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => eliminarDetalle(index)}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {detallesPedido.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No hay items agregados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado del Pedido</Form.Label>
                <Form.Select
                  name="estado"
                  value={nuevoPedido.estado}
                  onChange={manejoCambioInput}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Preparación">En Preparación</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="text-end">
              <h4>Total: ${nuevoPedido.total.toFixed(2)}</h4>
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
          onClick={handleRegistrar}
          disabled={!esValido || deshabilitado}
        >
          Guardar Pedido
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroPedido;