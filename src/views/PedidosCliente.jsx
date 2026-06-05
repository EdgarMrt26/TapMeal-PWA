import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import DetallesPedidoModal from "../components/pedidosCliente/DetallesPedidoModal";
import TarjetaPedidoCliente from "../components/pedidosCliente/TarjetaPedidoCliente";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";

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

  // Estados de Búsqueda, Filtrado y Paginación
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // ✅ TU LÓGICA ORIGINAL: Obtener id_cliente desde user_metadata
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

  // ✅ TU LÓGICA ORIGINAL: getTipoPago con parámetro para evitar dependencia asíncrona
  const getTipoPago = (idTipoPago, listaTiposPago) => {
    const tipo = listaTiposPago.find(t => Number(t.id_tipo_pago) === Number(idTipoPago));
    return tipo ? tipo.descripcion : "No especificado";
  };

  // ✅ TU LÓGICA ORIGINAL: verDetalles pasando listaTiposPago como argumento
  const verDetalles = async (pedido, listaTiposPago) => {
    const pedidoConTipo = {
      ...pedido,
      tipoPagoNombre: getTipoPago(pedido.id_tipo_pago, listaTiposPago),
    };
    setPedidoSeleccionado(pedidoConTipo);
    await cargarDetalles(pedido.id_pedido);
    setMostrarModal(true);
  };

  // ✅ TU LÓGICA ORIGINAL: formatearFecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleString();
  };

  // ✅ TU LÓGICA ORIGINAL: useEffect con toda tu lógica de autenticación y carga
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

        setTiposPedido(listaTiposPedido);
        setTiposPago(listaTiposPago);

        if (resPedidos.error) throw resPedidos.error;

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

  // Efecto reactivo para filtrar pedidos
  useEffect(() => {
    let resultado = pedidos;

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase();
      resultado = resultado.filter((p) =>
        p.id_pedido?.toString().includes(textoLower) ||
        p.estado?.toLowerCase().includes(textoLower) ||
        p.tipoPagoNombre?.toLowerCase().includes(textoLower) ||
        (p.id_tipo === 1 || p.id_tipo === "1" ? "en línea" : "presencial").includes(textoLower)
      );
    }

    if (estadoFiltro !== "Todos") {
      resultado = resultado.filter((p) => p.estado?.toLowerCase() === estadoFiltro.toLowerCase());
    }

    setPedidosFiltrados(resultado);
    establecerPaginaActual(1);
  }, [textoBusqueda, estadoFiltro, pedidos]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  // PAGINACIÓN
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Cargando tus pedidos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 pt-3">
      {/* HEADER */}
      <Row className="align-items-center mb-3">
        <Col>
          <h2 style={{ fontWeight: 700, color: "#0c0c2c", margin: 0 }}>
            <i className="bi bi-receipt me-2" style={{ color: "#ff6a00" }} /> Mis Pedidos
          </h2>
        </Col>
      </Row>

      <hr />

      {/* BUSCADOR + FILTRO */}
      {pedidos.length > 0 && (
        <Row className="mb-4">
          <Col xs={12} md={6}>
            <CuadroBusquedas
              textoBusqueda={textoBusqueda}
              manejarCambioBusqueda={manejarBusqueda}
              placeholder="Buscar por ID, estado o pago..."
            />
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
            <select
              className="form-select w-auto d-inline"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En preparación">En preparación</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </Col>
        </Row>
      )}

      {/* SIN PEDIDOS TOTALES */}
      {pedidos.length === 0 ? (
        <Alert variant="info">No has realizado ningún pedido aún.</Alert>
      ) : pedidosFiltrados.length === 0 ? (
        <Alert variant="info">No se encontraron pedidos con los filtros aplicados.</Alert>
      ) : (
        <>
          {/* NUEVO DISEÑO: TarjetaPedidoCliente con toda tu lógica */}
          <TarjetaPedidoCliente
            pedidos={pedidosPaginados}
            onVerDetalles={verDetalles}
            tiposPago={tiposPago}
          />

          {/* PAGINACIÓN */}
          <Paginacion
            registrosPorPagina={registrosPorPagina}
            totalRegistros={pedidosFiltrados.length}
            paginaActual={paginaActual}
            establecerPaginaActual={establecerPaginaActual}
            establecerRegistrosPorPagina={establecerRegistrosPorPagina}
          />
        </>
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