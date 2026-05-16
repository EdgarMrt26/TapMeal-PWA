import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaExtra = ({
  extras,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(extras && extras.length > 0));
  }, [extras]);

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
          <h5>Cargando extras...</h5>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <div>
          {extras.map((extra) => {
            const tarjetaActiva = idTarjetaActiva === extra.id_extra;

            return (
              <Card
                key={extra.id_extra}
                className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-categoria-contenedor"
                onClick={() => alternarTarjetaActiva(extra.id_extra)}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarTarjetaActiva(extra.id_extra);
                  }
                }}
                aria-label={`Extra ${extra.descripcion}`}
                style={{ cursor: "pointer" }}
              >
                <Card.Body
                  className={`p-3 tarjeta-categoria-cuerpo ${
                    tarjetaActiva ? "tarjeta-categoria-cuerpo-activo" : ""
                  }`}
                >
                  <Row className="align-items-center gx-3">

                    {/* Ícono */}
                    <Col xs={2} className="px-2">
                      <div className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-categoria-placeholder-imagen">
                        <i className="bi bi-plus-circle-dotted text-success fs-3"></i>
                      </div>
                    </Col>

                    {/* Descripción */}
                    <Col xs={6} className="text-start">
                      <div className="fw-semibold text-truncate">
                        {extra.descripcion}
                      </div>
                      <div className="small text-muted mt-1">
                        ID: {extra.id_extra}
                      </div>
                    </Col>

                    {/* Precio */}
                    <Col xs={4} className="d-flex flex-column align-items-end justify-content-center text-end">
                      <div className="fw-bold text-success">
                        ${parseFloat(extra.precio || 0).toFixed(2)}
                      </div>
                    </Col>

                  </Row>
                </Card.Body>

                {/* Capa de acciones al hacer click */}
                {tarjetaActiva && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdTarjetaActiva(null);
                    }}
                    className="tarjeta-categoria-capa"
                  >
                    <div
                      className="d-flex gap-2 tarjeta-categoria-botones-capa"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          abrirModalEdicion(extra);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Editar ${extra.descripcion}`}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          abrirModalEliminacion(extra);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Eliminar ${extra.descripcion}`}
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

export default TarjetaExtra;