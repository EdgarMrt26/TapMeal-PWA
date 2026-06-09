import React, { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert
} from "react-bootstrap";
import ModalRegistroMesa from "../components/mesas/ModalRegistroMesa";
import ModalEdicionMesa from "../components/mesas/ModalEdicionMesa";
import ModalEliminacionMesa from "../components/mesas/ModalEliminacionMesa";
import TablaMesa from "../components/mesas/TablaMesa";
import TarjetaMesas from "../components/mesas/TarjetaMesas";
import TarjetaMesaPOS from "../components/mesas/TarjetaMesaPOS";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";
import ModalQRMesa from "../components/mesas/ModalQRMesa";

const Mesas = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mesaAEliminar, setMesaAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [modoVista, setModoVista] = useState("pos");
  const [mesaEditar, setMesaEditar] = useState({ id_mesa: "", nombre_mesa: "" });
  const [nuevaMesa, setNuevaMesa] = useState({ nombre_mesa: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mesasFiltradas, setMesasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const [mostrarModalQR, setMostrarModalQR] = useState(false);
const [mesaSeleccionadaQR, setMesaSeleccionadaQR] = useState(null);

// Método que se pasa a los componentes:
const generarQRMesa = (mesa) => {
  setMesaSeleccionadaQR(mesa);
  setMostrarModalQR(true);
};

  const cargarMesas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Mesas")
        .select("*")
        .order("id_mesa", { ascending: true });
      if (error) throw error;
      setMesas(data || []);
    } catch {
      setToast({ mostrar: true, mensaje: "Error al cargar mesas.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarMesas(); }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setMesasFiltradas(mesas);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtradas = mesas.filter(mesa =>
        mesa.nombre_mesa.toLowerCase().includes(textoLower)
      );
      setMesasFiltradas(filtradas);
    }
  }, [textoBusqueda, mesas]);

  const manejarBusqueda = (e) => setTextoBusqueda(e.target.value);

  const mesasPaginadas = mesasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // Funciones CRUD (agregar, editar, eliminar)...
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaMesa(prev => ({ ...prev, [name]: value }));
  };
  const agregarMesa = async () => {
    if (!nuevaMesa.nombre_mesa.trim()) {
      setToast({ mostrar: true, mensaje: "Debe llenar el campo.", tipo: "advertencia" });
      return;
    }
    const { error } = await supabase.from("Mesas").insert([{ nombre_mesa: nuevaMesa.nombre_mesa, estado: "Disponible" }]);
    if (error) {
      setToast({ mostrar: true, mensaje: "Error al registrar mesa.", tipo: "error" });
    } else {
      setToast({ mostrar: true, mensaje: `Mesa "${nuevaMesa.nombre_mesa}" registrada.`, tipo: "exito" });
      await cargarMesas();
      setNuevaMesa({ nombre_mesa: "" });
      setMostrarModal(false);
    }
  };
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setMesaEditar(prev => ({ ...prev, [name]: value }));
  };
  const actualizarMesa = async () => {
    const { error } = await supabase.from("Mesas").update({ nombre_mesa: mesaEditar.nombre_mesa }).eq("id_mesa", mesaEditar.id_mesa);
    if (error) {
      setToast({ mostrar: true, mensaje: "Error al actualizar mesa.", tipo: "error" });
    } else {
      await cargarMesas();
      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Mesa actualizada.", tipo: "exito" });
    }
  };
  const eliminarMesa = async () => {
    if (!mesaAEliminar) return;
    const { error } = await supabase.from("Mesas").delete().eq("id_mesa", mesaAEliminar.id_mesa);
    if (error) {
      setToast({ mostrar: true, mensaje: "Error al eliminar mesa.", tipo: "error" });
    } else {
      await cargarMesas();
      setMostrarModalEliminacion(false);
      setToast({ mostrar: true, mensaje: "Mesa eliminada.", tipo: "exito" });
    }
  };
  const abrirModalEdicion = (mesa) => {
    setMesaEditar({ id_mesa: mesa.id_mesa, nombre_mesa: mesa.nombre_mesa });
    setMostrarModalEdicion(true);
  };
  const abrirModalEliminacion = (mesa) => {
    setMesaAEliminar(mesa);
    setMostrarModalEliminacion(true);
  };

  return (
    <Container className="mt-4 pt-3">
      <Row className="align-items-center mb-3">
        <Col xs={8}><h3><i className="bi bi-grid-1x2-fill me-2"></i>Mesas</h3></Col>
        <Col xs={4} className="text-end">
          <Button onClick={() => setMostrarModal(true)} variant="dark"><i className="bi bi-plus-lg"></i></Button>
        </Col>
      </Row>
      <hr />
      <Row className="mb-4">
        <Col className="d-flex gap-2 flex-wrap">
          <Button variant={modoVista === "admin" ? "dark" : "outline-dark"} onClick={() => setModoVista("admin")}>
            <i className="bi bi-table me-2"></i>Administración
          </Button>
          <Button variant={modoVista === "pos" ? "success" : "outline-success"} onClick={() => setModoVista("pos")}>
            <i className="bi bi-grid-1x2-fill me-2"></i>POS
          </Button>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas textoBusqueda={textoBusqueda} manejarCambioBusqueda={manejarBusqueda} placeholder="Buscar mesa..." />
        </Col>
      </Row>
      {cargando && (
        <Row className="text-center my-5"><Col><Spinner animation="border" variant="success" /><p>Cargando mesas...</p></Col></Row>
      )}
      {!cargando && mesasFiltradas.length === 0 && <Alert variant="info">No se encontraron mesas.</Alert>}
      {modoVista === "admin" && !cargando && mesasFiltradas.length > 0 && (
        <Row>
          <Col xs={12} className="d-lg-none">
          <TarjetaMesas mesas={mesasPaginadas}
          abrirModalEdicion={abrirModalEdicion} 
          abrirModalEliminacion={abrirModalEliminacion} 
          generarQRMesa={generarQRMesa} 
          />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
          <TablaMesa mesas={mesasPaginadas} 
          abrirModalEdicion={abrirModalEdicion} 
          abrirModalEliminacion={abrirModalEliminacion} 
          generarQRMesa={generarQRMesa} 
          />
          </Col>
        </Row>
      )}
      {modoVista === "pos" && !cargando && (
        <Row>
          {mesasFiltradas.map((mesa) => (
            <Col key={mesa.id_mesa} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <TarjetaMesaPOS mesa={mesa} />
            </Col>
          ))}
        </Row>
      )}
      {modoVista === "admin" && mesasFiltradas.length > 0 && (
        <Paginacion 
        registrosPorPagina={registrosPorPagina} 
        totalRegistros={mesasFiltradas.length}
        paginaActual={paginaActual} 
        establecerPaginaActual={establecerPaginaActual} 
        establecerRegistrosPorPagina={establecerRegistrosPorPagina} 
        />
      )}
      <ModalRegistroMesa mostrarModal={mostrarModal} 
      setMostrarModal={setMostrarModal} 
      nuevaMesa={nuevaMesa} 
      manejoCambioInput={manejoCambioInput} 
      agregarMesa={agregarMesa} 
      />
      <ModalEdicionMesa 
      mostrarModalEdicion={mostrarModalEdicion} 
      setMostrarModalEdicion={setMostrarModalEdicion} 
      mesaEditar={mesaEditar} 
      manejoCambioInputEdicion={manejoCambioInputEdicion} 
      actualizarMesa={actualizarMesa}
      />
      <ModalEliminacionMesa 
      mostrarModalEliminacion={mostrarModalEliminacion} 
      setMostrarModalEliminacion={setMostrarModalEliminacion} 
      eliminarMesa={eliminarMesa} 
      mesa={mesaAEliminar} 
      />
      
      <ModalQRMesa
      mostrarModalQR={mostrarModalQR}
      setMostrarModalQR={setMostrarModalQR}
      mesaSeleccionada={mesaSeleccionadaQR}
    />
    
      <NotificacionOperacion 
      mostrar={toast.mostrar} 
      mensaje={toast.mensaje} 
      tipo={toast.tipo} onCerrar={() => setToast({ ...toast, mostrar: false })} />
    </Container>
  );
};

export default Mesas;