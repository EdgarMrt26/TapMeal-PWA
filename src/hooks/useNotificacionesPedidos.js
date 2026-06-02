import { useEffect, useState, useCallback } from "react";
import { supabase } from "../database/supabaseconfig";

/**
 * Escucha en tiempo real los pedidos nuevos con estado "Pendiente"
 * e hidrata cada uno con cliente, mesa, tipo y detalles.
 */
const useNotificacionesPedidos = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [conectado, setConectado] = useState(false);

  console.log("🟢 Hook useNotificacionesPedidos inicializado");

  const hidratarPedido = useCallback(async (pedidoBase) => {
    console.log(`🔄 Hidratando pedido ID: ${pedidoBase.id_pedido}`);
    try {
      // Traemos relaciones del pedido
      const { data: pedidoData, error: errorPedido } = await supabase
        .from("Pedido")
        .select(`
          *,
          Clientes ( id_cliente, nombre_cliente, apellido_cliente ),
          Tipo_pedido ( id_tipo, descripcion ),
          Mesas ( id_mesa )
        `)
        .eq("id_pedido", pedidoBase.id_pedido)
        .single();

      if (errorPedido) {
        console.error(`❌ Error al hidratar pedido ${pedidoBase.id_pedido}:`, errorPedido);
        return null;
      }
      console.log(`✅ Pedido ${pedidoBase.id_pedido} hidratado correctamente (relaciones)`);

      // Traemos detalles con platillo, extra y salsa
      const { data: detallesData, error: errorDetalles } = await supabase
        .from("Detalle_pedido")
        .select(`
          cantidad, 
          precio_unitario,
          Platillos ( nombre_platillo ),
          Extras ( descripcion ),
          Salsas ( descripcion )
        `)
        .eq("id_pedido", pedidoBase.id_pedido);

      if (errorDetalles) {
        console.error(`❌ Error al hidratar detalles del pedido ${pedidoBase.id_pedido}:`, errorDetalles);
      } else {
        console.log(`✅ Detalles del pedido ${pedidoBase.id_pedido}: ${detallesData?.length || 0} items`);
      }

      return { ...pedidoData, detalles: detallesData || [] };
    } catch (err) {
      console.error(`❌ Error crítico en hidratarPedido ${pedidoBase.id_pedido}:`, err);
      return null;
    }
  }, []);

  // Cargar pedidos pendientes existentes al inicio
  const cargarPendientesExistentes = useCallback(async () => {
    console.log("📋 Cargando pedidos pendientes existentes desde Supabase...");
    try {
      const { data, error } = await supabase
        .from("Pedido")
        .select(`
          *,
          Clientes ( id_cliente, nombre_cliente, apellido_cliente ),
          Tipo_pedido ( id_tipo, descripcion ),
          Mesas ( id_mesa )
        `)
        .eq("estado", "Pendiente")
        .order("fecha", { ascending: false });

      if (error) {
        console.error("❌ Error cargando pendientes existentes:", error);
        return;
      }

      console.log(`📋 Se encontraron ${data?.length || 0} pedidos pendientes existentes`);

      // También cargar detalles para cada pedido
      const pedidosConDetalles = await Promise.all(
        (data || []).map(async (pedido) => {
          const { data: detalles } = await supabase
            .from("Detalle_pedido")
            .select(`
              cantidad, 
              precio_unitario,
              Platillos ( nombre_platillo ),
              Extras ( descripcion ),
              Salsas ( descripcion )
            `)
            .eq("id_pedido", pedido.id_pedido);
          return { ...pedido, detalles: detalles || [] };
        })
      );

      setPedidosPendientes(pedidosConDetalles);
      console.log(`✅ Lista de pendientes actualizada con ${pedidosConDetalles.length} pedidos`);
    } catch (err) {
      console.error("❌ Error en cargarPendientesExistentes:", err);
    }
  }, []);

  useEffect(() => {
    let canal = null;

    const setupRealtime = async () => {
      console.log("🔄 Configurando canal Realtime para Pedidos...");
      console.log("🔍 Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log("🔍 Tabla objetivo: Pedido");

      canal = supabase
        .channel("pedidos-nuevos")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Pedido",
          },
          async (payload) => {
            console.log("🔔🔔🔔 EVENTO INSERT RECIBIDO 🔔🔔🔔");
            console.log("Payload completo:", JSON.stringify(payload, null, 2));
            console.log("Nuevo pedido insertado:", payload.new);
            console.log("Estado del nuevo pedido:", payload.new.estado);
            
            // Filtramos manualmente por estado Pendiente
            if (payload.new.estado !== "Pendiente") {
              console.log(`⏭️ Pedido ${payload.new.id_pedido} no es Pendiente (es: "${payload.new.estado}"), ignorando`);
              return;
            }
            
            console.log(`✅ Pedido PENDIENTE detectado, ID: ${payload.new.id_pedido}`);
            const pedidoCompleto = await hidratarPedido(payload.new);
            
            if (pedidoCompleto) {
              console.log(`📦 Pedido completo hidratado para ID ${payload.new.id_pedido}:`, pedidoCompleto);
              setPedidosPendientes((prev) => {
                // Evitar duplicados
                if (prev.some(p => p.id_pedido === pedidoCompleto.id_pedido)) {
                  console.log(`⚠️ Pedido ${pedidoCompleto.id_pedido} ya existe en la lista, ignorando duplicado`);
                  return prev;
                }
                console.log(`➕ Agregando pedido ${pedidoCompleto.id_pedido} a la lista. Total antes: ${prev.length}, después: ${prev.length + 1}`);
                return [pedidoCompleto, ...prev];
              });
            } else {
              console.error(`❌ No se pudo hidratar el pedido ${payload.new.id_pedido}`);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "Pedido",
          },
          async (payload) => {
            console.log("🔄🔔 EVENTO UPDATE RECIBIDO 🔔🔄");
            console.log("Payload UPDATE:", payload);
            console.log("Estado ANTES:", payload.old.estado);
            console.log("Estado DESPUÉS:", payload.new.estado);
            
            // Si el estado cambió de Pendiente a otro, lo removemos de la lista
            if (payload.old.estado === "Pendiente" && payload.new.estado !== "Pendiente") {
              console.log(`✅ Pedido ${payload.new.id_pedido} ya no está Pendiente (ahora: ${payload.new.estado}), removiendo de lista`);
              setPedidosPendientes((prev) => {
                const nuevaLista = prev.filter(p => p.id_pedido !== payload.new.id_pedido);
                console.log(`Lista actualizada: antes ${prev.length}, después ${nuevaLista.length}`);
                return nuevaLista;
              });
            }
            
            // Si el estado cambió a Pendiente (por algún motivo), lo agregamos
            if (payload.old.estado !== "Pendiente" && payload.new.estado === "Pendiente") {
              console.log(`✅ Pedido ${payload.new.id_pedido} cambió a Pendiente, agregando a lista`);
              const pedidoCompleto = await hidratarPedido(payload.new);
              if (pedidoCompleto) {
                setPedidosPendientes((prev) => {
                  if (prev.some(p => p.id_pedido === pedidoCompleto.id_pedido)) {
                    console.log(`⚠️ Pedido ${pedidoCompleto.id_pedido} ya existe, no se agrega duplicado`);
                    return prev;
                  }
                  console.log(`➕ Agregando pedido ${pedidoCompleto.id_pedido} a la lista`);
                  return [pedidoCompleto, ...prev];
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("📡 Estado del canal Realtime:", status);
          console.log("🔍 Status code:", status);
          
          if (status === "SUBSCRIBED") {
            console.log("✅✅✅ Canal Realtime SUSCRIBIDO correctamente ✅✅✅");
            setConectado(true);
            // Una vez conectado, cargamos los pendientes existentes
            cargarPendientesExistentes();
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌❌❌ Error en el canal Realtime ❌❌❌");
            setConectado(false);
          } else if (status === "TIMED_OUT") {
            console.warn("⚠️ Timeout en el canal Realtime");
            setConectado(false);
          } else if (status === "CLOSED") {
            console.log("🔌 Canal Realtime cerrado");
            setConectado(false);
          }
        });
    };

    setupRealtime();

    return () => {
      if (canal) {
        console.log("🔌 Desconectando canal Realtime...");
        supabase.removeChannel(canal);
        console.log("🔌 Canal Realtime desconectado");
      }
    };
  }, [hidratarPedido, cargarPendientesExistentes]);

  const descartarPedido = useCallback((idPedido) => {
    console.log(`🗑️ Descartando pedido ${idPedido} de la lista de notificaciones`);
    setPedidosPendientes((prev) => {
      const nuevaLista = prev.filter((p) => p.id_pedido !== idPedido);
      console.log(`Lista de pendientes: antes ${prev.length}, después ${nuevaLista.length}`);
      return nuevaLista;
    });
  }, []);

  const actualizarPedidoEnLista = useCallback((idPedido, nuevosDatos) => {
    console.log(`✏️ Actualizando pedido ${idPedido} en lista local`);
    setPedidosPendientes((prev) =>
      prev.map((p) =>
        p.id_pedido === idPedido ? { ...p, ...nuevosDatos } : p
      )
    );
  }, []);

  // Log del estado actual de pedidos pendientes
  useEffect(() => {
    console.log(`📊 Estado actual - Conectado: ${conectado}, Pedidos pendientes: ${pedidosPendientes.length}`);
    if (pedidosPendientes.length > 0) {
      console.log("📋 IDs de pedidos pendientes:", pedidosPendientes.map(p => p.id_pedido));
    }
  }, [conectado, pedidosPendientes]);

  return { 
    pedidosPendientes, 
    descartarPedido, 
    actualizarPedidoEnLista,
    conectado,
    cantidad: pedidosPendientes.length 
  };
};

export default useNotificacionesPedidos;