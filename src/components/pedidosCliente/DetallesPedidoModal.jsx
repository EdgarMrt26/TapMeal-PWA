import React, { useState, useEffect } from "react";
import { Modal, Table, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const DetallesPedidoModal = ({ show, onHide, pedido, detalles }) => {
  const [esMobil, setEsMobil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setEsMobil(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <i className="bi bi-check-circle-fill me-1"></i>{estado}
        </span>
      );
    }
    if (est === "cancelado") {
      return (
        <span className="badge-custom badge-cancelado">
          <i className="bi bi-x-circle-fill me-1"></i>{estado}
        </span>
      );
    }
    if (est === "en preparación" || est === "en preparacion") {
      return (
        <span className="badge-custom badge-preparacion animate-pulse-slow">
          <i className="bi bi-arrow-repeat spin-slow me-1"></i>{estado}
        </span>
      );
    }
    return (
      <span className="badge-custom badge-pendiente">
        <i className="bi bi-clock-history me-1"></i>{estado}
      </span>
    );
  };

  const getIconoPago = (tipoPago) => {
    const tp = tipoPago?.toLowerCase();
    if (tp?.includes("efectivo")) return "bi-cash-coin text-success";
    if (tp?.includes("tarjeta")) return "bi-credit-card text-primary";
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

        {/* Vista móvil: tarjetas */}
        {esMobil ? (
          <div>
            {detalles.map((det, idx) => {
              const precioUnit = det.precio_unitario || 0;
              const subtotal = precioUnit * det.cantidad;
              return (
                <div key={idx} className="border rounded-3 p-3 mb-2 bg-white shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark">{det.Platillos?.nombre_platillo || "N/A"}</span>
                    <span className="fw-bold text-success ms-2">C${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="text-muted small">
                    <span>Cant: <strong>{det.cantidad}</strong></span>
                    <span className="mx-2">·</span>
                    <span>Precio unit: C${precioUnit.toFixed(2)}</span>
                  </div>
                  {(det.Extras?.descripcion || det.Salsas?.descripcion) && (
                    <div className="text-muted small mt-1">
                      {det.Extras?.descripcion && <span>Extra: {det.Extras.descripcion}</span>}
                      {det.Extras?.descripcion && det.Salsas?.descripcion && <span className="mx-1">·</span>}
                      {det.Salsas?.descripcion && <span>Salsa: {det.Salsas.descripcion}</span>}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Total móvil */}
            <div className="d-flex justify-content-end mt-2">
              <span className="fw-bold text-muted me-2">Total general:</span>
              <span className="fw-bold text-success">
                C${detalles.reduce((acc, d) => acc + (d.precio_unitario || 0) * d.cantidad, 0).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          /* Vista escritorio: tabla */
          <Table hover className="custom-table mb-0">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "60px" }}>Cant.</th>
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
        )}

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