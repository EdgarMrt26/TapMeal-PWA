import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

const ModalDetallesPedidoAdm = ({ show, onHide, pedido }) => {
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (show && pedido?.id_pedido) {
      cargarDetalles(pedido.id_pedido);
    }
  }, [show, pedido]);

  const cargarDetalles = async (idPedido) => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("Detalle_pedido")
        .select(`
          cantidad,
          precio_unitario,
          Platillos ( nombre_platillo ),
          Extras ( descripcion ),
          Salsas ( descripcion )
        `)
        .eq("id_pedido", idPedido);

      if (error) throw error;
      setDetalles(data || []);
    } catch (err) {
      console.error("Error cargando detalles:", err);
      setDetalles([]);
    } finally {
      setCargando(false);
    }
  };

  if (!pedido) return null;

  const totalGeneral = detalles.reduce(
    (acc, d) => acc + (d.precio_unitario || 0) * d.cantidad,
    0
  );

  const cliente = pedido.Clientes
    ? `${pedido.Clientes.nombre_cliente} ${pedido.Clientes.apellido_cliente || ""}`.trim()
    : "Mostrador";

  const getBadgeEstado = (estado) => {
    if (estado === "Completado")   return { bg: "#10b981", icon: "bi-check-circle-fill" };
    if (estado === "Cancelado")    return { bg: "#ef4444", icon: "bi-x-circle-fill" };
    if (estado === "En preparación" || estado === "En preparacion")
                                   return { bg: "#3b82f6", icon: "bi-arrow-repeat" };
    return                                { bg: "#f59e0b", icon: "bi-clock-history" };
  };

  const badge = getBadgeEstado(pedido.estado);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>

      {/* ── HEADER ── */}
      <Modal.Header
        closeButton
        style={{
          background: "#0c0c2c",
          border: "none",
          borderRadius: "12px 12px 0 0",
          padding: "18px 24px",
        }}
      >
        <Modal.Title className="fw-bold text-white d-flex align-items-center gap-2">
          <i className="bi bi-receipt fs-5"></i>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700 }}>
              Pedido #{pedido.id_pedido}
            </div>
            <div style={{ fontSize: "0.72rem", opacity: 0.6, fontWeight: 400 }}>
              {pedido.fecha
                ? new Date(pedido.fecha).toLocaleString("es-NI")
                : "Sin fecha"}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      {/* ── BODY ── */}
      <Modal.Body style={{ background: "#f8fafc", padding: "22px" }}>

        {/* Chips de info */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {[
            { label: "Cliente",  value: cliente,                              icon: "bi-person-fill",  tint: "#eff6ff", color: "#0c0c2c" },
            { label: "Mesa",     value: pedido.Mesas?.id_mesa ? `Mesa ${pedido.Mesas.id_mesa}` : "N/A", icon: "bi-grid-fill", tint: "#f0fdf4", color: "#16a34a" },
            { label: "Tipo",     value: pedido.Tipo_pedido?.descripcion || "N/A", icon: "bi-tag-fill", tint: "#fdf4ff", color: "#a855f7" },
            { label: "Estado",   value: pedido.estado,                        icon: badge.icon,        tint: `${badge.bg}18`, color: badge.bg },
          ].map(({ label, value, icon, tint, color }) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: "1 1 140px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  background: tint,
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={`bi ${icon}`} style={{ color, fontSize: "0.9rem" }}></i>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.83rem", fontWeight: 700, color: label === "Estado" ? color : "#1e293b" }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Título sección */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{ width: "4px", height: "20px", background: "#0c0c2c", borderRadius: "4px" }} />
          <h6 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Platillos ordenados</h6>
          {detalles.length > 0 && (
            <span
              style={{
                background: "#0c0c2c",
                color: "#fff",
                borderRadius: "20px",
                padding: "1px 10px",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              {detalles.length}
            </span>
          )}
        </div>

        {/* Platillos */}
        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" style={{ color: "#0c0c2c" }} />
            <div className="mt-2 text-muted small">Cargando platillos...</div>
          </div>
        ) : detalles.length === 0 ? (
          <div
            className="text-center py-5"
            style={{ background: "#fff", borderRadius: "14px", border: "2px dashed #e2e8f0" }}
          >
            <i className="bi bi-basket2 fs-2 text-muted d-block mb-2"></i>
            <span className="text-muted small">No hay platillos registrados</span>
          </div>
        ) : (
          <>
            <div className="d-flex flex-column gap-2">
              {detalles.map((det, idx) => {
                const precioUnit = det.precio_unitario || 0;
                const subtotal   = precioUnit * det.cantidad;
                return (
                  <div
                    key={idx}
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      borderLeft: "4px solid #0c0c2c",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    {/* Info platillo */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                        {det.Platillos?.nombre_platillo || "N/A"}
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: "6px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                          <i className="bi bi-hash me-1"></i>{det.cantidad} und.
                        </span>
                        <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "6px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                          C${precioUnit.toFixed(2)} c/u
                        </span>
                        {det.Extras?.descripcion && (
                          <span style={{ background: "#fdf4ff", color: "#a855f7", borderRadius: "6px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                            <i className="bi bi-plus-circle me-1"></i>{det.Extras.descripcion}
                          </span>
                        )}
                        {det.Salsas?.descripcion && (
                          <span style={{ background: "#fff7ed", color: "#ea580c", borderRadius: "6px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                            <i className="bi bi-droplet-fill me-1"></i>{det.Salsas.descripcion}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Subtotal</div>
                      <div style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981" }}>
                        C${subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total general */}
            <div
              style={{
                marginTop: "14px",
                background: "#0c0c2c",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-wallet2 text-white"></i>
                <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.88rem" }}>
                  Total general
                </span>
              </div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>
                C${totalGeneral.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </Modal.Body>

      {/* ── FOOTER ── */}
      <Modal.Footer style={{ background: "#f8fafc", border: "none", borderRadius: "0 0 12px 12px" }}>
        <button
          onClick={onHide}
          style={{
            background: "#0c0c2c",
            color: "#fff",
            border: "none",
            borderRadius: "9px",
            padding: "8px 24px",
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: "pointer",
          }}
        >
          <i className="bi bi-x-lg me-2"></i>Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalDetallesPedidoAdm;