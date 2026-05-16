import React, { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import ModalRegistroClientes from "../components/clientes/ModalRegistroClientes";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaClientes from "../components/clientes/TablaClientes";
import TarjetaClientes from "../components/clientes/TarjetaClientes";
import ModalEdicionClientes from "../components/clientes/ModalEdicionClientes";
import ModalEliminacionClientes from "../components/clientes/ModalEliminacionClientes";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";

const Clientes = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [clienteEditar, setClienteEditar] = useState({
    id_cliente: "",
    nombre_cliente: "",
    apellido_cliente: "",
    telefono: "",
    direccion: "",
  });

  // Métodos para abrir modales
  const abrirModalEdicion = (cliente) => {
    setClienteEditar({
      id_cliente: cliente.id_cliente,
      nombre_cliente: cliente.nombre_cliente,
      apellido_cliente: cliente.apellido_cliente,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminacion(true);
  };

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Clientes")
        .select("*")
        .order("id_cliente", { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cargar clientes.",
          tipo: "error",
        });
        return;
      }
      setClientes(data || []);
    } catch (err) {
      console.error("Excepción al cargar clientes:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar clientes",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_cliente: "",
    apellido_cliente: "",
    telefono: "",
    direccion: "",
  });

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarCliente = async () => {
    try {
      if (
        !nuevoCliente.nombre_cliente.trim() ||
        !nuevoCliente.apellido_cliente.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("Clientes").insert([
        {
          nombre_cliente: nuevoCliente.nombre_cliente,
          apellido_cliente: nuevoCliente.apellido_cliente,
          telefono: nuevoCliente.telefono,
          direccion: nuevoCliente.direccion,
        },
      ]);

      if (error) {
        console.error("Error al agregar cliente:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al registrar cliente.",
          tipo: "error",
        });
        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Cliente "${nuevoCliente.nombre_cliente}" registrado exitosamente.`,
        tipo: "exito",
      });
      await cargarClientes();

      setNuevoCliente({ 
        nombre_cliente: "", 
        apellido_cliente: "", 
        telefono: "", 
        direccion: "" 
      });
      setMostrarModal(false);

    } catch (err) {
      console.error("Excepción al agregar cliente:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar cliente.",
        tipo: "error",
      });
    }
  };

  // Manejo de cambio para edición
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setClienteEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Actualizar cliente
  const actualizarCliente = async () => {
    try {
      if (
        !clienteEditar.nombre_cliente.trim() ||
        !clienteEditar.apellido_cliente.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase
        .from("Clientes")                    
        .update({
          nombre_cliente: clienteEditar.nombre_cliente,
          apellido_cliente: clienteEditar.apellido_cliente,
          telefono: clienteEditar.telefono,
          direccion: clienteEditar.direccion,
        })
        .eq("id_cliente", clienteEditar.id_cliente);

      if (error) {
        console.error("Error al actualizar cliente:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al actualizar el cliente ${clienteEditar.nombre_cliente}.`,
          tipo: "error",
        });
        return;
      }

      await cargarClientes();
      setMostrarModalEdicion(false);
      setToast({
        mostrar: true,
        mensaje: `Cliente ${clienteEditar.nombre_cliente} actualizado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar cliente.",
        tipo: "error",
      });
      console.error("Excepción al actualizar cliente:", err.message);
    }
  };

  // Eliminar cliente
  const eliminarCliente = async () => {
    if (!clienteAEliminar) return;

    setMostrarModalEliminacion(false);

    try {
      const { error } = await supabase
        .from('Clientes')
        .delete()
        .eq('id_cliente', clienteAEliminar.id_cliente);

      if (error) {
        console.error("Error al eliminar cliente:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar el cliente ${clienteAEliminar.nombre_cliente}.`,
          tipo: "error"
        });
        return;
      }

      await cargarClientes();
      setToast({
        mostrar: true,
        mensaje: `Cliente ${clienteAEliminar.nombre_cliente} eliminado exitosamente.`,
        tipo: "exito"
      });

    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar cliente.",
        tipo: "error"
      });
      console.error("Excepción al eliminar cliente:", err.message);
    }
  };

  // Variables de estado de Cuadro Búsqueda:
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  //Cambio de estado----CuadroBusqueda:
  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  }

  //Método para carga inicial de clientes filtrados:
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = clientes.filter(
        (cli) =>
          cli.nombre_cliente.toLowerCase().includes(textoLower) || 
          cli.apellido_cliente.toLowerCase().includes(textoLower) ||
          (cli.telefono && cli.telefono.includes(textoLower))
      );
      setClientesFiltrados(filtrados);
    }
  }, [textoBusqueda, clientes]);

  // Variables de estado Paginación
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // Función de cálculo de las páginas a mostrar
  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  return (
    <Container className="mt-4 pt-3">
      {/* Título y botón Nuevo Cliente */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-people-fill me-2"></i> Clientes
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button 
            onClick={() => setMostrarModal(true)} 
            variant="dark"          
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Cliente</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Spinner mientras se cargan los clientes */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="dark" size="lg" />
            <p className="mt-3 text-muted">Cargando Clientes...</p>
          </Col>
        </Row>
      )}
      {/* Cuadro de búsqueda debajo de la línea divisoria */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, apellido o teléfono..."
          />
        </Col>
      </Row>

      {/* Mensaje de no coincidencias solo cuando hay búsqueda y no hay resultado */}
      {!cargando && textoBusqueda.trim() && clientesFiltrados.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron clientes que coincidan con "{textoBusqueda}"
            </Alert>
          </Col>
        </Row>
      )}

      {/* Lista de clientes filtrados */}
      {!cargando && clientesFiltrados.length > 0 && (
        <Row>
          {/* Vista móvil: Tarjetas */}
          <Col xs={12} sm={12} md={12} className="d-lg-none">
            <TarjetaClientes
              clientes={clientesPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          {/* Vista escritorio: Tabla */}
          <Col lg={12} className="d-none d-lg-block">
            <TablaClientes
              clientes={clientesPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}
      {/* Paginación */}
      {clientesFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={clientesFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      {/* Modal de Registro */}
      <ModalRegistroClientes
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
      />

      {/* Modal de Edición */}
      <ModalEdicionClientes
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        clienteEditar={clienteEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}   
        actualizarCliente={actualizarCliente}
      />

      {/* Modal de Eliminación */}
      <ModalEliminacionClientes
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCliente={eliminarCliente}
        cliente={clienteAEliminar}
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

export default Clientes;