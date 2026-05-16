import React, { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import ModalRegistroSalsa from "../components/salsas/ModalRegistroSalsa";
import ModalEdicionSalsa from "../components/salsas/ModalEdicionSalsa";
import ModalEliminacionSalsa from "../components/salsas/ModalEliminacionSalsa";
import TablaSalsa from "../components/salsas/TablaSalsa";
import TarjetaSalsa from "../components/salsas/TarjetaSalsa";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";

const Salsas = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [salsas, setSalsas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [salsaAEliminar, setSalsaAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [salsaEditar, setSalsaEditar] = useState({
    id_salsa: "",
    descripcion: "",
    precio: "",
  });

  const [nuevaSalsa, setNuevaSalsa] = useState({
    descripcion: "",
    precio: "",
  });

  // Abrir modales
  const abrirModalEdicion = (salsa) => {
    setSalsaEditar({
      id_salsa: salsa.id_salsa,
      descripcion: salsa.descripcion,
      precio: salsa.precio,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (salsa) => {
    setSalsaAEliminar(salsa);
    setMostrarModalEliminacion(true);
  };

  // Cargar salsas
  const cargarSalsas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Salsas")
        .select("*")
        .order("id_salsa", { ascending: true });

      if (error) {
        setToast({ mostrar: true, mensaje: "Error al cargar salsas.", tipo: "error" });
        return;
      }
      setSalsas(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error inesperado al cargar salsas.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSalsas();
  }, []);

  // Manejo de inputs
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaSalsa((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setSalsaEditar((prev) => ({ ...prev, [name]: value }));
  };

  // CRUD
  const agregarSalsa = async () => {
    try {
      if (!nuevaSalsa.descripcion.trim() || nuevaSalsa.precio === "") {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase.from("Salsas").insert([{
        descripcion: nuevaSalsa.descripcion,
        precio: parseFloat(nuevaSalsa.precio),
      }]);

      if (error) {
        setToast({ mostrar: true, mensaje: "Error al registrar salsa.", tipo: "error" });
        return;
      }

      setToast({ mostrar: true, mensaje: `Salsa "${nuevaSalsa.descripcion}" registrada exitosamente.`, tipo: "exito" });
      await cargarSalsas();
      setNuevaSalsa({ descripcion: "", precio: "" });
      setMostrarModal(false);
    } catch {
      setToast({ mostrar: true, mensaje: "Error inesperado al registrar salsa.", tipo: "error" });
    }
  };

  const actualizarSalsa = async () => {
    try {
      if (!salsaEditar.descripcion.trim() || salsaEditar.precio === "") {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase
        .from("Salsas")
        .update({
          descripcion: salsaEditar.descripcion,
          precio: parseFloat(salsaEditar.precio),
        })
        .eq("id_salsa", salsaEditar.id_salsa);

      if (error) {
        setToast({ mostrar: true, mensaje: `Error al actualizar la salsa.`, tipo: "error" });
        return;
      }

      await cargarSalsas();
      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: `Salsa "${salsaEditar.descripcion}" actualizada exitosamente.`, tipo: "exito" });
    } catch {
      setToast({ mostrar: true, mensaje: "Error inesperado al actualizar salsa.", tipo: "error" });
    }
  };

  const eliminarSalsa = async () => {
    if (!salsaAEliminar) return;

    setMostrarModalEliminacion(false);

    try {
      const { error } = await supabase
        .from("Salsas")
        .delete()
        .eq("id_salsa", salsaAEliminar.id_salsa);

      if (error) {
        setToast({ mostrar: true, mensaje: `Error al eliminar la salsa.`, tipo: "error" });
        return;
      }

      await cargarSalsas();
      setToast({ mostrar: true, mensaje: `Salsa "${salsaAEliminar.descripcion}" eliminada exitosamente.`, tipo: "exito" });
    } catch {
      setToast({ mostrar: true, mensaje: "Error inesperado al eliminar salsa.", tipo: "error" });
    }
  };

  // Búsqueda
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [salsasFiltradas, setSalsasFiltradas] = useState([]);

  const manejarBusqueda = (e) => setTextoBusqueda(e.target.value);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setSalsasFiltradas(salsas);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      setSalsasFiltradas(
        salsas.filter((s) =>
          s.descripcion?.toLowerCase().includes(textoLower) ||
          s.precio?.toString().includes(textoLower)
        )
      );
    }
  }, [textoBusqueda, salsas]);

  // Paginación
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const salsasPaginadas = salsasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

const abrirModalRegistro = () => {
  setNuevaSalsa({ descripcion: "", precio: "" });
  setMostrarModal(true);
};

  return (
    <Container className="mt-4 pt-3">

      {/* HEADER */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi bi-droplet-fill me-2"></i> Salsas
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={abrirModalRegistro} variant="dark" size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Salsa</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* SPINNER */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando Salsas...</p>
          </Col>
        </Row>
      )}

      {/* BUSCADOR */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por descripción o precio..."
          />
        </Col>
      </Row>

      {/* SIN RESULTADOS */}
      {!cargando && textoBusqueda.trim() && salsasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron salsas que coincidan con "{textoBusqueda}"
            </Alert>
          </Col>
        </Row>
      )}

      {/* TABLA / TARJETAS */}
      {!cargando && salsasFiltradas.length > 0 && (
        <Row>
          <Col xs={12} sm={12} md={12} className="d-lg-none">
            <TarjetaSalsa
              salsas={salsasPaginadas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaSalsa
              salsas={salsasPaginadas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {/* PAGINACIÓN */}
      {salsasFiltradas.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={salsasFiltradas.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      {/* MODALES */}
      <ModalRegistroSalsa
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaSalsa={nuevaSalsa}
        manejoCambioInput={manejoCambioInput}
        agregarSalsa={agregarSalsa}
      />
      <ModalEdicionSalsa
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        salsaEditar={salsaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarSalsa={actualizarSalsa}
      />
      <ModalEliminacionSalsa
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarSalsa={eliminarSalsa}
        salsa={salsaAEliminar}
      />

      {/* NOTIFICACIÓN */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Salsas;