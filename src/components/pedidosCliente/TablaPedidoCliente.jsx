import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaPedidoCliente = ({
  pedidos,
  onVerDetalles,
  tiposPago
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pedidos) {
      setLoading(false);
    }
  }, [pedidos]);

  // Asignar el badge de estado moderno idéntico al admin
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
    // Por defecto: Pendiente
    return (
      <span className="badge-custom badge-pendiente">
        <i className="bi bi-clock-history me-1"></i>
        {estado}
      </span>
    );
  };

  // Retorna el ícono según el tipo de pago
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

  // ✅ Retorna color de borde izquierdo según estado (MÁS OSCUROS)
  const getBorderColor = (estado) => {
    const est = estado?.toLowerCase();
    if (est === "completado") return "#047857"; // Verde oscuro
    if (est === "cancelado") return "#dc2626"; // Rojo oscuro
    if (est === "en preparación" || est === "en preparacion") return "#1d4ed8"; // Azul oscuro
    return "#d97706"; // Ámbar oscuro (Pendiente)
  };

  return (
    <>
      <style>{`
        .custom-table-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .custom-table {
          margin-bottom: 0;
        }
        .custom-table thead th {
          background: #f8f9fa;
          border-bottom: 2px solid #d1d5db;
          color: #374151;
          font-weight: 700;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 14px 16px;
        }
        .custom-table tbody tr {
          transition: all 0.2s ease;
          border-left: 6px solid transparent;
        }
        .custom-table tbody tr:hover {
          background: #fafafa;
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .custom-table tbody td {
          padding: 16px;
          vertical-align: middle;
          font-size: 0.9rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .col-id {
          font-weight: 700;
          color: #0c0c2c;
          font-size: 0.95rem;
        }
        .col-fecha {
          color: #6b7280;
          font-size: 0.85rem;
        }
        .col-tipo {
          font-weight: 600;
        }
        .col-total {
          font-weight: 800;
          font-size: 1rem;
          color: #059669;
        }
        /* Badges personalizados */
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
      `}</style>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" role="status" />
          <h5 className="mt-3 text-muted">Cargando tus pedidos...</h5>
        </div>
      ) : (
        <div className="custom-table-card">
          <Table responsive hover className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo Pedido</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  <tr 
                    key={pedido.id_pedido}
                    style={{
                      borderLeft: `6px solid ${getBorderColor(pedido.estado)}`,
                    }}
                  >
                    <td className="col-id">#{pedido.id_pedido}</td>

                    <td className="col-fecha">
                      <i className="bi bi-calendar3 me-1 text-muted"></i>
                      {pedido.fecha
                        ? new Date(pedido.fecha).toLocaleString([], {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}
                    </td>

                    <td className="col-tipo">
                      {pedido.id_tipo === 1 || pedido.id_tipo === "1" ? (
                        <span style={{ color: "#2563eb" }}>
                          <i className="bi bi-globe me-1"></i>
                          En línea
                        </span>
                      ) : (
                        <span style={{ color: "#059669" }}>
                          <i className="bi bi-shop me-1"></i>
                          Presencial
                        </span>
                      )}
                    </td>

                    <td>
                      <span>
                        <i className={`bi ${getIconoPago(pedido.tipoPagoNombre)} me-1`}></i>
                        <strong>{pedido.tipoPagoNombre || "No especificado"}</strong>
                      </span>
                    </td>

                    <td>{renderBadgeEstado(pedido.estado)}</td>

                    <td className="col-total">
                      C${pedido.total?.toFixed(2) || "0.00"}
                    </td>

                    <td className="text-center" style={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="rounded-3 fw-semibold"
                        onClick={() => onVerDetalles(pedido, tiposPago)}
                        title="Ver detalles del pedido"
                        style={{
                          borderColor: "#ff6a00",
                          color: "#ff6a00",
                          borderWidth: "2px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#ff6a00";
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#ff6a00";
                        }}
                      >
                        <i className="bi bi-eye me-1"></i> Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-receipt fs-3 d-block mb-2"></i>
                    No se encontraron pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default TablaPedidoCliente;