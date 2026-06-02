import { useEffect, useState, useCallback } from "react";
import { supabase } from "../database/supabaseconfig";

const useNotificacionesPedidos = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [pedidosEsperandoDetalles, setPedidosEsperandoDetalles] = useState(new Map());

  console.log("🟢 Hook useNotificacionesPedidos inicializado");

  const hidratarPedido = useCallback(async (pedidoBase) => {
    console.log(`🔄 Hidratando pedido ID: ${pedidoBase.id_pedido}`);
    try {
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
        console.error(`❌ Error al hidratar pedido:`, errorPedido);
        return null;
      }

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
        console.error(`❌ Error al obtener detalles:`, errorDetalles);
      }

      if (detallesData && detallesData.length > 0) {
        console.log(`✅ Pedido ${pedidoBase.id_pedido} tiene ${detallesData.length} detalles`);
        detallesData.forEach((det, idx) => {
          console.log(`  📝 ${det.cantidad}x ${det.Platillos?.nombre_platillo} - C$${det.precio_unitario}`);
        });
      } else {
        console.log(`⏳ Pedido ${pedidoBase.id_pedido} aún sin detalles`);
      }

      return { ...pedidoData, detalles: detallesData || [] };
    } catch (err) {
      console.error(`❌ Error crítico:`, err);
      return null;
    }
  }, []);

  const agregarPedidoALista = useCallback((pedidoCompleto) => {
    setPedidosPendientes((prev) => {
      if (prev.some(p => p.id_pedido === pedidoCompleto.id_pedido)) {
        console.log(`⚠️ Pedido ${pedidoCompleto.id_pedido} ya existe, ignorando`);
        return prev;
      }
      console.log(`➕ Agregando pedido ${pedidoCompleto.id_pedido} a la lista`);
      return [pedidoCompleto, ...prev];
    });
  }, []);

  const cargarPendientesExistentes = useCallback(async () => {
    console.log("📋 Cargando pedidos pendientes existentes...");
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

      if (error) throw error;

      const pedidosConDetalles = await Promise.all(
        (data || []).map(async (pedido) => {
          const { data: detalles } = await supabase
            .from("Detalle_pedido")
            .select(`
              cantidad, precio_unitario,
              Platillos ( nombre_platillo ),
              Extras ( descripcion ),
              Salsas ( descripcion )
            `)
            .eq("id_pedido", pedido.id_pedido);
          return { ...pedido, detalles: detalles || [] };
        })
      );

      setPedidosPendientes(pedidosConDetalles);
      console.log(`✅ Cargados ${pedidosConDetalles.length} pedidos pendientes`);
    } catch (err) {
      console.error("❌ Error cargando pendientes:", err);
    }
  }, []);

  useEffect(() => {
    let canalPedidos = null;
    let canalDetalles = null;

    const setupRealtime = async () => {
      console.log("🔄 Configurando canales Realtime...");

      // Canal para Pedidos (INSERT)
      canalPedidos = supabase
        .channel("pedidos-insert")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Pedido",
          },
          async (payload) => {
            console.log("🔔 NUEVO PEDIDO RECIBIDO:", payload.new.id_pedido, "Estado:", payload.new.estado);
            
            if (payload.new.estado !== "Pendiente") {
              console.log(`⏭️ Pedido no es Pendiente, ignorando`);
              return;
            }

            // Intentar obtener el pedido con sus detalles
            const pedidoCompleto = await hidratarPedido(payload.new);
            
            if (pedidoCompleto && pedidoCompleto.detalles.length > 0) {
              // Ya tiene detalles, agregar directamente
              agregarPedidoALista(pedidoCompleto);
            } else if (pedidoCompleto) {
              // No tiene detalles aún, guardar para esperar
              console.log(`⏳ Pedido ${payload.new.id_pedido} esperando detalles...`);
              setPedidosEsperandoDetalles(prev => {
                const newMap = new Map(prev);
                newMap.set(payload.new.id_pedido, pedidoCompleto);
                return newMap;
              });
            }
          }
        )
        .subscribe((status) => {
          console.log("📡 Canal Pedidos status:", status);
          if (status === "SUBSCRIBED") setConectado(true);
        });

      // Canal para Detalle_pedido (INSERT)
      canalDetalles = supabase
        .channel("detalles-insert")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Detalle_pedido",
          },
          async (payload) => {
            console.log(`🔔 NUEVO DETALLE para pedido ID: ${payload.new.id_pedido}`);
            
            // Verificar si tenemos ese pedido esperando
            setPedidosEsperandoDetalles(prev => {
              const newMap = new Map(prev);
              const pedidoPendiente = newMap.get(payload.new.id_pedido);
              
              if (pedidoPendiente) {
                console.log(`✅ Pedido ${payload.new.id_pedido} ya tiene detalles, verificando si ya están todos...`);
                
                // Recargar el pedido completo nuevamente
                setTimeout(async () => {
                  const pedidoCompleto = await hidratarPedido({ id_pedido: payload.new.id_pedido });
                  if (pedidoCompleto && pedidoCompleto.detalles.length > 0) {
                    console.log(`✅ Pedido ${payload.new.id_pedido} ahora tiene ${pedidoCompleto.detalles.length} detalles, agregando a lista`);
                    agregarPedidoALista(pedidoCompleto);
                    // Remover de espera
                    setPedidosEsperandoDetalles(prevMap => {
                      const newMap2 = new Map(prevMap);
                      newMap2.delete(payload.new.id_pedido);
                      return newMap2;
                    });
                  }
                }, 500);
              }
              
              return newMap;
            });
          }
        )
        .subscribe((status) => {
          console.log("📡 Canal Detalles status:", status);
        });

      cargarPendientesExistentes();
    };

    setupRealtime();

    return () => {
      if (canalPedidos) supabase.removeChannel(canalPedidos);
      if (canalDetalles) supabase.removeChannel(canalDetalles);
      console.log("🔌 Canales desconectados");
    };
  }, [hidratarPedido, agregarPedidoALista, cargarPendientesExistentes]);

  const descartarPedido = useCallback((idPedido) => {
    console.log(`🗑️ Descartando pedido ${idPedido}`);
    setPedidosPendientes(prev => prev.filter(p => p.id_pedido !== idPedido));
    setPedidosEsperandoDetalles(prev => {
      const newMap = new Map(prev);
      newMap.delete(idPedido);
      return newMap;
    });
  }, []);

  const actualizarPedidoEnLista = useCallback((idPedido, nuevosDatos) => {
    setPedidosPendientes(prev =>
      prev.map(p => p.id_pedido === idPedido ? { ...p, ...nuevosDatos } : p)
    );
  }, []);

  useEffect(() => {
    console.log(`📊 Estado: Conectado=${conectado}, Pendientes=${pedidosPendientes.length}, Esperando=${pedidosEsperandoDetalles.size}`);
  }, [conectado, pedidosPendientes.length, pedidosEsperandoDetalles.size]);

  return { 
    pedidosPendientes, 
    descartarPedido, 
    actualizarPedidoEnLista,
    conectado,
    cantidad: pedidosPendientes.length 
  };
};

export default useNotificacionesPedidos;