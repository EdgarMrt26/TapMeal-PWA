import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";


const TablaClientes = ({
  clientes,
  abrirModalEdicion, 
  abrirModalEliminacion
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si la lista existe, dejamos de mostrar el cargando
    if (clientes) {
      setLoading(false);
    }
  }, [clientes]);

  return (
    <>
      {loading ? (
        <div className="text-center my-5">
          <h4>Cargando clientes...</h4>
          <Spinner animation="border" variant="dark" role="status" />
        </div>
      ) : (
        <Table striped borderless hover responsive size="sm" className="align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.id_cliente}>
                  <td>{cliente.id_cliente}</td>
                  <td>
                    {cliente.nombre_cliente} {cliente.apellido_cliente}
                  </td>
                  <td>{cliente.telefono || "N/A"}</td>
                  <td className="text-truncate" style={{ maxWidth: "200px" }}>
                    {cliente.direccion || "Sin dirección"}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="m-1"
                      onClick={() => abrirModalEdicion(cliente)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>

                    <Button 
                      variant="outline-danger"
                      size="sm"
                      className="m-1"
                      onClick={() => abrirModalEliminacion(cliente)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  No se encontraron clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaClientes;