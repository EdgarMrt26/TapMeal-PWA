import React, { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import ModalRegistroMesa from "../components/mesas/ModalRegistroMesa";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaMesa from "../components/mesas/TablaMesa";
import ModalEdicionMesa from "../components/mesas/ModalEdicionMesa";
import ModalEliminacionMesa from "../components/mesas/ModalEliminacionMesa";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";
import TarjetaMesas from "../components/mesas/TarjetaMesas";


const Mesas = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mesaAEliminar, setMesaAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [mesaEditar, setMesaEditar] = useState({
    id_mesa: "",
    nombre_mesa: "",
  });

  // Métodos para abrir modales
  const abrirModalEdicion = (mesa) => {
    setMesaEditar({
      id_mesa: mesa.id_mesa,
      nombre_mesa: mesa.nombre_mesa,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (mesa) => {
    setMesaAEliminar(mesa);
    setMostrarModalEliminacion(true);
  };

  const cargarMesas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Mesas")
        .select("*")
        .order("id_mesa", { ascending: true });

      if (error) {
        console.error("Error al cargar mesa:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cargar mesa.",
          tipo: "error",
        });
        return;
      }
      setMesas(data || []);
    } catch (err) {
      console.error("Excepción al cargar Mesa:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar Mesa",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  const [nuevaMesa, setNuevaMesa] = useState({
    nombre_mesa: "",
  });

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaMesa((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarMesa = async () => {
    try {
      if (
        !nuevaMesa.nombre_mesa.trim() 
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("Mesas").insert([
        {
          nombre_mesa: nuevaMesa.nombre_mesa,
        },
      ]);

      if (error) {
        console.error("Error al agregar mesa:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al registrar mesa.",
          tipo: "error",
        });
        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Mesa "${nuevaMesa.nombre_mesa}" registrada exitosamente.`,
        tipo: "exito",
      });
      await cargarMesas();

      setNuevaMesa({ nombre_mesa: "" });
      setMostrarModal(false);

    } catch (err) {
      console.error("Excepción al agregar mesa:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar mesa.",
        tipo: "error",
      });
    }
  };

  // Manejo de cambio para edición
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setMesaEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Actualizar categoría
  const actualizarMesa = async () => {
    try {
      if (
        !mesaEditar.nombre_mesa.trim() 
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase
        .from("Mesas")                    
        .update({
          nombre_mesa: mesaEditar.nombre_mesa,
        })
        .eq("id_mesa", mesaEditar.id_mesa);

      if (error) {
        console.error("Error al actualizar mesa:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al actualizar la mesa ${mesaEditar.nombre_mesa}.`,
          tipo: "error",
        });
        return;
      }

      await cargarMesas();
      setMostrarModalEdicion(false);
      setToast({
        mostrar: true,
        mensaje: `Mesa ${mesaEditar.nombre_mesa} actualizada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar mesa.",
        tipo: "error",
      });
      console.error("Excepción al actualizar mesa:", err.message);
    }
  };

  // Eliminar categoría
  const eliminarMesa = async () => {
    if (!mesaAEliminar) return;           // ← CORREGIDO

    setMostrarModalEliminacion(false);

    try {
      const { error } = await supabase
        .from('Mesas')
        .delete()
        .eq('id_mesa', mesaAEliminar.id_mesa);

      if (error) {
        console.error("Error al eliminar mesa:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar la mesa ${mesaAEliminar.nombre_mesa}.`,
          tipo: "error"
        });
        return;
      }

      await cargarMesas();
      setToast({
        mostrar: true,
        mensaje: `Mesa ${mesaAEliminar.nombre_mesa} eliminada exitosamente.`,
        tipo: "exito"
      });

    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar mesa.",
        tipo: "error"
      });
      console.error("Excepción al eliminar mesa:", err.message);
    }
  };

  // Variables de estado de Cuadro Búsqueda:
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mesasFiltradas, setMesasFiltradas] = useState([]);

  //Cambio de estado----CuadroBusqueda:
  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  }

  //Método para carga inicial de categorías filtradas:
  useEffect(() => {
  if (!textoBusqueda.trim()) {
    setMesasFiltradas(mesas);
  } else {
    const textoLower = textoBusqueda.toLowerCase().trim();
    const filtradas = mesas.filter(
      (mesas) =>
        mesas.nombre_mesa.toLowerCase().includes(textoLower)
    );
    setMesasFiltradas(filtradas);
  }
}, [textoBusqueda, mesas]);

  // Variables de estado Paginación
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // Función de cálculo de las páginas a mostrar
  const mesasPaginadas = mesasFiltradas.slice(
    (paginaActual -1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  return (
    <Container className="mt-4 pt-3">
      {/* Título y botón Nueva Categoría */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Mesas
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} 
            variant="dark"          
            size="md">
            
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Mesa</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Spinner mientras se cargan las categorías */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando Mesas...</p>
          </Col>
        </Row>
      )}

      {/* Cuadro de búsqueda debajo de la línea divisoria */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre..."
          />
        </Col>
      </Row>

      {/* Tarjetas en móvil */}
      <Col xs={12} sm={12} md={12} className="d-lg-none">
        <TarjetaMesas
          mesas={mesas}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
        />
      </Col>


      {/* Mensaje de no coincidencias solo cuando hay búsqueda y no hay resultado */}
      {!cargando && textoBusqueda.trim() && mesasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron mesas que coincidan con "{textoBusqueda}"
            </Alert>
          </Col>
        </Row>
      )}

      {/* Lista de categorías filtradas */}
      {!cargando && mesasFiltradas.length > 0 && (
        <Row>
          <Col xs={12} sm={12} md={12} className="d-lg-none">
            <TarjetaMesas
              mesas={mesasPaginadas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaMesa
              mesas={mesasPaginadas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {/* Paginación */}
      {mesasFiltradas.length > 0 && (
      <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={mesasFiltradas.length}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
      />
    )}

      {/* Modal de Registro */}
      <ModalRegistroMesa
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaMesa={nuevaMesa}
        manejoCambioInput={manejoCambioInput}
        agregarMesa={agregarMesa}
      />

      {/* Modal de Edición */}
      <ModalEdicionMesa
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        mesaEditar={mesaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}   
        actualizarMesa={actualizarMesa}
      />

      {/* Modal de Eliminación */}
      <ModalEliminacionMesa
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarMesa={eliminarMesa}
        mesa={mesaAEliminar}
      />

      


      {/* Notificación */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Mesas;