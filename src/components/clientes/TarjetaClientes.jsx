import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaClientes = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    // Manejo de estado de carga inicial
    if (clientes) {
      setCargando(false);
    }
  }, [clientes]);

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

  return (
    <>
      {cargando ? (
        <div className="text-center my-5">
          <h5>Cargando clientes...</h5>
          <Spinner animation="border" variant="dark" role="status" />
        </div>
      ) : (
        <div className="contenedor-tarjetas-movil">
          {clientes.map((cliente) => {
            const tarjetaActiva = idTarjetaActiva === cliente.id_cliente;

            return (
              <Card
                key={cliente.id_cliente}
                className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-cliente-contenedor"
                onClick={() => alternarTarjetaActiva(cliente.id_cliente)}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarTarjetaActiva(cliente.id_cliente);
                  }
                }}
                aria-label={`Cliente ${cliente.nombre_cliente}`}
              >
                <Card.Body className="p-2">
                  <Row className="align-items-center gx-3">
                    {/* Icono de usuario */}
                    <Col xs={2} className="px-2">
                      <div className="bg-light d-flex align-items-center justify-content-center rounded-circle tarjeta-placeholder-icono" style={{ width: '45px', height: '45px' }}>
                        <i className="bi bi-person text-muted fs-4"></i>
                      </div>
                    </Col>

                    {/* Información Principal */}
                    <Col xs={7} className="d-flex flex-column justify-content-center">
                      <div className="fw-bold text-dark text-truncate">
                        {cliente.nombre_cliente} {cliente.apellido_cliente}
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-telephone me-1"></i>
                        {cliente.telefono || "Sin teléfono"}
                      </div>
                    </Col>

                    {/* Indicador visual */}
                    <Col xs={3} className="text-end">
                      <i className={`bi ${tarjetaActiva ? 'bi-chevron-up' : 'bi-three-dots-vertical'} text-muted`}></i>
                    </Col>
                  </Row>
                </Card.Body>

                {/* Capa de botones (Solo visible al hacer clic) */}
                {tarjetaActiva && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdTarjetaActiva(null);
                    }}
                    className="tarjeta-categoria-capa d-flex align-items-center justify-content-center"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '0.5rem',
                      zIndex: 2
                    }}
                  >
                    <div
                      className="d-flex gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="warning"
                        className="rounded-circle shadow-sm"
                        onClick={() => {
                          abrirModalEdicion(cliente);
                          setIdTarjetaActiva(null);
                        }}
                      >
                        <i className="bi bi-pencil text-white"></i>
                      </Button>

                      <Button
                        variant="danger"
                        className="rounded-circle shadow-sm"
                        onClick={() => {
                          abrirModalEliminacion(cliente);
                          setIdTarjetaActiva(null);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          
          {clientes.length === 0 && (
            <div className="text-center text-muted mt-4">
              No hay clientes registrados.
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TarjetaClientes;