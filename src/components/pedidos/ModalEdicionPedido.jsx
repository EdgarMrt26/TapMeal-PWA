import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionPedido = ({
  mostrarModal,
  setMostrarModal,
  pedidoEditar,
  manejoCambioInput,
  actualizarPedido,
  clientes,
  tiposPedido,
  mesas,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarPedido();
    setDeshabilitado(false);
  };

  const esValido =
    pedidoEditar.id_cliente &&
    pedidoEditar.id_tipo &&
    pedidoEditar.id_mesa &&
    pedidoEditar.estado &&
    pedidoEditar.total >= 0;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Pedido</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Cliente</Form.Label>
            <Form.Select
              name="id_cliente"
              value={pedidoEditar.id_cliente}
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

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Pedido</Form.Label>
            <Form.Select
              name="id_tipo"
              value={pedidoEditar.id_tipo}
              onChange={manejoCambioInput}
            >
              <option value="">Seleccione tipo...</option>
              {tiposPedido.map((t) => (
                <option key={t.id_tipo} value={t.id_tipo}>
                  {t.descripcion}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mesa</Form.Label>
            <Form.Select
              name="id_mesa"
              value={pedidoEditar.id_mesa}
              onChange={manejoCambioInput}
            >
              <option value="">Seleccione mesa...</option>
              {mesas.map((m) => (
                <option key={m.id_mesa} value={m.id_mesa}>
                  Mesa {m.id_mesa}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={pedidoEditar.estado}
              onChange={manejoCambioInput}
            >
              <option value="">Seleccione estado...</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Preparación">En Preparación</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="total"
              value={pedidoEditar.total}
              onChange={manejoCambioInput}
              placeholder="0.00"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={!esValido || deshabilitado}
        >
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionPedido;