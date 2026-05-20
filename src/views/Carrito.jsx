import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import { useCarrito } from "../components/contexto/CarritoContexto";

const SIN_COMPLEMENTOS = ["frappés", "bebidas", "postres", "licores"];
const CON_SALSAS = ["comidas", "alitas"];

const Carrito = () => {
  const {
    carrito, aumentarCantidad, disminuirCantidad,
    eliminarDelCarrito, actualizarExtra, actualizarSalsa,
    limpiarCarrito, totalCarrito,
  } = useCarrito();

  const [tipoPago, setTipoPago] = useState("Efectivo");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [todosExtras, setTodosExtras] = useState([]);
  const [todasSalsas, setTodasSalsas] = useState([]);
  const [itemExpandido, setItemExpandido] = useState(null);
  // ✅ Leer mesa del localStorage para mostrarla en el resumen
  const [mesaNombre] = useState(() => localStorage.getItem("mesa_nombre") || null);
  const navegar = useNavigate();

  useEffect(() => {
    const cargarComplementos = async () => {
      const [resExtras, resSalsas] = await Promise.all([
        supabase.from("Extras").select("*").order("descripcion"),
        supabase.from("Salsas").select("*").order("descripcion"),
      ]);
      if (resExtras.data) setTodosExtras(resExtras.data);
      if (resSalsas.data) setTodasSalsas(resSalsas.data);
    };
    cargarComplementos();
  }, []);

  const calcularSubtotalItem = (item) => {
    const precioExtra = item.extraSeleccionado ? parseFloat(item.extraSeleccionado.precio || 0) : 0;
    const precioSalsa = item.salsaSeleccionada ? parseFloat(item.salsaSeleccionada.precio || 0) : 0;
    return (parseFloat(item.precio || 0) + precioExtra + precioSalsa) * item.cantidad;
  };

  const procederPago = async () => {
    if (carrito.length === 0) return;
    setError(null);
    setProcesando(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        setError("Debes iniciar sesión para realizar un pedido.");
        setProcesando(false);
        return;
      }

      // Obtener id_cliente desde user_metadata del usuario logueado
      const idCliente = session.user?.user_metadata?.id_cliente || null;

      // ✅ Leer id_mesa guardado en localStorage al escanear el QR
      const idMesa = localStorage.getItem("mesa_actual")
        ? parseInt(localStorage.getItem("mesa_actual"))
        : null;

      // Buscar id_tipo_pago en tabla tipo_pago (minúscula)
      const { data: tipoPagoData } = await supabase
        .from("tipo_pago")
        .select("id_tipo_pago")
        .ilike("descripcion", `%${tipoPago}%`)
        .limit(1);

      const idTipoPago = tipoPagoData?.[0]?.id_tipo_pago || null;

      // Mantener id_tipo de Tipo_pedido — primer registro por defecto
      const { data: tipoPedidoData } = await supabase
        .from("Tipo_pedido")
        .select("id_tipo")
        .limit(1);

      const idTipo = tipoPedidoData?.[0]?.id_tipo || null;

      // Insertar en Pedido con id_mesa e id_tipo_pago
      const { data: pedidoData, error: errorPedido } = await supabase
        .from("Pedido")
        .insert([{
          fecha: new Date().toISOString(),
          id_cliente: idCliente,
          id_tipo: idTipo,
          id_tipo_pago: idTipoPago,
          id_mesa: idMesa,   // ✅ Se asigna la mesa escaneada
          estado: "Pendiente",
          total: parseFloat(totalCarrito.toFixed(2)),
        }])
        .select();

      if (errorPedido) throw errorPedido;

      const idPedido = pedidoData[0].id_pedido;

      // Insertar en Detalle_pedido
      const detalles = carrito.map(item => ({
        id_pedido: idPedido,
        id_platillo: item.id_platillo,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio || 0),
        id_extra: item.extraSeleccionado?.id_extra || null,
        id_salsa: item.salsaSeleccionada?.id_salsa || null,
      }));

      const { error: errorDetalle } = await supabase
        .from("Detalle_pedido")
        .insert(detalles);

      if (errorDetalle) throw errorDetalle;

      // ✅ Limpiar mesa del localStorage después de confirmar el pedido
      localStorage.removeItem("mesa_actual");
      localStorage.removeItem("mesa_nombre");

      limpiarCarrito();
      navegar("/pedidosCliente");

    } catch (err) {
      console.error("Error al procesar pedido:", err);
      setError("Ocurrió un error al registrar tu pedido. Intenta de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  const estiloChipPill = (seleccionado, color) => ({
    padding: "5px 12px", borderRadius: 20, fontSize: "0.78rem",
    cursor: "pointer", fontWeight: 600, transition: "all 0.15s",
    border: `2px solid ${seleccionado ? color : "#e5e7eb"}`,
    background: seleccionado ? `${color}14` : "white",
    color: seleccionado ? color : "#6b7280",
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f5f5",
      fontFamily: "'Segoe UI', sans-serif", padding: "32px 20px",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        <h2 style={{ fontWeight: 800, color: "#0c0c2c", marginBottom: 6 }}>
          <i className="bi bi-cart3 me-2" style={{ color: "#ff6a00" }} />
          Tu Carrito
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: 28 }}>
          Revisa y personaliza tus platillos antes de confirmar
        </p>

        {error && (
          <Alert variant="danger" style={{ borderRadius: 10 }}>
            <i className="bi bi-exclamation-circle me-2" />{error}
          </Alert>
        )}

        {/* Vacío */}
        {carrito.length === 0 ? (
          <div style={{
            background: "white", borderRadius: 16, padding: "60px 24px",
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <i className="bi bi-cart-x" style={{ fontSize: "3.5rem", color: "#d1d5db" }} />
            <p style={{ color: "#9ca3af", marginTop: 16, fontSize: "1rem" }}>Tu carrito está vacío</p>
            <button
              onClick={() => navegar("/menu")}
              style={{
                marginTop: 12, background: "#ff6a00", color: "white",
                border: "none", borderRadius: 10, padding: "10px 24px",
                fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
              }}
            >
              Ver Menú
            </button>
          </div>
        ) : (
          <>
            {/* Lista items */}
            <div style={{
              background: "white", borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden",
            }}>
              {carrito.map((item, i) => {
                const categoriaLower = (item.categoriaNombre || "").toLowerCase();
                const aceptaExtras = !SIN_COMPLEMENTOS.includes(categoriaLower);
                const aceptaSalsas = CON_SALSAS.includes(categoriaLower);
                const expandido = itemExpandido === i;

                return (
                  <div key={i} style={{ borderBottom: i < carrito.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>

                      {/* Imagen */}
                      <div style={{
                        width: 60, height: 60, borderRadius: 10,
                        overflow: "hidden", flexShrink: 0, background: "#f3f4f6",
                      }}>
                        {item.url_imagen ? (
                          <img src={item.url_imagen} alt={item.nombre_platillo}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bi bi-image text-muted" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0c0c2c" }}>
                          {item.nombre_platillo}
                        </div>
                        {item.extraSeleccionado && (
                          <div style={{ fontSize: "0.75rem", color: "#ff6a00" }}>
                            + {item.extraSeleccionado.descripcion}
                          </div>
                        )}
                        {item.salsaSeleccionada && (
                          <div style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                            + {item.salsaSeleccionada.descripcion}
                          </div>
                        )}
                        {(aceptaExtras || aceptaSalsas) && (
                          <button
                            onClick={() => setItemExpandido(expandido ? null : i)}
                            style={{
                              background: "none", border: "none", padding: 0,
                              fontSize: "0.75rem", color: "#6b7280",
                              cursor: "pointer", textDecoration: "underline", marginTop: 2,
                            }}
                          >
                            {expandido ? "Ocultar opciones" : "Cambiar extras / salsas"}
                          </button>
                        )}
                      </div>

                      {/* Cantidad */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => disminuirCantidad(i)}
                          style={{
                            width: 30, height: 30, borderRadius: "50%",
                            border: "2px solid #e5e7eb", background: "white",
                            cursor: "pointer", fontWeight: 700, fontSize: "1rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >−</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => aumentarCantidad(i)}
                          style={{
                            width: 30, height: 30, borderRadius: "50%",
                            border: "2px solid #ff6a00", background: "#ff6a00",
                            cursor: "pointer", fontWeight: 700, fontSize: "1rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white",
                          }}
                        >+</button>
                      </div>

                      {/* Subtotal */}
                      <div style={{ minWidth: 80, textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "#ff6a00", fontSize: "0.92rem" }}>
                          C${calcularSubtotalItem(item).toFixed(2)}
                        </div>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => eliminarDelCarrito(i)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem" }}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>

                    {/* Panel expandible extras/salsas */}
                    {expandido && (
                      <div style={{ padding: "0 20px 16px", background: "#fafafa" }}>

                        {/* Extras */}
                        {aceptaExtras && todosExtras.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#374151", marginBottom: 6 }}>
                              <i className="bi bi-plus-circle me-1" style={{ color: "#ff6a00" }} />
                              Extras
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              <div
                                onClick={() => actualizarExtra(i, null)}
                                style={estiloChipPill(!item.extraSeleccionado, "#ff6a00")}
                              >
                                Ninguno
                              </div>
                              {todosExtras.map(extra => (
                                <div
                                  key={extra.id_extra}
                                  onClick={() => actualizarExtra(i,
                                    item.extraSeleccionado?.id_extra === extra.id_extra ? null : extra
                                  )}
                                  style={estiloChipPill(item.extraSeleccionado?.id_extra === extra.id_extra, "#ff6a00")}
                                >
                                  {extra.descripcion} (+C${parseFloat(extra.precio || 0).toFixed(2)})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Salsas */}
                        {aceptaSalsas && todasSalsas.length > 0 && (
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#374151", marginBottom: 6 }}>
                              <i className="bi bi-droplet me-1" style={{ color: "#ef4444" }} />
                              Salsas
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              <div
                                onClick={() => actualizarSalsa(i, null)}
                                style={estiloChipPill(!item.salsaSeleccionada, "#ef4444")}
                              >
                                Ninguna
                              </div>
                              {todasSalsas.map(salsa => (
                                <div
                                  key={salsa.id_salsa}
                                  onClick={() => actualizarSalsa(i,
                                    item.salsaSeleccionada?.id_salsa === salsa.id_salsa ? null : salsa
                                  )}
                                  style={estiloChipPill(item.salsaSeleccionada?.id_salsa === salsa.id_salsa, "#ef4444")}
                                >
                                  {salsa.descripcion} (+C${parseFloat(salsa.precio || 0).toFixed(2)})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tipo de pago */}
            <div style={{
              background: "white", borderRadius: 16, padding: "20px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
            }}>
              <h5 style={{ fontWeight: 700, color: "#0c0c2c", marginBottom: 16 }}>
                <i className="bi bi-credit-card me-2" style={{ color: "#ff6a00" }} />
                Tipo de pago
              </h5>
              <div style={{ display: "flex", gap: 12 }}>
                {["Efectivo", "Tarjeta"].map(tipo => (
                  <div
                    key={tipo}
                    onClick={() => setTipoPago(tipo)}
                    style={{
                      flex: 1, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                      border: `2px solid ${tipoPago === tipo ? "#ff6a00" : "#e5e7eb"}`,
                      background: tipoPago === tipo ? "rgba(255,106,0,0.05)" : "white",
                      textAlign: "center", transition: "all 0.2s",
                    }}
                  >
                    <i
                      className={`bi ${tipo === "Efectivo" ? "bi-cash" : "bi-credit-card"}`}
                      style={{
                        fontSize: "1.5rem", display: "block", marginBottom: 6,
                        color: tipoPago === tipo ? "#ff6a00" : "#9ca3af",
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: tipoPago === tipo ? "#ff6a00" : "#374151" }}>
                      {tipo}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div style={{
              background: "white", borderRadius: 16, padding: "20px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
            }}>
              <h5 style={{ fontWeight: 700, color: "#0c0c2c", marginBottom: 14 }}>
                <i className="bi bi-receipt me-2" style={{ color: "#ff6a00" }} />
                Resumen
              </h5>
              {/* ✅ Mostrar mesa si fue escaneada */}
              {mesaNombre && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>Mesa</span>
                  <span style={{ fontWeight: 600 }}>{mesaNombre}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>C${totalCarrito.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>Método de pago</span>
                <span style={{ fontWeight: 600 }}>{tipoPago}</span>
              </div>
              <hr style={{ margin: "14px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, fontSize: "1rem" }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#ff6a00" }}>
                  C${totalCarrito.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón pago */}
            <button
              onClick={procederPago}
              disabled={procesando}
              style={{
                width: "100%", padding: "15px",
                background: procesando ? "#9ca3af" : "#ff6a00",
                color: "white", border: "none", borderRadius: 14,
                fontWeight: 800, fontSize: "1rem",
                cursor: procesando ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(255,106,0,0.35)",
              }}
            >
              {procesando
                ? <><i className="bi bi-hourglass-split me-2" />Procesando...</>
                : <><i className="bi bi-check-circle me-2" />Proceder al Pago — C${totalCarrito.toFixed(2)}</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Carrito;