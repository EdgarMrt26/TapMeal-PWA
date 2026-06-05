import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";

const TarjetaMesaPOS = ({ mesa }) => {
  const navigate = useNavigate();
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [completando, setCompletando] = useState(false);

  const cargarPedidoActivo = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Pedido")
        .select("id_pedido, estado, total")
        .eq("id_mesa", mesa.id_mesa)
        .in("estado", ["Pendiente", "En preparación"])
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle(); // retorna null si no hay

      if (error) throw error;
      setPedidoActivo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidoActivo();

    // Suscripción en tiempo real a cambios en Pedido de esta mesa
    const subscription = supabase
      .channel(`pedidos-mesa-${mesa.id_mesa}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Pedido",
          filter: `id_mesa=eq.${mesa.id_mesa}`,
        },
        () => cargarPedidoActivo()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [mesa.id_mesa]);

  const completarPedido = async () => {
    if (!pedidoActivo) return;
    setCompletando(true);
    try {
      // 1. Cambiar estado del pedido a Completado
      const { error: errorPedido } = await supabase
        .from("Pedido")
        .update({ estado: "Completado" })
        .eq("id_pedido", pedidoActivo.id_pedido);
      if (errorPedido) throw errorPedido;

      // 2. Liberar la mesa (por si el trigger no está activo)
      await supabase
        .from("Mesas")
        .update({ estado: "Disponible" })
        .eq("id_mesa", mesa.id_mesa);

      // Recargar datos
      await cargarPedidoActivo();
    } catch (err) {
      console.error(err);
      alert("Error al completar el pedido");
    } finally {
      setCompletando(false);
    }
  };

  const abrirMesa = () => {
    localStorage.setItem("idMesa", mesa.id_mesa);
    localStorage.setItem("nombreMesa", mesa.nombre_mesa);
    localStorage.setItem("modoPOS", "admin");
    navigate(`/menu/${mesa.id_mesa}`);
  };

  const verEstadoPedido = () => {
    navigate(`/estado-mesa/${mesa.id_mesa}`);
  };

  const estadoActual = pedidoActivo ? "Ocupada" : "Disponible";
  const badgeColor = pedidoActivo ? "danger" : "success";
  const iconoColor = pedidoActivo ? "bi-x-circle-fill text-danger" : "bi-qr-code-scan text-success";

  return (
    <Card className="shadow-sm border-0 h-100 text-center" style={{ borderRadius: "20px" }}>
      <Card.Body className="p-4">
        <div className="mb-3">
          <i className={`bi ${iconoColor}`} style={{ fontSize: "5rem" }} />
        </div>
        <h2 className="fw-bold">{mesa.nombre_mesa}</h2>
        <p className="text-muted mb-3">Mesa #{mesa.id_mesa}</p>
        <Badge bg={badgeColor} className="px-3 py-2 mb-4">
          {estadoActual}
        </Badge>

        {cargando ? (
          <Spinner animation="border" size="sm" />
        ) : pedidoActivo ? (
          <>
            <div className="bg-light p-2 rounded mb-3">
              <small>Pedido #{pedidoActivo.id_pedido}</small>
              <br />
              <strong>Total: C${pedidoActivo.total?.toFixed(2)}</strong>
            </div>
            <div className="d-grid gap-2 mb-2">
              <Button
                variant="success"
                onClick={completarPedido}
                disabled={completando}
              >
                {completando ? "Completando..." : "✓ Completar pedido"}
              </Button>
            </div>
          </>
        ) : (
          <div className="d-grid gap-2">
            <Button variant="dark" onClick={abrirMesa}>
              <i className="bi bi-box-arrow-up-right me-2"></i>Abrir Mesa
            </Button>
          </div>
        )}

        <div className="d-grid gap-2 mt-2">
          <Button variant="outline-dark" onClick={verEstadoPedido}>
            <i className="bi bi-receipt me-2"></i>
            {pedidoActivo ? "Ver detalle del pedido" : "Ver historial"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TarjetaMesaPOS;