import React, { useEffect, useState } from "react";
import { supabase } from "../database/supabaseconfig";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import ModalRegistroPedido from "../components/pedidos/ModalRegistroPedido";
import ModalEdicionPedido from "../components/pedidos/ModalEdicionPedido";
import ModalEliminacionPedido from "../components/pedidos/ModalEliminacionPedido";
import TablaPedido from "../components/pedidos/TablaPedido";
import TarjetaPedido from "../components/pedidos/TarjetaPedido";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";
// ── Se han eliminado los imports de VoucherPedido y FacturaPedido ──
// ── NUEVO ──
import ModalNuevoPedido from "../components/pedidos/ModalNuevoPedido";
import CampanaPedidos from "../components/pedidos/CampanaPedidos";
import useNotificacionesPedidos from "../hooks/useNotificacionesPedidos";

const Pedidos = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);

  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // Catálogos
  const [clientes, setClientes] = useState([]);
  const [tiposPedido, setTiposPedido] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [platillos, setPlatillos] = useState([]);
  const [extrasCatalogo, setExtrasCatalogo] = useState([]);

  // Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  // ── Estados de voucher y factura eliminados ──

  const [detallesPedido, setDetallesPedido] = useState([]);

  const [nuevoPedido, setNuevoPedido] = useState({
    id_cliente: "",
    id_tipo: "",
    id_mesa: "",
    estado: "Pendiente",
    total: 0
  });

  const [pedidoEditar, setPedidoEditar] = useState({
    id_pedido: "",
    id_cliente: "",
    id_tipo: "",
    id_mesa: "",
    estado: "",
    total: 0
  });

  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);

  // ── NUEVO: notificaciones en tiempo real ──
  const { pedidosPendientes, descartarPedido } = useNotificacionesPedidos();
  const pedidoEnRevision = pedidosPendientes[0] ?? null;

  // ── NUEVO: aceptar pedido ──
  const handleAceptarPedido = async (pedido) => {
    try {
      const { error } = await supabase
        .from("Pedido")
        .update({ estado: "En preparación" })
        .eq("id_pedido", pedido.id_pedido);

      if (error) throw error;

      descartarPedido(pedido.id_pedido);
      await cargarPedidos();
      setToast({ mostrar: true, mensaje: `Pedido #${pedido.id_pedido} aceptado.`, tipo: "exito" });
    } catch {
      setToast({ mostrar: true, mensaje: "Error al aceptar el pedido.", tipo: "error" });
    }
  };

  // ── NUEVO: rechazar pedido ──
  const handleRechazarPedido = async (pedido) => {
    try {
      await supabase.from("Detalle_pedido").delete().eq("id_pedido", pedido.id_pedido);
      await supabase.from("Pedido").delete().eq("id_pedido", pedido.id_pedido);

      descartarPedido(pedido.id_pedido);
      setToast({ mostrar: true, mensaje: `Pedido #${pedido.id_pedido} rechazado.`, tipo: "error" });
    } catch {
      setToast({ mostrar: true, mensaje: "Error al rechazar el pedido.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargarCatalogos();
    cargarPedidos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [resClientes, resTipos, resMesas, resPlatillos, resExtras] = await Promise.all([
        supabase.from("Clientes").select("id_cliente, nombre_cliente, apellido_cliente"),
        supabase.from("Tipo_pedido").select("id_tipo, descripcion"),
        supabase.from("Mesas").select("id_mesa"),
        supabase.from("Platillos").select("id_platillo, nombre_platillo, precio"),
        supabase.from("Extras").select("id_extra, descripcion, precio")
      ]);

      if (resClientes.data) setClientes(resClientes.data);
      if (resTipos.data) setTiposPedido(resTipos.data);
      if (resMesas.data) setMesas(resMesas.data);
      if (resPlatillos.data) setPlatillos(resPlatillos.data);
      if (resExtras.data) setExtrasCatalogo(resExtras.data);
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Pedido")
        .select(`
          *,
          Clientes ( id_cliente, nombre_cliente, apellido_cliente ),
          Tipo_pedido ( id_tipo, descripcion ),
          Mesas ( id_mesa )
        `)
        .order("fecha", { descending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar pedidos",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // FILTRADO
  useEffect(() => {
    let resultado = pedidos;

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase();
      resultado = resultado.filter((p) =>
        p.Clientes?.nombre_cliente?.toLowerCase().includes(textoLower) ||
        p.Clientes?.apellido_cliente?.toLowerCase().includes(textoLower) ||
        p.estado?.toLowerCase().includes(textoLower) ||
        p.Tipo_pedido?.descripcion?.toLowerCase().includes(textoLower)
      );
    }

    if (estadoFiltro !== "Todos") {
      resultado = resultado.filter((p) => p.estado === estadoFiltro);
    }

    setPedidosFiltrados(resultado);
  }, [textoBusqueda, estadoFiltro, pedidos]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  // PAGINACIÓN
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // ================= CRUD =================
  const manejoCambioInputRegistro = (e) => {
    const { name, value } = e.target;
    setNuevoPedido((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setPedidoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const agregarPedido = async () => {
    try {
      const { data: pedidoData, error } = await supabase
        .from("Pedido")
        .insert([{
          id_cliente: parseInt(nuevoPedido.id_cliente),
          id_tipo: parseInt(nuevoPedido.id_tipo),
          id_mesa: parseInt(nuevoPedido.id_mesa),
          estado: nuevoPedido.estado,
          total: parseFloat(nuevoPedido.total),
          fecha: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      const idPedido = pedidoData[0].id_pedido;

      if (detallesPedido.length > 0) {
        const detalles = detallesPedido.map((d) => ({
          id_pedido: idPedido,
          id_platillo: parseInt(d.id_platillo),
          cantidad: parseInt(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario),
          id_extra: d.id_extra ? parseInt(d.id_extra) : null
        }));

        await supabase.from("Detalle_pedido").insert(detalles);
      }

      setToast({ mostrar: true, mensaje: "Pedido registrado.", tipo: "exito" });
      await cargarPedidos();
      setMostrarModalRegistro(false);
      setDetallesPedido([]);

    } catch {
      setToast({ mostrar: true, mensaje: "Error al registrar pedido.", tipo: "error" });
    }
  };

  const actualizarPedido = async () => {
    try {
      await supabase
        .from("Pedido")
        .update({
          id_cliente: parseInt(pedidoEditar.id_cliente),
          id_tipo: parseInt(pedidoEditar.id_tipo),
          id_mesa: parseInt(pedidoEditar.id_mesa),
          estado: pedidoEditar.estado,
          total: parseFloat(pedidoEditar.total)
        })
        .eq("id_pedido", pedidoEditar.id_pedido);

      setToast({ mostrar: true, mensaje: "Pedido actualizado.", tipo: "exito" });
      await cargarPedidos();
      setMostrarModalEdicion(false);

    } catch {
      setToast({ mostrar: true, mensaje: "Error al actualizar pedido.", tipo: "error" });
    }
  };

  const eliminarPedido = async () => {
    if (!pedidoAEliminar) return;

    setMostrarModalEliminacion(false);

    try {
      await supabase.from("Detalle_pedido").delete().eq("id_pedido", pedidoAEliminar.id_pedido);
      await supabase.from("Pedido").delete().eq("id_pedido", pedidoAEliminar.id_pedido);

      setToast({ mostrar: true, mensaje: "Pedido eliminado.", tipo: "exito" });
      await cargarPedidos();

    } catch {
      setToast({ mostrar: true, mensaje: "Error al eliminar pedido.", tipo: "error" });
    }
  };

  const abrirModalEdicion = (p) => {
    setPedidoEditar(p);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (p) => {
    setPedidoAEliminar(p);
    setMostrarModalEliminacion(true);
  };

  // ─────────────────────────────────────────────────────────────────
  // NUEVAS FUNCIONES DE IMPRESIÓN DIRECTA (reemplazan a los modales)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Obtiene los detalles de un pedido desde Supabase
   */
  const obtenerDetallesPedido = async (idPedido) => {
    const { data: detallesData, error } = await supabase
      .from("Detalle_pedido")
      .select(`
        cantidad, precio_unitario,
        Platillos (nombre_platillo),
        Extras (descripcion),
        Salsas (descripcion)
      `)
      .eq("id_pedido", idPedido);
    if (error) throw error;
    return detallesData || [];
  };

  /**
   * Genera el texto para el VOUCHER de cocina (sin precios)
   */
  const generarTextoVoucher = (pedido, detalles) => {
    const fecha = pedido.fecha
      ? new Date(pedido.fecha).toLocaleString("es-NI")
      : "-";
    const mesa = pedido.Mesas?.id_mesa || "N/A";
    const cliente =
      `${pedido.Clientes?.nombre_cliente || ""} ${pedido.Clientes?.apellido_cliente || ""}`.trim() ||
      "Mostrador";

    let texto = "IT'S COFFEE TIME - COCINA\n";
    texto += "================================\n";
    texto += `Pedido #: ${pedido.id_pedido}\n`;
    texto += `Fecha   : ${fecha}\n`;
    texto += `Mesa    : ${mesa}\n`;
    texto += `Cliente : ${cliente}\n`;
    texto += "================================\n";
    texto += "CANT  PLATILLO              EXTRA        SALSA\n";
    texto += "--------------------------------\n";

    detalles.forEach((det) => {
      const cant = String(det.cantidad).padEnd(4);
      const plat = (det.Platillos?.nombre_platillo || "?").substring(0, 22).padEnd(23);
      const extra = (det.Extras?.descripcion || "-").substring(0, 12).padEnd(12);
      const salsa = (det.Salsas?.descripcion || "-").substring(0, 10).padEnd(10);
      texto += `${cant}${plat}${extra}${salsa}\n`;
    });

    texto += "--------------------------------\n";
    texto += "ENTREGAR A COCINA\n";
    texto += "================================\n";
    return texto;
  };

  /**
   * Genera el texto para la FACTURA (con precios e IVA)
   */
  const generarTextoFactura = (pedido, detalles) => {
  // Calculamos el subtotal sumando los importes de cada línea
  const subtotal = detalles.reduce((acc, det) => {
    return acc + (det.cantidad * det.precio_unitario);
  }, 0);
  
  const iva = subtotal * 0.15;
  const total = subtotal + iva;
  const fecha = pedido.fecha
    ? new Date(pedido.fecha).toLocaleString("es-NI")
    : "-";
  const mesa = pedido.Mesas?.id_mesa || "N/A";
  const cliente =
    `${pedido.Clientes?.nombre_cliente || ""} ${pedido.Clientes?.apellido_cliente || ""}`.trim() ||
    "Mostrador";

  let texto = "IT'S COFFEE TIME - FACTURA\n";
  texto += "================================\n";
  texto += `Pedido N°: ${pedido.id_pedido}\n`;
  texto += `Fecha    : ${fecha}\n`;
  texto += `Mesa     : ${mesa}\n`;
  texto += `Cliente  : ${cliente}\n`;
  texto += "================================\n";
  texto += "CANT  PRODUCTO               P.UNIT  SUBTOT\n";
  texto += "--------------------------------\n";

  detalles.forEach((det) => {
    const cant = String(det.cantidad).padEnd(4);
    const prod = (det.Platillos?.nombre_platillo || "?").substring(0, 22).padEnd(23);
    const punit = `$${det.precio_unitario.toFixed(2)}`.padStart(7);
    const subt = `$${(det.cantidad * det.precio_unitario).toFixed(2)}`.padStart(8);
    texto += `${cant}${prod}${punit} ${subt}\n`;
  });

  texto += "--------------------------------\n";
  texto += `SUBTOTAL:${" ".repeat(20)}$${subtotal.toFixed(2)}\n`;
  texto += `IVA(15%):${" ".repeat(20)}$${iva.toFixed(2)}\n`;
  texto += `TOTAL   :${" ".repeat(20)}$${total.toFixed(2)}\n`;
  texto += "================================\n";
  texto += "Gracias por su visita\n";
  texto += "It's Coffee Time\n";
  return texto;
};

  /* Manejador para imprimir VOUCHER (cocina) */
  const handleImprimirVoucher = async (idPedido) => {
    try {
      const pedido = pedidos.find((p) => p.id_pedido === idPedido);
      if (!pedido) {
        alert("Pedido no encontrado.");
        return;
      }
      const detalles = await obtenerDetallesPedido(idPedido);
      const texto = generarTextoVoucher(pedido, detalles);
      window.location.href = `rawbt:${encodeURIComponent(texto)}`;
    } catch (error) {
      console.error(error);
      alert("Error al generar el voucher.");
    }
  };

  /* Manejador para imprimir FACTURA */
  const handleImprimirFactura = async (idPedido) => {
    try {
      const pedido = pedidos.find((p) => p.id_pedido === idPedido);
      if (!pedido) {
        alert("Pedido no encontrado.");
        return;
      }
      const detalles = await obtenerDetallesPedido(idPedido);
      const texto = generarTextoFactura(pedido, detalles);
      window.location.href = `rawbt:${encodeURIComponent(texto)}`;
    } catch (error) {
      console.error(error);
      alert("Error al generar la factura.");
    }
  };


  return (
    <Container className="mt-4 pt-3">

      {/* HEADER */}
      <Row className="align-items-center mb-3">
        <Col>
          <h3><i className="bi bi-receipt me-2"></i>Pedidos</h3>
        </Col>
        <Col className="text-end d-flex align-items-center justify-content-end gap-3">
          {/* ── NUEVO: campanita ── */}
          <CampanaPedidos
            cantidad={pedidosPendientes.length}
            onClick={() => {}}
          />
          <Button variant="dark" onClick={() => setMostrarModalRegistro(true)}>
            <i className="bi bi-plus-lg me-2"></i>Nuevo Pedido
          </Button>
        </Col>
      </Row>

      <hr />

      {/* SPINNER */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" />
            <p className="mt-2">Cargando pedidos...</p>
          </Col>
        </Row>
      )}

      {/* BUSCADOR + FILTRO */}
      <Row className="mb-4">
        <Col xs={12} md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar pedido..."
          />
        </Col>
        <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
          <select
            className="form-select w-auto d-inline"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En preparación">En preparación</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </Col>
      </Row>

      {/* SIN RESULTADOS */}
      {!cargando && textoBusqueda && pedidosFiltrados.length === 0 && (
        <Alert variant="info">No hay coincidencias</Alert>
      )}

      {/* TARJETAS en móvil / TABLA en desktop */}
      {!cargando && pedidosFiltrados.length > 0 && (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaPedido
              pedidos={pedidosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              onVerVoucher={handleImprimirVoucher}
              onVerFactura={handleImprimirFactura}
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaPedido
              pedidos={pedidosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              onVerVoucher={handleImprimirVoucher}
              onVerFactura={handleImprimirFactura}
            />
          </Col>
        </Row>
      )}

      {/* PAGINACIÓN */}
      <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={pedidosFiltrados.length}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
      />

      {/* MODALES */}
      <ModalRegistroPedido
        mostrarModal={mostrarModalRegistro}
        setMostrarModal={setMostrarModalRegistro}
        nuevoPedido={nuevoPedido}
        manejoCambioInput={manejoCambioInputRegistro}
        agregarPedido={agregarPedido}
        clientes={clientes}
        tiposPedido={tiposPedido}
        mesas={mesas}
        platillos={platillos}
        extras={extrasCatalogo}
        detallesPedido={detallesPedido}
        setDetallesPedido={setDetallesPedido}
        setNuevoPedido={setNuevoPedido}
      />

      <ModalEdicionPedido
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        pedidoEditar={pedidoEditar}
        manejoCambioInput={manejoCambioInputEdicion}
        actualizarPedido={actualizarPedido}
        clientes={clientes}
        tiposPedido={tiposPedido}
        mesas={mesas}
      />

      <ModalEliminacionPedido
        mostrarModal={mostrarModalEliminacion}
        setMostrarModal={setMostrarModalEliminacion}
        pedido={pedidoAEliminar}
        eliminarPedido={eliminarPedido}
      />

      {/* ── NUEVO: modal tiempo real ── */}
      <ModalNuevoPedido
        pedido={pedidoEnRevision}
        onAceptar={handleAceptarPedido}
        onRechazar={handleRechazarPedido}
        onCerrar={() => descartarPedido(pedidoEnRevision?.id_pedido)}
      />

      {/* TOAST */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

    </Container>
  );
};

export default Pedidos;