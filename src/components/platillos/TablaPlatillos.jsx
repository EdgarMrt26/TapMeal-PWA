import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";

const TablaPlatillos = ({
  platillos,
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(platillos && platillos.length > 0));
  }, [platillos]);

  return (
    <>
      {loading ? (

        <div className="text-center">
          <Spinner animation="border" variant="success" />
        </div>

      ) : (

        <Table striped hover responsive size="sm">

          <thead>
            <tr>

              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th className="text-center">Imagen</th>
              <th className="text-center">Acciones</th>

            </tr>
          </thead>

          <tbody>

            {platillos.map((platillo) => {

              const categoria = categorias.find(
                (cat) =>
                  cat.id_categoria === platillo.categoria_platillo
              );

              return (
                <tr key={platillo.id_platillo}>

                  <td>{platillo.id_platillo}</td>

                  <td>{platillo.nombre_platillo}</td>

                  <td>
                    {categoria
                      ? categoria.nombre_categoria
                      : "Sin categoría"}
                  </td>

                  <td>${platillo.precio}</td>

                  <td>{platillo.descripcion}</td>

                  <td className="text-center">

                    <img
                      src={
                        platillo.url_imagen ||
                        "https://via.placeholder.com/50"
                      }
                      alt={platillo.nombre_platillo}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />

                  </td>

                  <td className="text-center">

                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="me-1"
                      onClick={() => abrirModalEdicion(platillo)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => abrirModalEliminacion(platillo)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </Table>
      )}
    </>
  );
};

export default TablaPlatillos;