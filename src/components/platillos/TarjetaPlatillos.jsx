import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";

const TarjetaPlatillos = ({
  platillos,
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {

  const [cargando, setCargando] = useState(true);
  const [idActivo, setIdActivo] = useState(null);

  useEffect(() => {
    setCargando(!(platillos && platillos.length > 0));
  }, [platillos]);

  const manejarEscape = useCallback((e) => {
    if (e.key === "Escape") setIdActivo(null);
  }, []);

  useEffect(() => {

    window.addEventListener("keydown", manejarEscape);

    return () =>
      window.removeEventListener("keydown", manejarEscape);

  }, [manejarEscape]);

  const toggle = (id) => {
    setIdActivo((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {cargando ? (

        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
        </div>

      ) : (

        <div>

          {platillos.map((platillo) => {

            const categoria = categorias.find(
              (cat) =>
                cat.id_categoria === platillo.categoria_platillo
            );

            const activo = idActivo === platillo.id_platillo;

            return (
              <Card
                key={platillo.id_platillo}
                className="mb-3 shadow-sm border-0"
                onClick={() => toggle(platillo.id_platillo)}
              >

                <Card.Body className="p-2">

                  <Row className="align-items-center">

                    <Col xs={8}>

                      <div className="fw-bold">
                        {platillo.nombre_platillo}
                      </div>

                      <div className="small text-primary">
                        {categoria
                          ? categoria.nombre_categoria
                          : "Sin categoría"}
                      </div>

                      <div className="text-success fw-semibold">
                        ${platillo.precio}
                      </div>

                      <div className="small text-muted text-truncate">
                        {platillo.descripcion}
                      </div>

                    </Col>

                    <Col
                      xs={4}
                      className="d-flex justify-content-end"
                    >

                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#f5f5f5",
                        }}
                      >

                        <img
                          src={
                            platillo.url_imagen ||
                            "https://via.placeholder.com/70"
                          }
                          alt={platillo.nombre_platillo}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />

                      </div>

                    </Col>

                  </Row>

                </Card.Body>

                {activo && (

                  <div
                    className="p-2 d-flex justify-content-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >

                    <Button
                      size="sm"
                      variant="outline-warning"
                      onClick={() => {
                        abrirModalEdicion(platillo);
                        setIdActivo(null);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        abrirModalEliminacion(platillo);
                        setIdActivo(null);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>

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

export default TarjetaPlatillos;