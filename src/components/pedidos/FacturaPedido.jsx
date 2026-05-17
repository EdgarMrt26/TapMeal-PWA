import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const FacturaPedido = ({ show, onHide, pedidoId }) => {
  const [factura, setFactura] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!show || !pedidoId) return;
    const cargarFactura = async () => {
      setCargando(true);
      try {
        // Incluimos también la mesa en la consulta
        const { data: pedidoData, error: errorPedido } = await supabase
          .from("Pedido")
          .select(`
            id_pedido, fecha, total,
            Clientes (nombre_cliente, apellido_cliente, telefono, direccion),
            Mesas (id_mesa)
          `)
          .eq("id_pedido", pedidoId)
          .single();
        if (errorPedido) throw errorPedido;
        setFactura(pedidoData);

        const { data: detallesData, error: errorDetalles } = await supabase
          .from("Detalle_pedido")
          .select(`
            cantidad, precio_unitario,
            Platillos (nombre_platillo)
          `)
          .eq("id_pedido", pedidoId);
        if (errorDetalles) throw errorDetalles;
        setDetalles(detallesData || []);
      } catch (err) {
        console.error("Error cargando factura:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarFactura();
  }, [show, pedidoId]);

  const subtotal = factura?.total || 0;
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  // Función para mostrar la mesa
  const mostrarMesa = () => {
    if (!factura?.Mesas || factura.Mesas.id_mesa === null) {
      return "Mesa: No";
    }
    return `Mesa:  ${factura.Mesas.id_mesa}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🧾 Factura - Pedido #{pedidoId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cargando ? (
          <div className="text-center"><Spinner animation="border" variant="success" /></div>
        ) : (
          <div id="factura-content" style={{ border: "1px solid red", padding: "10px" }}>
            <div className="text-center mb-4">
              <h4>TapMeal - Factura Electrónica</h4>
              <p>
                <strong>Pedido N°:</strong> {factura?.id_pedido}<br />
                <strong>Fecha:</strong> {factura?.fecha ? new Date(factura.fecha).toLocaleString() : "N/A"}<br />
                <strong>{mostrarMesa()}</strong><br />
                <strong>Cliente:</strong> {factura?.Clientes?.nombre_cliente} {factura?.Clientes?.apellido_cliente || ""}<br />
                {factura?.Clientes?.telefono && <><strong>Tel:</strong> {factura.Clientes.telefono}<br /></>}
                {factura?.Clientes?.direccion && <><strong>Dir:</strong> {factura.Clientes.direccion}<br /></>}
              </p>
            </div>
            <Table striped bordered>
              <thead className="table-dark">
                <tr>
                  <th>Cant.</th>
                  <th>Producto</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((det, idx) => (
                  <tr key={idx}>
                    <td>{det.cantidad}</td>
                    <td>{det.Platillos?.nombre_platillo || "N/A"}</td>
                    <td>${det.precio_unitario?.toFixed(2)}</td>
                    <td>${(det.cantidad * det.precio_unitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                  <td>${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end"><strong>IVA 15%:</strong></td>
                  <td>${iva.toFixed(2)}</td>
                </tr>
                <tr className="fw-bold">
                  <td colSpan="3" className="text-end">Total:</td>
                  <td>${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </Table>
            <div className="text-center text-muted mt-3" style={{ fontSize: "0.8rem" }}>
              TAPMEAL-Tu comida con un solo toque.
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
        <Button variant="success" onClick={handlePrint} disabled={cargando}>
          <i className="bi bi-printer"></i> Imprimir / Guardar PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FacturaPedido;