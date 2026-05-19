import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import DetallesPedidoModal from "../components/pedidosCliente/DetallesPedidoModal";

const PedidosCliente = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tiposPedido, setTiposPedido] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const navigate = useNavigate();

  // Obtener id_cliente desde user_metadata
  const obtenerIdCliente = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return session.user?.user_metadata?.id_cliente || null;
  };

  const cargarDetalles = async (idPedido) => {
    try {
      const { data, error } = await supabase
        .from("Detalle_pedido")
        .select(`
          cantidad, precio_unitario,
          Platillos (nombre_platillo),
          Extras (descripcion),
          Salsas (descripcion)
        `)
        .eq("id_pedido", idPedido);
      if (error) throw error;
      setDetallesPedido(data || []);
    } catch (err) {
      console.error("Error cargando detalles:", err);
      setDetallesPedido([]);
    }
  };

  // ✅ Recibe tiposPago como argumento para no depender del estado asíncrono
  const getTipoPago = (idTipoPago, listaTiposPago) => {
    const tipo = listaTiposPago.find(t => Number(t.id_tipo_pago) === Number(idTipoPago));
    return tipo ? tipo.descripcion : "No especificado";
  };

  const verDetalles = async (pedido, listaTiposPago) => {
    const pedidoConTipo = {
      ...pedido,
      tipoPagoNombre: getTipoPago(pedido.id_tipo_pago, listaTiposPago),
    };
    setPedidoSeleccionado(pedidoConTipo);
    await cargarDetalles(pedido.id_pedido);
    setMostrarModal(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleString();
  };

  useEffect(() => {
    const inicializar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const rol = session?.user?.user_metadata?.rol;
      if (!session || rol !== 'cliente') {
        navigate('/');
        return;
      }

      const idCliente = session.user?.user_metadata?.id_cliente || null;
      if (!idCliente) {
        setError("No se pudo identificar tu cuenta de cliente. Por favor, cierra sesión y vuelve a ingresar. Si el problema persiste, contacta al administrador.");
        setCargando(false);
        return;
      }

      try {
        // ✅ Cargar Tipo_pedido, Tipo_pago y pedidos en paralelo
        const [resTiposPedido, resTiposPago, resPedidos] = await Promise.all([
          supabase.from("Tipo_pedido").select("id_tipo, descripcion"),
          supabase.from("Tipo_pago").select("id_tipo_pago, descripcion"),
          supabase
            .from("Pedido")
            .select("id_pedido, fecha, estado, total, id_tipo, id_tipo_pago, id_mesa")
            .eq("id_cliente", idCliente)
            .order("fecha", { ascending: false }),
        ]);

        const listaTiposPedido = resTiposPedido.data || [];
        const listaTiposPago = resTiposPago.data || [];

        // ✅ Guardar en estado y también usar directamente para renderizar
        setTiposPedido(listaTiposPedido);
        setTiposPago(listaTiposPago);

        if (resPedidos.error) throw resPedidos.error;

        // ✅ Resolver tipoPagoNombre directamente en cada pedido al cargarlos
        const pedidosConTipo = (resPedidos.data || []).map(p => ({
          ...p,
          tipoPagoNombre: getTipoPago(p.id_tipo_pago, listaTiposPago),
        }));

        setPedidos(pedidosConTipo);
      } catch (err) {
        setError("Error al cargar tus pedidos. Intenta de nuevo.");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    inicializar();
  }, [navigate]);

  if (cargando) return (<Container className="text-center mt-5"><Spinner animation="border" variant="warning" /><p>Cargando tus pedidos...</p></Container>);
  if (error) return (<Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>);

  return (
    <Container className="mt-4">
      <h2 className="mb-4" style={{ fontWeight: 700, color: "#0c0c2c" }}>
        <i className="bi bi-receipt me-2" style={{ color: "#ff6a00" }} /> Mis Pedidos
      </h2>
      {pedidos.length === 0 ? (
        <Alert variant="info">No has realizado ningún pedido aún.</Alert>
      ) : (
        <Row>
          {pedidos.map(pedido => (
            <Col xs={12} key={pedido.id_pedido} className="mb-3">
              <Card className="shadow-sm">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={3}><strong>Pedido #{pedido.id_pedido}</strong><br /><small className="text-muted">{formatearFecha(pedido.fecha)}</small></Col>
                    <Col md={2}>
                      <Badge bg={
                        pedido.estado === "Pendiente" ? "warning" :
                        pedido.estado === "En preparación" ? "info" :
                        pedido.estado === "Completado" ? "success" : "danger"
                      } pill>{pedido.estado}</Badge>
                    </Col>
                    {/* ✅ tipoPagoNombre ya resuelto en el pedido directamente */}
                    <Col md={2}><span className="text-muted">Pago:</span> {pedido.tipoPagoNombre}</Col>
                    <Col md={2}><strong>Total:</strong> C${pedido.total?.toFixed(2)}</Col>
                    <Col md={3} className="text-end">
                      <Button variant="outline-primary" size="sm" onClick={() => verDetalles(pedido, tiposPago)}>
                        <i className="bi bi-eye me-1"></i> Ver detalles
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <DetallesPedidoModal
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        pedido={pedidoSeleccionado}
        detalles={detallesPedido}
      />
    </Container>
  );
};

export default PedidosCliente;