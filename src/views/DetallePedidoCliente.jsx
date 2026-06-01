import React, { useEffect, useState } from "react";
import { Container, Card, Badge, Spinner, Alert, Button, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const DetallePedidoCliente = () => {
  const { id } = useParams(); // ID del pedido desde la URL
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tiposPago, setTiposPago] = useState([]);
  const [tiposPedido, setTiposPedido] = useState([]);

  // Cargar catálogos
  const cargarCatalogos = async () => {
    const [resTiposPago, resTiposPedido] = await Promise.all([
      supabase.from("Tipo_pago").select("id_tipo_pago, descripcion"),
      supabase.from("Tipo_pedido").select("id_tipo, descripcion"),
    ]);
    if (resTiposPago.data) setTiposPago(resTiposPago.data);
    if (resTiposPedido.data) setTiposPedido(resTiposPedido.data);
  };

  const getTipoPago = (idTipoPago) => {
    const tipo = tiposPago.find(t => Number(t.id_tipo_pago) === Number(idTipoPago));
    return tipo ? tipo.descripcion : "No especificado";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString();
  };

  const cargarPedido = async () => {
    if (!id) return;
    setCargando(true);
    try {
      // Obtener encabezado del pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("Pedido")
        .select(`id_pedido, fecha, estado, total, id_tipo, id_tipo_pago, id_mesa`)
        .eq("id_pedido", id)
        .single();
      if (pedidoError) throw pedidoError;
      setPedido(pedidoData);

      // Obtener detalles con platillo, extra, salsa
      const { data: detallesData, error: detallesError } = await supabase
        .from("Detalle_pedido")
        .select(`
          cantidad, precio_unitario,
          Platillos (nombre_platillo),
          Extras (descripcion),
          Salsas (descripcion)
        `)
        .eq("id_pedido", id);
      if (detallesError) throw detallesError;
      setDetalles(detallesData || []);
    } catch (err) {
      console.error("Error cargando pedido:", err);
      setError("No se pudo cargar el pedido solicitado.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      await cargarCatalogos();
      await cargarPedido();
    };
    inicializar();
  }, [id]);

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>Cargando detalles del pedido...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate("/pedidosCliente")}>
          Volver a mis pedidos
        </Button>
      </Container>
    );
  }

  if (!pedido) return null;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 700, color: "#0c0c2c" }}>
          <i className="bi bi-receipt me-2" style={{ color: "#ff6a00" }} />
          Detalle del Pedido #{pedido.id_pedido}
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate("/pedidosCliente")}>
          <i className="bi bi-arrow-left me-2" /> Atrás
        </Button>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Fecha:</strong> {formatearFecha(pedido.fecha)}</p>
              <p><strong>Estado:</strong>{" "}
                <Badge bg={
                  pedido.estado === "Pendiente" ? "warning" :
                  pedido.estado === "En preparación" ? "info" :
                  pedido.estado === "Completado" ? "success" : "danger"
                } pill>
                  {pedido.estado}
                </Badge>
              </p>
            </div>
            <div className="col-md-6">
              <p><strong>Tipo de pago:</strong> {getTipoPago(pedido.id_tipo_pago)}</p>
              <p><strong>Total:</strong> <span className="fw-bold text-success">C${pedido.total?.toFixed(2)}</span></p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <h5 className="mb-3">Productos ordenados</h5>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Cant.</th>
            <th>Platillo</th>
            <th>Extra</th>
            <th>Salsa</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((det, idx) => {
            const precioUnit = det.precio_unitario || 0;
            const subtotal = precioUnit * det.cantidad;
            return (
              <tr key={idx}>
                <td>{det.cantidad}</td>
                <td>{det.Platillos?.nombre_platillo || "N/A"}</td>
                <td>{det.Extras?.descripcion || "-"}</td>
                <td>{det.Salsas?.descripcion || "-"}</td>
                <td>C${precioUnit.toFixed(2)}</td>
                <td>C${subtotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="table-light">
            <td colSpan="5" className="text-end fw-bold">Total general:</td>
            <td className="fw-bold">C${pedido.total?.toFixed(2)}</td>
          </tr>
        </tfoot>
      </Table>
    </Container>
  );
};

export default DetallePedidoCliente;