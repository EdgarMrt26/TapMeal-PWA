import React from "react";
import { Modal, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const DetallesPedidoModal = ({ show, onHide, pedido, detalles }) => {
  if (!pedido) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleString([], {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
        {estado || "Pendiente"}
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
          Detalle del Pedido #{pedido.id_pedido}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-4">
        {/* Información del pedido */}
        <div className="info-pedido mb-4">
          <div className="info-row">
            <span className="info-label">Fecha:</span>
            <span className="info-value">{formatearFecha(pedido.fecha)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Estado:</span>
            <span className="info-value">{renderBadgeEstado(pedido.estado)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tipo de pago:</span>
            <span className="info-value">
              <i className={`bi ${getIconoPago(pedido.tipoPagoNombre)} me-1`}></i>
              {pedido.tipoPagoNombre || "No especificado"}
            </span>
          </div>
          <div className="info-row total-row">
            <span className="info-label">Total:</span>
            <span className="info-value total-amount">
              C${pedido.total?.toFixed(2)}
            </span>
          </div>
        </div>

        <hr className="my-3" />

        <h6 className="fw-bold mb-3">
          <i className="bi bi-bag-check me-2 text-success"></i>
          Productos ordenados
        </h6>

        {/* Versión Desktop - Tabla */}
        <div className="d-none d-md-block">
          <div className="custom-table-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="text-center">Cant.</th>
                  <th>Platillo</th>
                  <th>Extra</th>
                  <th>Salsa</th>
                  <th className="text-end">Precio Unit.</th>
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
                      <td className="fw-semibold">{det.Platillos?.nombre_platillo || "N/A"}</td>
                      <td>{det.Extras?.descripcion || "-"}</td>
                      <td>{det.Salsas?.descripcion || "-"}</td>
                      <td className="text-end">C${precioUnit.toFixed(2)}</td>
                      <td className="text-end fw-bold text-success">C${subtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Versión Móvil - Cards */}
        <div className="d-block d-md-none">
          <div className="productos-mobile">
            {detalles.map((det, idx) => {
              const precioUnit = det.precio_unitario || 0;
              const subtotal = precioUnit * det.cantidad;
              return (
                <div key={idx} className="producto-card-mobile">
                  <div className="producto-header">
                    <span className="cantidad-badge">{det.cantidad}x</span>
                    <span className="producto-nombre">{det.Platillos?.nombre_platillo || "N/A"}</span>
                  </div>
                  
                  {(det.Extras?.descripcion || det.Salsas?.descripcion) && (
                    <div className="producto-detalles">
                      {det.Extras?.descripcion && (
                        <div className="detalle-linea">
                          <i className="bi bi-plus-circle text-success me-1"></i>
                          <span className="detalle-tipo">Extra:</span>
                          <span>{det.Extras.descripcion}</span>
                        </div>
                      )}
                      {det.Salsas?.descripcion && (
                        <div className="detalle-linea">
                          <i className="bi bi-droplet text-danger me-1"></i>
                          <span className="detalle-tipo">Salsa:</span>
                          <span>{det.Salsas.descripcion}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="producto-precios">
                    <div className="precio-unitario">
                      <span className="text-muted">Precio unitario:</span>
                      <span>C${precioUnit.toFixed(2)}</span>
                    </div>
                    <div className="subtotal-mobile">
                      <span className="text-muted">Subtotal:</span>
                      <strong className="text-success ms-2">C${subtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Total general móvil */}
            <div className="total-general-mobile">
              <div className="total-general-content">
                <span className="total-label">Total general:</span>
                <span className="total-value">C${pedido.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0">
        <button className="btn-cerrar" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>

      <style>{`
        /* Estilos generales */
        .info-pedido {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 16px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
        }
        
        .info-value {
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2937;
        }
        
        .total-row .total-amount {
          font-size: 1.2rem;
          font-weight: 800;
          color: #059669;
        }
        
        /* Tabla desktop */
        .custom-table-card {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
        }
        
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        
        .custom-table thead th {
          background: #f9fafb;
          padding: 12px;
          font-weight: 700;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .custom-table tbody td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        /* Cards móvil */
        .productos-mobile {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .producto-card-mobile {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
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
          font-size: 0.95rem;
          color: #1f2937;
          flex: 1;
        }
        
        .producto-detalles {
          background: #f9fafb;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 10px;
        }
        
        .detalle-linea {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }
        
        .detalle-linea:last-child {
          margin-bottom: 0;
        }
        
        .detalle-tipo {
          font-weight: 600;
          color: #6b7280;
          min-width: 45px;
        }
        
        .producto-precios {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
          font-size: 0.85rem;
        }
        
        .subtotal-mobile {
          font-weight: 600;
        }
        
        .total-general-mobile {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        
        .total-general-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-general-content .total-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #065f46;
        }
        
        .total-general-content .total-value {
          font-size: 1.3rem;
          font-weight: 800;
          color: #059669;
        }
        
        /* Botón cerrar */
        .btn-cerrar {
          background: #1f2937;
          color: white;
          border: none;
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-cerrar:hover {
          background: #374151;
          transform: scale(1.02);
        }
        
        /* Badges */
        .badge-custom {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
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
        
        /* Responsive */
        @media (max-width: 576px) {
          .modal-body {
            padding: 16px;
          }
          
          .producto-card-mobile {
            padding: 10px;
          }
          
          .total-general-content .total-value {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default DetallesPedidoModal;