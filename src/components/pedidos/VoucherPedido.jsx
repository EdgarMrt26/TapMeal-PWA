import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const VoucherPedido = ({ show, onHide, pedidoId }) => {
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!show || !pedidoId) return;
    const cargarVoucher = async () => {
      setCargando(true);
      try {
        // Obtener encabezado (cliente, mesa, fecha)
        const { data: pedidoData, error: errorPedido } = await supabase
          .from("Pedido")
          .select(`
            id_pedido, fecha, estado,
            Clientes (nombre_cliente, apellido_cliente),
            Mesas (id_mesa)
          `)
          .eq("id_pedido", pedidoId)
          .single();
        if (errorPedido) throw errorPedido;
        setPedido(pedidoData);

        // Obtener detalles con platillo, extra, salsa
        const { data: detallesData, error: errorDetalles } = await supabase
          .from("Detalle_pedido")
          .select(`
            cantidad,
            Platillos (nombre_platillo),
            Extras (descripcion),
            Salsas (descripcion)
          `)
          .eq("id_pedido", pedidoId);
        if (errorDetalles) throw errorDetalles;
        setDetalles(detallesData || []);
      } catch (err) {
        console.error("Error cargando voucher:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarVoucher();
  }, [show, pedidoId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="voucher-modal">
      <Modal.Header closeButton>
        <Modal.Title>🍽️ Voucher para Cocina - Pedido #{pedidoId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cargando ? (
          <div className="text-center"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <div id="voucher-content">
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h3>TapMeal</h3>
              <p>
                <strong>Pedido #{pedido?.id_pedido}</strong><br />
                Fecha: {pedido?.fecha ? new Date(pedido.fecha).toLocaleString() : "N/A"}<br />
                Mesa: {pedido?.Mesas?.id_mesa ? `Mesa ${pedido.Mesas.id_mesa}` : "No asignada"}<br />
                Cliente: {pedido?.Clientes?.nombre_cliente} {pedido?.Clientes?.apellido_cliente || ""}
              </p>
            </div>
            <Table bordered striped size="sm">
              <thead className="table-dark">
                <tr>
                  <th>Cant.</th>
                  <th>Platillo</th>
                  <th>Extra</th>
                  <th>Salsa</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((det, idx) => (
                  <tr key={idx}>
                    <td>{det.cantidad}</td>
                    <td>{det.Platillos?.nombre_platillo || "N/A"}</td>
                    <td>{det.Extras?.descripcion || "-"}</td>
                    <td>{det.Salsas?.descripcion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="text-end mt-3">
              <strong>Total: ${pedido?.total?.toFixed(2) || "0.00"}</strong>
            </div>
            <div className="text-center mt-4 text-muted" style={{ fontSize: "0.8rem" }}>
              Este voucher es solo para cocina. No es factura fiscal.
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
        <Button variant="primary" onClick={handlePrint} disabled={cargando}>
          <i className="bi bi-printer"></i> Imprimir Voucher
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VoucherPedido;