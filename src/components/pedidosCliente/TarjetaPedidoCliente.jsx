import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaPedidoCliente = ({
  pedidos,
  onVerDetalles,
  tiposPago
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    if (pedidos) {
      setCargando(false);
    }
  }, [pedidos]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar el badge de estado premium idéntico al admin
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

  return (
    <>
      {cargando ? (
        <div className="text-center my-5">
          <h5>Cargando tus pedidos...</h5>
          <Spinner animation="border" variant="warning" role="status" />
        </div>
      ) : (
        <Row className="g-4">
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => {
              const borderLeftColor = 
                pedido.estado === "Completado" ? "#10b981" :
                pedido.estado === "Cancelado" ? "#ef4444" :
                pedido.estado === "En preparación" || pedido.estado === "En preparacion" ? "#3b82f6" : "#f59e0b";

              return (
                <Col xs={12} md={6} lg={4} key={pedido.id_pedido}>
                  <Card
                    className="border-0 rounded-3 shadow-sm tarjeta-pedido-cliente h-100 mb-0 d-flex flex-column"
                    style={{
                      borderLeft: `6px solid ${borderLeftColor}`,
                    }}
                  >
                    <Card.Body className="p-4 d-flex flex-column justify-content-between h-100 text-start">
                      {/* Cabecera: ID de Pedido y Badge de Estado */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold text-dark fs-5">
                          Pedido {pedido.id_pedido}
                        </span>
                        {renderBadgeEstado(pedido.estado)}
                      </div>

                      {/* Información Intermedia */}
                      <div className="mb-4">
                        <div className="text-muted small mb-2 d-flex align-items-center">
                          <i className="bi bi-calendar3 me-2 text-muted"></i>
                          {formatearFecha(pedido.fecha)}
                        </div>
                        <div className="text-dark small mb-3 d-flex align-items-center">
                          <i className={`bi ${getIconoPago(pedido.tipoPagoNombre)} me-2`}></i>
                          <span>
                            Pago: <strong className="text-secondary">{pedido.tipoPagoNombre || "No especificado"}</strong>
                          </span>
                        </div>
                        
                        {/* Caja del Total Premium */}
                        <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center mt-3">
                          <span className="text-muted small fw-semibold">Total:</span>
                          <span className="fw-bold text-success fs-5">
                            C${parseFloat(pedido.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Botón de Acción Directo */}
                      <Button
                        variant="outline-warning"
                        className="w-100 rounded-3 py-2 fw-semibold mt-auto btn-ver-detalles-cliente"
                        onClick={() => onVerDetalles(pedido, tiposPago)}
                        style={{
                          borderColor: "#ff6a00",
                          color: "#ff6a00",
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
                        <i className="bi bi-eye me-2"></i>
                        Ver detalles de mi orden
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col xs={12}>
              <div className="text-center text-muted py-4 bg-white rounded-3 shadow-sm border">
                <i className="bi bi-receipt me-2 fs-4 d-block mb-2 text-muted"></i>
                No tienes pedidos registrados.
              </div>
            </Col>
          )}
        </Row>
      )}
    </>
  );
};

export default TarjetaPedidoCliente;