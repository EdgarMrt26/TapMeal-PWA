import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaPedido = ({
  pedidos,
  abrirModalEdicion,
  abrirModalEliminacion,
  onVerVoucher,    // nueva prop
  onVerFactura     // nueva prop
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pedidos && pedidos.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [pedidos]);

  return (
    <>
      {loading ? (
        <div className="text-center">
          <h4>Cargando pedidos...</h4>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <Table striped borderless hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Mesa</th>
              <th>Estado</th>
              <th>Total</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id_pedido}>
                <td>{pedido.id_pedido}</td>

                <td>
                  {pedido.fecha
                    ? new Date(pedido.fecha).toLocaleString()
                    : "N/A"}
                </td>

                <td>
                  {pedido.Clientes
                    ? `${pedido.Clientes.nombre_cliente} ${pedido.Clientes.apellido_cliente}`
                    : "N/A"}
                </td>

                <td>
                  {pedido.Tipo_pedido
                    ? pedido.Tipo_pedido.descripcion
                    : "N/A"}
                </td>

                <td>
                  {pedido.Mesas
                    ? `Mesa ${pedido.Mesas.id_mesa}`
                    : "N/A"}
                </td>

                <td>
                  <span
                    className={`badge bg-${
                      pedido.estado === "Completado"
                        ? "success"
                        : pedido.estado === "Cancelado"
                        ? "danger"
                        : "warning"
                    }`}
                  >
                    {pedido.estado}
                  </span>
                </td>

                <td>
                  ${pedido.total?.toFixed(2) || "0.00"}
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="m-1"
                    onClick={() => onVerVoucher(pedido.id_pedido)}
                    title="Voucher para cocina"
                  >
                    <i className="bi bi-receipt"></i>
                  </Button>

                  <Button
                    variant="outline-success"
                    size="sm"
                    className="m-1"
                    onClick={() => onVerFactura(pedido.id_pedido)}
                    title="Factura"
                  >
                    <i className="bi bi-file-text"></i>
                  </Button>

                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(pedido)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(pedido)}
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

export default TablaPedido;