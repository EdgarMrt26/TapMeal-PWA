import React from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";
const ModalNuevoPedido = ({ pedido, onAceptar, onCerrar }) => {
  if (!pedido) return null;

  const cliente = pedido.Clientes
    ? `${pedido.Clientes.nombre_cliente} ${pedido.Clientes.apellido_cliente || ""}`.trim()
    : "Mostrador";

  const subtotal = (pedido.detalles || []).reduce(
    (acc, d) => acc + d.cantidad * d.precio_unitario,
    0
  );

  return (
    <Modal show={!!pedido} onHide={onCerrar} centered size="lg">
      <Modal.Header closeButton className="bg-warning-subtle">
        <Modal.Title>
          <i className="bi me-2 text-warning" />
          Nuevo pedido #{pedido.id_pedido}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex flex-wrap gap-3 mb-3">
          <div>
            <small className="text-muted d-block">Cliente</small>
            <strong>{cliente}</strong>
          </div>
          <div>
            <small className="text-muted d-block">Mesa</small>
            <strong>{pedido.Mesas?.id_mesa ?? "—"}</strong>
          </div>
          <div>
            <small className="text-muted d-block">Tipo</small>
            <strong>{pedido.Tipo_pedido?.descripcion ?? "—"}</strong>
          </div>
          <div>
            <small className="text-muted d-block">Fecha</small>
            <strong>
              {pedido.fecha
                ? new Date(pedido.fecha).toLocaleString("es-NI")
                : "—"}
            </strong>
          </div>
          <div>
            <small className="text-muted d-block">Estado</small>
            <Badge bg="warning" text="dark">
              {pedido.estado}
            </Badge>
          </div>
        </div>

        <Table size="sm" bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Platillo</th>
              <th className="text-center">Cant.</th>
              <th className="text-end">P. Unit.</th>
              <th>Extra</th>
              <th>Salsa</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(pedido.detalles || []).map((det, i) => (
              <tr key={i}>
                <td>{det.Platillos?.nombre_platillo ?? "—"}</td>
                <td className="text-center">{det.cantidad}</td>
                <td className="text-end">${det.precio_unitario.toFixed(2)}</td>
                <td>{det.Extras?.descripcion ?? "—"}</td>
                <td>{det.Salsas?.descripcion ?? "—"}</td>
                <td className="text-end">
                  ${(det.cantidad * det.precio_unitario).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="text-end fw-bold">
                Total
              </td>
              <td className="text-end fw-bold text-success">
                ${subtotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="success" onClick={() => onAceptar(pedido)}>
          <i className="bi bi-check-circle me-1" />
          Aceptar pedido
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNuevoPedido;