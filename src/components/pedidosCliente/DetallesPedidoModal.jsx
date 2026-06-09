import React from "react";
import { Modal, Table, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const DetallesPedidoModal = ({ show, onHide, pedido, detalles }) => {
  if (!pedido) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString([], {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBadgeEstado = (estado) => {
    const est = estado?.toLowerCase();
    
    if (est === "completado") {
      return (
        <span className="badge-custom badge-completado">
          <i className="bi bi-check-circle-fill me-1"></i>
          {estado}
        </span>
      );
    }
    if (est === "cancelado") {
      return (
        <span className="badge-custom badge-cancelado">
          <i className="bi bi-x-circle-fill me-1"></i>
          {estado}
        </span>
      );
    }
    if (est === "en preparación" || est === "en preparacion") {
      return (
        <span className="badge-custom badge-preparacion animate-pulse-slow">
          <i className="bi bi-arrow-repeat spin-slow me-1"></i>
          {estado}
        </span>
      );
    }
    return (
      <span className="badge-custom badge-pendiente">
        <i className="bi bi-clock-history me-1"></i>
        {estado}
      </span>
    );
  };

  const getIconoPago = (tipoPago) => {
    const tp = tipoPago?.toLowerCase();
    if (tp?.includes("efectivo")) {
      return "bi-cash-coin text-success";
    }
    if (tp?.includes("tarjeta")) {
      return "bi-credit-card text-primary";
    }
    return "bi-credit-card text-muted";
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-receipt me-2 text-primary"></i>
          Detalles del Pedido {pedido.id_pedido}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-4">
        <Row className="mb-4">
          <Col sm={6}>
            <span className="text-muted small d-block">Fecha y hora</span>
            <span className="fw-semibold text-dark">
              <i className="bi bi-calendar3 me-1 text-muted"></i>
              {formatearFecha(pedido.fecha)}
            </span>
          </Col>
          <Col sm={6} className="text-sm-end mt-2 mt-sm-0">
            <span className="text-muted small d-block mb-1">Estado de tu orden</span>
            {renderBadgeEstado(pedido.estado)}
          </Col>
        </Row>

        <Row className="mb-4 bg-light p-3 rounded-3 mx-0 align-items-center">
          <Col sm={6} className="ps-0">
            <span className="text-muted small d-block">Método de pago</span>
            <span className="fw-bold text-dark">
              <i className={`bi ${getIconoPago(pedido.tipoPagoNombre)} me-1`}></i>
              {pedido.tipoPagoNombre || "No especificado"}
            </span>
          </Col>
          <Col sm={6} className="text-sm-end pe-0 mt-2 mt-sm-0">
            <span className="text-muted small d-block">Total de la compra</span>
            <span className="fw-bold text-success fs-5">
              C${pedido.total?.toFixed(2)}
            </span>
          </Col>
        </Row>

        <hr />
        <h6 className="fw-bold mb-3">
          <i className="bi bi-bag-check me-2 text-success"></i>
          Productos ordenados:
        </h6>

        {/* SOLO CAMBIÉ ESTO: envolví la tabla en un div con overflow-auto y ancho máximo */}
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <Table hover className="custom-table mb-0" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th className="text-center" style={{ width: "80px" }}>Cant.</th>
                <th>Platillo</th>
                <th>Extra</th>
                <th>Salsa</th>
                <th>Precio Unit.</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((det, idx) => {
                const precioUnit = det.precio_unitario || 0;
                const subtotal = precioUnit * det.cantidad;
                return (
                  <tr key={idx}>
                    <td className="text-center fw-bold">{det.cantidad}</td>
                    <td className="fw-semibold text-dark">{det.Platillos?.nombre_platillo || "N/A"}</td>
                    <td>{det.Extras?.descripcion || "-"}</td>
                    <td>{det.Salsas?.descripcion || "-"}</td>
                    <td>C${precioUnit.toFixed(2)}</td>
                    <td className="text-end fw-bold text-dark">C${subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <button className="btn btn-dark px-4 rounded-3 shadow-sm" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetallesPedidoModal;