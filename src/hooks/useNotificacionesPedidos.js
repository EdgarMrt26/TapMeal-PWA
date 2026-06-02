import { useEffect, useState, useCallback } from "react";
import { supabase } from "../database/supabaseconfig";

/**
 * Escucha en tiempo real los pedidos nuevos con estado "Pendiente"
 * e hidrata cada uno con cliente, mesa, tipo y detalles.
 */
const useNotificacionesPedidos = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);

  const hidratarPedido = useCallback(async (pedidoBase) => {
    // Traemos relaciones del pedido
    const { data } = await supabase
      .from("Pedido")
      .select(`
        *,
        Clientes ( id_cliente, nombre_cliente, apellido_cliente ),
        Tipo_pedido ( id_tipo, descripcion ),
        Mesas ( id_mesa )
      `)
      .eq("id_pedido", pedidoBase.id_pedido)
      .single();

    // Traemos detalles con platillo, extra y salsa
    const { data: detalles } = await supabase
      .from("Detalle_pedido")
      .select(`
        cantidad, precio_unitario,
        Platillos ( nombre_platillo ),
        Extras ( descripcion ),
        Salsas ( descripcion )
      `)
      .eq("id_pedido", pedidoBase.id_pedido);

    return { ...data, detalles: detalles || [] };
  }, []);

  useEffect(() => {
    // Solo escuchamos inserts con estado Pendiente
    const canal = supabase
      .channel("pedidos-nuevos")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Pedido",
          filter: "estado=eq.Pendiente",
        },
        async (payload) => {
          const pedidoCompleto = await hidratarPedido(payload.new);
          setPedidosPendientes((prev) => [...prev, pedidoCompleto]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [hidratarPedido]);

  const descartarPedido = useCallback((idPedido) => {
    setPedidosPendientes((prev) =>
      prev.filter((p) => p.id_pedido !== idPedido)
    );
  }, []);

  return { pedidosPendientes, descartarPedido };
};

export default useNotificacionesPedidos;