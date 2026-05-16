import React, { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaExtra from "../components/extras/TablaExtra";
import TarjetaExtra from "../components/extras/TarjetaExtra";
import ModalRegistroExtra from "../components/extras/ModalRegistroExtra";
import ModalEdicionExtra from "../components/extras/ModalEdicionExtra";
import ModalEliminacionExtra from "../components/extras/ModalEliminacionExtra";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";

const Extras = () => {

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [extras, setExtras] = useState([]);
  const [cargando, setCargando] = useState(true);

  // BÚSQUEDA
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [extrasFiltrados, setExtrasFiltrados] = useState([]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setExtrasFiltrados(extras);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = extras.filter((extra) =>
        extra.descripcion?.toLowerCase().includes(textoLower) ||
        extra.precio?.toString().includes(textoLower)
      );
      setExtrasFiltrados(filtrados);
    }
  }, [textoBusqueda, extras]);

  // PAGINACIÓN
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const extrasPaginados = extrasFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // MODALES
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoExtra, setNuevoExtra] = useState({ descripcion: "", precio: "" });
  const [extraEditar, setExtraEditar] = useState({ id_extra: "", descripcion: "", precio: "" });
  const [extraAEliminar, setExtraAEliminar] = useState(null);

  // CARGA
  useEffect(() => {
    cargarExtras();
  }, []);

  const cargarExtras = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Extras")
        .select("*")
        .order("id_extra", { ascending: true });

      if (error) throw error;
      setExtras(data || []);
    } catch (err) {
      console.error("Excepción al cargar extras:", err.message);
      setToast({ mostrar: true, mensaje: "Error inesperado al cargar extras", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  // CRUD
  const manejoCambioInputRegistro = (e) => {
    const { name, value } = e.target;
    setNuevoExtra((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setExtraEditar((prev) => ({ ...prev, [name]: value }));
  };

  const agregarExtra = async () => {
    try {
      const { error } = await supabase.from("Extras").insert([{
        descripcion: nuevoExtra.descripcion,
        precio: parseFloat(nuevoExtra.precio)
      }]);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Extra registrado exitosamente.", tipo: "exito" });
      await cargarExtras();
      setNuevoExtra({ descripcion: "", precio: "" });
      setMostrarModalRegistro(false);
    } catch {
      setToast({ mostrar: true, mensaje: "Error al registrar extra.", tipo: "error" });
    }
  };

  const actualizarExtra = async () => {
    try {
      const { error } = await supabase
        .from("Extras")
        .update({ descripcion: extraEditar.descripcion, precio: parseFloat(extraEditar.precio) })
        .eq("id_extra", extraEditar.id_extra);
      if (error) throw error;
      await cargarExtras();
      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Extra actualizado exitosamente.", tipo: "exito" });
    } catch {
      setToast({ mostrar: true, mensaje: "Error al actualizar extra.", tipo: "error" });
    }
  };

  const eliminarExtra = async () => {
    if (!extraAEliminar) return;
    setMostrarModalEliminacion(false);
    try {
      const { error } = await supabase
        .from("Extras")
        .delete()
        .eq("id_extra", extraAEliminar.id_extra);
      if (error) throw error;
      await cargarExtras();
      setToast({ mostrar: true, mensaje: "Extra eliminado exitosamente.", tipo: "exito" });
    } catch {
      setToast({ mostrar: true, mensaje: "Error al eliminar extra.", tipo: "error" });
    }
  };

  const abrirModalEdicion = (extra) => {
    setExtraEditar(extra);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (extra) => {
    setExtraAEliminar(extra);
    setMostrarModalEliminacion(true);
  };

  // UI
  return (
    <Container className="mt-4 pt-3">

      {/* Título y botón Nueva Extra */}
            <Row className="align-items-center mb-3">
              <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
                <h3 className="mb-0">
                  <i className="bi-bookmark-plus-fill me-2"></i> Extras
                </h3>
              </Col>
              <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                <Button onClick={() => setMostrarModalRegistro(true)} 
                  variant="dark"          
                  size="md">
                  
                  <i className="bi-plus-lg"></i>
                  <span className="d-none d-sm-inline ms-2">Nueva Extra</span>
                </Button>
              </Col>
            </Row>

      <hr />

      {/* SPINNER */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">Cargando extras...</p>
          </Col>
        </Row>
      )}

      {/* BUSCADOR */}
      <Row className="mb-4">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por descripción o precio..."
          />
        </Col>
      </Row>

      {/* SIN RESULTADOS */}
      {!cargando && textoBusqueda && extrasFiltrados.length === 0 && (
        <Alert variant="info" className="text-center">
          No se encontraron resultados para "{textoBusqueda}"
        </Alert>
      )}

      {/* TARJETAS en móvil / TABLA en desktop */}
      {!cargando && extrasFiltrados.length > 0 && (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaExtra
              extras={extrasPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaExtra
              extras={extrasPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {/* PAGINACIÓN */}
      {extrasFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={extrasFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      {/* MODALES */}
      <ModalRegistroExtra
        mostrarModal={mostrarModalRegistro}
        setMostrarModal={setMostrarModalRegistro}
        nuevoExtra={nuevoExtra}
        manejoCambioInput={manejoCambioInputRegistro}
        agregarExtra={agregarExtra}
      />

      <ModalEdicionExtra
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        extraEditar={extraEditar}
        manejoCambioInput={manejoCambioInputEdicion}
        actualizarExtra={actualizarExtra}
      />

      <ModalEliminacionExtra
        mostrarModal={mostrarModalEliminacion}
        setMostrarModal={setMostrarModalEliminacion}
        extra={extraAEliminar}
        eliminarExtra={eliminarExtra}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

    </Container>
  );
};

export default Extras;