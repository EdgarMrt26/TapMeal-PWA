import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaMesas = ({
  mesas,
  abrirModalEdicion,
  abrirModalEliminacion

  
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(mesas && mesas.length > 0));
  }, [mesas]);

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
      {cargando? (
        <div className="text-center my-5">
          <h5>Cargando categorías...</h5>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <div>
          {mesas.map((mesa) => {
            const tarjetaActiva = idTarjetaActiva === mesa.id_mesa;

            return (
              <Card
                key={mesa.id_mesa}
                className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-mesa-contenedor"
                onClick={() => alternarTarjetaActiva(mesa.id_mesa)}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " "){
                    evento.preventDefault();
                    alternarTarjetaActiva(mesa.id_mesa);
                  }
                }}
                aria-label={`mesa ${mesa.nombre_mesa}`}
                >
                  <Card.Body
                    className={`p-2 tarjeta-mesa-cuerpo &{
                        tarjetaActiva
                        ? "tarjeta-mesa-cuerpo-activo"
                        ? "tarjeta-mesa-cuerpo-inactivo"
                      }`}
                      >
                        <Row className="align-items-center gx-3">
                          <Col xs={2} className="px-2">
                            <div 
                              className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-mesa-placeholder-imagen"
                              >
                                <i className="bi bi-bookmark text-muted fs-3"></i>
                              </div>
                          </Col>
                          <Col xs={5} className="text-start">
                            <div className="fw-semibold text-truncate">
                              {mesa.nombre_mesa}
                            </div>
                          </Col>
                          <Col  
                            xs={5}
                            className="d-flex flex-column align-items-end justify-content-center text-end"
                            >
                              <div className="fw-semibold small">Activa</div>
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
                                    abrirModalEdicion(mesa);
                                    setIdTarjetaActiva(null);
                                  }}
                                  aria-label={`Editar &{categoria.nombre_categoria}`}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>

                                  <Button 
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      abrirModalEliminacion(mesa);
                                      setIdTarjetaActiva(null);
                                    }}
                                    aria-label={`Eliminar ${mesa.nombre_mesa}`}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                              </div>
                          </div>
                      )}
                </Card>
            )
          })}
        </div>
      )}
    </>
  );
};

export default TarjetaMesas;