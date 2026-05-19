import React from "react";
import { Modal, Table, Badge } from "react-bootstrap";

const DetallesPedidoModal = ({ show, onHide, pedido, detalles }) => {
  if (!pedido) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Pedido #{pedido.id_pedido}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Fecha:</strong> {formatearFecha(pedido.fecha)}</p>
        <p>
          <strong>Estado:</strong>{" "}
          <Badge bg={
            pedido.estado === "Pendiente" ? "warning" :
            pedido.estado === "En preparación" ? "info" :
            pedido.estado === "Completado" ? "success" : "danger"
          }>
            {pedido.estado}
          </Badge>
        </p>
        {/* ✅ Usa tipoPagoNombre resuelto desde PedidosCliente (Efectivo / Tarjeta) */}
        <p><strong>Tipo de pago:</strong> {pedido.tipoPagoNombre || "No especificado"}</p>
        <p><strong>Total:</strong> C${pedido.total?.toFixed(2)}</p>
        <hr />
        <h6>Productos ordenados:</h6>
        <Table striped bordered size="sm">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Platillo</th>
              <th>Extra</th>
              <th>Salsa</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((det, idx) => {
              const precioUnit = det.precio_unitario || 0;
              const subtotal = precioUnit * det.cantidad;
              return (
                <tr key={idx}>
                  <td>{det.cantidad}</td>
                  <td>{det.Platillos?.nombre_platillo || "N/A"}</td>
                  <td>{det.Extras?.descripcion || "-"}</td>
                  <td>{det.Salsas?.descripcion || "-"}</td>
                  <td>C${precioUnit.toFixed(2)}</td>
                  <td>C${subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>Cerrar</button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetallesPedidoModal;