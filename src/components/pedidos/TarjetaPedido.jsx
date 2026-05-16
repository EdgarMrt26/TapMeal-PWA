import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaPedido = ({
  pedidos,
  abrirModalEdicion,
  abrirModalEliminacion,
  onVerVoucher,    // nueva prop
  onVerFactura     // nueva prop
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(pedidos && pedidos.length > 0));
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

  return (
    <>
      {cargando ? (
        <div className="text-center my-5">
          <h5>Cargando pedidos...</h5>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <div>
          {pedidos.map((pedido) => {
            const tarjetaActiva = idTarjetaActiva === pedido.id_pedido;

            return (
              <Card
                key={pedido.id_pedido}
                className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-pedido-contenedor"
                onClick={() => alternarTarjetaActiva(pedido.id_pedido)}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarTarjetaActiva(pedido.id_pedido);
                  }
                }}
                aria-label={`Pedido ${pedido.id_pedido}`}
              >
                <Card.Body
                  className={`p-3 tarjeta-pedido-cuerpo ${
                    tarjetaActiva
                      ? "tarjeta-pedido-cuerpo-activo"
                      : "tarjeta-pedido-cuerpo-inactivo"
                  }`}
                >
                  <Row className="align-items-center gx-3">
                    <Col xs={3} md={2} className="px-2">
                      <div className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-pedido-placeholder-imagen">
                        <i className="bi bi-receipt text-primary fs-3"></i>
                      </div>
                    </Col>

                    <Col xs={5} md={6} className="text-start">
                      <div className="fw-semibold">
                        Pedido #{pedido.id_pedido}
                      </div>
                      <div className="small text-muted text-truncate">
                        {pedido.Clientes 
                          ? `${pedido.Clientes.nombre_cliente} ${pedido.Clientes.apellido_cliente || ''}`
                          : "Cliente no especificado"}
                      </div>
                      <div className="fw-bold text-success mt-1">
                        ${parseFloat(pedido.total || 0).toFixed(2)}
                      </div>
                    </Col>

                    <Col xs={4} md={4} className="d-flex flex-column align-items-end justify-content-center text-end">
                      <div className={`badge ${pedido.estado === 'Pendiente' ? 'bg-warning' : 
                        pedido.estado === 'Completado' ? 'bg-success' : 'bg-secondary'}`}>
                        {pedido.estado}
                      </div>
                      <div className="small text-muted mt-1">
                        {formatearFecha(pedido.fecha)}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>

                {tarjetaActiva && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdTarjetaActiva(null);
                    }}
                    className="tarjeta-pedido-capa"
                  >
                    <div
                      className="d-flex gap-2 tarjeta-pedido-botones-capa"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          onVerVoucher(pedido.id_pedido);
                          setIdTarjetaActiva(null);
                        }}
                        title="Voucher cocina"
                      >
                        <i className="bi bi-receipt"></i>
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => {
                          onVerFactura(pedido.id_pedido);
                          setIdTarjetaActiva(null);
                        }}
                        title="Factura"
                      >
                        <i className="bi bi-file-text"></i>
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          abrirModalEdicion(pedido);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Editar pedido ${pedido.id_pedido}`}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          abrirModalEliminacion(pedido);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Eliminar pedido ${pedido.id_pedido}`}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TarjetaPedido;