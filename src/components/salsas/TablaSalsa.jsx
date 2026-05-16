import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaSalsa = ({
  salsas,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salsas && salsas.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [salsas]);

  return (
    <>
      {loading ? (
        <div className="text-center">
          <h4>Cargando salsas...</h4>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <Table striped borderless hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Precio (C$)</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salsas.map((salsa) => (
              <tr key={salsa.id_salsa}>
                <td>{salsa.id_salsa}</td>
                <td>{salsa.descripcion}</td>
                <td>${parseFloat(salsa.precio || 0).toFixed(2)}</td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(salsa)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(salsa)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaSalsa;