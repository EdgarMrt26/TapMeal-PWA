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
        {/* Información General */}
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

        {/* Resumen de pago */}
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

        {/* Tabla responsiva - Versión desktop */}
        <div className="d-none d-md-block">
          <div className="custom-table-card">
            <Table responsive hover className="custom-table mb-0">
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
        </div>

        {/* Versión móvil - Cards de productos */}
        <div className="d-block d-md-none">
          <div className="productos-mobile-container">
            {detalles.map((det, idx) => {
              const precioUnit = det.precio_unitario || 0;
              const subtotal = precioUnit * det.cantidad;
              return (
                <div key={idx} className="producto-card-mobile mb-3">
                  <div className="producto-header">
                    <span className="cantidad-badge">{det.cantidad}x</span>
                    <span className="producto-nombre">{det.Platillos?.nombre_platillo || "N/A"}</span>
                  </div>
                  
                  {(det.Extras?.descripcion || det.Salsas?.descripcion) && (
                    <div className="producto-detalles">
                      {det.Extras?.descripcion && (
                        <div className="detalle-item">
                          <i className="bi bi-plus-circle-fill text-success me-1"></i>
                          <span className="detalle-label">Extra:</span>
                          <span className="detalle-valor">{det.Extras.descripcion}</span>
                        </div>
                      )}
                      {det.Salsas?.descripcion && (
                        <div className="detalle-item">
                          <i className="bi bi-droplet-fill text-danger me-1"></i>
                          <span className="detalle-label">Salsa:</span>
                          <span className="detalle-valor">{det.Salsas.descripcion}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="producto-footer">
                    <div className="precio-unitario">
                      <span className="text-muted small">Precio unitario:</span>
                      <span className="ms-2">C${precioUnit.toFixed(2)}</span>
                    </div>
                    <div className="subtotal">
                      <span className="text-muted small">Subtotal:</span>
                      <span className="ms-2 fw-bold text-success">C${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Total móvil */}
            <div className="total-mobile">
              <div className="total-mobile-content">
                <span className="total-mobile-label">Total del pedido:</span>
                <span className="total-mobile-amount">C${pedido.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <button className="btn btn-dark px-4 rounded-3 shadow-sm" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>

      <style>{`
        /* Estilos para la versión móvil */
        .productos-mobile-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .producto-card-mobile {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
          transition: all 0.2s ease;
        }
        
        .producto-card-mobile:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .producto-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .cantidad-badge {
          background: #ff6a00;
          color: white;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          min-width: 45px;
          text-align: center;
        }
        
        .producto-nombre {
          font-weight: 700;
          font-size: 1rem;
          color: #1f2937;
          flex: 1;
        }
        
        .producto-detalles {
          margin-bottom: 12px;
          padding: 8px;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .detalle-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }
        
        .detalle-item:last-child {
          margin-bottom: 0;
        }
        
        .detalle-label {
          font-weight: 600;
          color: #6b7280;
          min-width: 45px;
        }
        
        .detalle-valor {
          color: #374151;
        }
        
        .producto-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
        }
        
        .precio-unitario, .subtotal {
          font-size: 0.85rem;
        }
        
        .total-mobile {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        
        .total-mobile-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-mobile-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #065f46;
        }
        
        .total-mobile-amount {
          font-size: 1.3rem;
          font-weight: 800;
          color: #059669;
        }
        
        /* Estilos tabla desktop (mantener los originales) */
        .custom-table-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        
        .custom-table thead th {
          background: #f8f9fa;
          border-bottom: 2px solid #e5e7eb;
          color: #374151;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          padding: 12px;
        }
        
        .custom-table tbody td {
          padding: 12px;
          vertical-align: middle;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .badge-custom {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
        }
        
        .badge-completado {
          background: #d1fae5;
          color: #065f46;
        }
        
        .badge-cancelado {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .badge-preparacion {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .badge-pendiente {
          background: #fef3c7;
          color: #92400e;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }
        
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Responsive adicional */
        @media (max-width: 576px) {
          .modal-body {
            padding: 16px;
          }
          
          .producto-card-mobile {
            padding: 10px;
          }
          
          .producto-nombre {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default DetallesPedidoModal;