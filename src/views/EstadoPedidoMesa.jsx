import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import { Container, Row, Col, Card, ListGroup, Badge, Button, Spinner, Alert } from "react-bootstrap";

const EstadoPedidoMesa = () => {
  const { idMesa } = useParams();
  const navigate = useNavigate();
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        // Pedido activo (Pendiente o En preparación)
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("Pedido")
          .select(`
            *,
            Clientes (nombre_cliente, apellido_cliente),
            Mesas (nombre_mesa),
            Tipo_pedido (descripcion)
          `)
          .eq("id_mesa", idMesa)
          .in("estado", ["Pendiente", "En preparación"])
          .order("fecha", { ascending: false })
          .limit(1);

        if (pedidoError) throw pedidoError;

        if (pedidoData && pedidoData.length > 0) {
          const pedido = pedidoData[0];
          setPedidoActivo(pedido);
          const { data: detallesData, error: detallesError } = await supabase
            .from("Detalle_pedido")
            .select(`
              *,
              Platillos (nombre_platillo),
              Extras (descripcion, precio)
            `)
            .eq("id_pedido", pedido.id_pedido);
          if (detallesError) throw detallesError;
          setDetalles(detallesData || []);
        } else {
          setPedidoActivo(null);
          setDetalles([]);
        }

        // Historial de pedidos anteriores (Completado/Cancelado)
        const { data: historialData } = await supabase
          .from("Pedido")
          .select(`id_pedido, estado, total, fecha, Clientes (nombre_cliente, apellido_cliente)`)
          .eq("id_mesa", idMesa)
          .in("estado", ["Completado", "Cancelado"])
          .order("fecha", { ascending: false });
        setHistorial(historialData || []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información de la mesa");
      } finally {
        setCargando(false);
      }
    };
    if (idMesa) cargarDatos();
  }, [idMesa]);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Pendiente": return <Badge bg="warning">En espera</Badge>;
      case "En preparación": return <Badge bg="info">En preparación</Badge>;
      case "Completado": return <Badge bg="success">Completado</Badge>;
      case "Cancelado": return <Badge bg="danger">Cancelado</Badge>;
      default: return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const abrirMesa = () => {
    localStorage.setItem("idMesa", idMesa);
    localStorage.setItem("modoPOS", "admin");
    navigate(`/menu/${idMesa}`);
  };

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4" style={{ maxWidth: "800px" }}>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Estado de la Mesa {idMesa}</h2>
            <Button variant="outline-secondary" onClick={() => navigate("/mesas")}>← Volver a mesas</Button>
          </div>
          <hr />
        </Col>
      </Row>

      {!pedidoActivo ? (
        <Card className="text-center p-4">
          <Card.Body>
            <i className="bi bi-cup-straw" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
            <h4 className="mt-3">No hay pedidos activos</h4>
            <p className="text-muted">Esta mesa no tiene ningún pedido pendiente o en preparación.</p>
            <Button variant="primary" onClick={abrirMesa}>
              <i className="bi bi-box-arrow-up-right me-2"></i>Abrir mesa para nuevo pedido
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-dark text-white">
              <div className="d-flex justify-content-between align-items-center">
                <span><i className="bi bi-receipt me-2"></i>Pedido #{pedidoActivo.id_pedido}</span>
                {getEstadoBadge(pedidoActivo.estado)}
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Cliente:</strong> {pedidoActivo.Clientes?.nombre_cliente} {pedidoActivo.Clientes?.apellido_cliente}</p>
                  <p><strong>Mesa:</strong> {pedidoActivo.Mesas?.nombre_mesa || idMesa}</p>
                  <p><strong>Tipo:</strong> {pedidoActivo.Tipo_pedido?.descripcion || "En sitio"}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Fecha:</strong> {new Date(pedidoActivo.fecha).toLocaleString()}</p>
                  <p><strong>Total:</strong> ${pedidoActivo.total?.toFixed(2)}</p>
                </Col>
              </Row>
              <hr />
              <h6>Detalles del pedido</h6>
              <ListGroup variant="flush">
                {detalles.map((det, idx) => (
                  <ListGroup.Item key={idx}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{det.Platillos?.nombre_platillo}</strong> x {det.cantidad}
                        {det.Extras && <small className="d-block text-muted">+ Extra: {det.Extras.descripcion} (${det.Extras.precio})</small>}
                      </div>
                      <div>${(det.precio_unitario * det.cantidad).toFixed(2)}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
            <Card.Footer className="text-muted">
              <i className="bi bi-clock-history me-1"></i> Estado: {pedidoActivo.estado === "Pendiente" ? "En espera de ser preparado" : "En preparación"}
            </Card.Footer>
          </Card>

          {historial.length > 0 && (
            <div>
              <Button variant="link" onClick={() => setMostrarHistorial(!mostrarHistorial)} className="mb-2">
                {mostrarHistorial ? "Ocultar" : "Mostrar"} historial de pedidos anteriores
              </Button>
              {mostrarHistorial && (
                <Card>
                  <Card.Header>Pedidos anteriores</Card.Header>
                  <ListGroup variant="flush">
                    {historial.map(ped => (
                      <ListGroup.Item key={ped.id_pedido} className="d-flex justify-content-between">
                        <span>Pedido #{ped.id_pedido}</span>
                        <span>{getEstadoBadge(ped.estado)}</span>
                        <span>${ped.total?.toFixed(2)}</span>
                        <small>{new Date(ped.fecha).toLocaleDateString()}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default EstadoPedidoMesa;