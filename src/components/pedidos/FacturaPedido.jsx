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
        // Obtener pedido con cliente
        const { data: pedidoData, error: errorPedido } = await supabase
          .from("Pedido")
          .select(`
            id_pedido, fecha, total,
            Clientes (nombre_cliente, apellido_cliente, telefono, direccion)
          `)
          .eq("id_pedido", pedidoId)
          .single();
        if (errorPedido) throw errorPedido;
        setFactura(pedidoData);

        // Obtener detalles con platillo (para la factura solo necesitas precio y cantidad)
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
  const iva = subtotal * 0.15; // En nicaragua es ese :3
  const total = subtotal + iva;

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
          <div id="factura-content">
            <div className="text-center mb-4">
              <h4>TapMeal - Factura Electrónica</h4>
              <p>
                <strong>Pedido N°:</strong> {factura?.id_pedido}<br />
                <strong>Fecha:</strong> {factura?.fecha ? new Date(factura.fecha).toLocaleString() : "N/A"}<br />
                <strong>Cliente:</strong> {factura?.Clientes?.nombre_cliente} {factura?.Clientes?.apellido_cliente || ""}<br />
                {factura?.Clientes?.telefono && <><strong>Tel:</strong> {factura.Clientes.telefono}<br /></>}
                {factura?.Clientes?.direccion && <><strong>Dir:</strong> {factura.Clientes.direccion}</>}
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
                  <td colSpan="3" className="text-end"><strong>IVA 16%:</strong></td>
                  <td>${iva.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                  <td><strong>${total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </Table>
            <div className="text-center text-muted mt-3" style={{ fontSize: "0.8rem" }}>
              Documento válido como factura simple. No reemplaza a factura fiscal oficial.
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