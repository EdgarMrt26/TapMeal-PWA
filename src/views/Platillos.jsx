import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroPlatillos from "../components/platillos/ModalRegistroPlatillos";
import ModalEdicionPlatillo from "../components/platillos/ModalEdicionPlatillo";
import ModalEliminacionPlatillo from "../components/platillos/ModalEliminacionPlatillo";

import TablaPlatillos from "../components/platillos/TablaPlatillos";
import TarjetaPlatillos from "../components/platillos/TarjetaPlatillos";

import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";

const Platillos = () => {

  const [platillos, setPlatillos] = useState([]);
  const [platillosFiltrados, setPlatillosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const platillosPaginados = platillosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const [nuevoPlatillo, setNuevoPlatillo] = useState({
    nombre_platillo: "",
    descripcion: "",
    categoria_platillo: "",
    precio: "",
    archivo: null,
  });

  const [platilloEditar, setPlatilloEditar] = useState({
    id_platillo: "",
    nombre_platillo: "",
    descripcion: "",
    categoria_platillo: "",
    precio: "",
    url_imagen: "",
    archivo: null,
  });

  const [platilloAEliminar, setPlatilloAEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarCategorias = async () => {
    try {

      const { data, error } = await supabase
        .from("Categorias")
        .select("*")
        .order("id_categoria", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);

    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const cargarPlatillos = async () => {
    try {

      const { data, error } = await supabase
        .from("Platillos")
        .select(`
          *,
          Categorias(nombre_categoria)
        `)
        .order("id_platillo", { ascending: true });

      if (error) throw error;

      setPlatillos(data || []);
      setPlatillosFiltrados(data || []);

    } catch (err) {

      console.error("Error al cargar platillos:", err);

    } finally {

      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
    cargarPlatillos();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;

    setNuevoPlatillo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioArchivo = (e) => {

    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {

      setNuevoPlatillo((prev) => ({
        ...prev,
        archivo,
      }));

    } else {

      alert("Selecciona una imagen válida");
    }
  };

  const agregarPlatillo = async () => {

    try {

      if (
        !nuevoPlatillo.nombre_platillo.trim() ||
        !nuevoPlatillo.categoria_platillo ||
        !nuevoPlatillo.precio ||
        !nuevoPlatillo.archivo
      ) {

        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios",
          tipo: "advertencia",
        });

        return;
      }

      setMostrarModal(false);

      const nombreArchivo = `${Date.now()}_${nuevoPlatillo.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_platillos")
        .upload(nombreArchivo, nuevoPlatillo.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_platillos")
        .getPublicUrl(nombreArchivo);

      const urlPublica = urlData.publicUrl;

      const { error } = await supabase
        .from("Platillos")
        .insert([
          {
            nombre_platillo: nuevoPlatillo.nombre_platillo,
            descripcion: nuevoPlatillo.descripcion || null,
            categoria_platillo: nuevoPlatillo.categoria_platillo,
            precio: parseFloat(nuevoPlatillo.precio),
            url_imagen: urlPublica,
          },
        ]);

      if (error) throw error;

      await cargarPlatillos();

      setNuevoPlatillo({
        nombre_platillo: "",
        descripcion: "",
        categoria_platillo: "",
        precio: "",
        archivo: null,
      });

      setToast({
        mostrar: true,
        mensaje: "Platillo registrado correctamente",
        tipo: "exito",
      });

    } catch (err) {

      console.error("Error al agregar platillo:", err);

      setToast({
        mostrar: true,
        mensaje: "Error al registrar platillo",
        tipo: "error",
      });
    }
  };

  const manejoCambioInputEdicion = (e) => {

    const { name, value } = e.target;

    setPlatilloEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioArchivoActualizar = (e) => {

    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {

      setPlatilloEditar((prev) => ({
        ...prev,
        archivo,
      }));

    } else {

      alert("Selecciona una imagen válida");
    }
  };

  const actualizarPlatillo = async () => {

    try {

      if (
        !platilloEditar.nombre_platillo.trim() ||
        !platilloEditar.categoria_platillo ||
        !platilloEditar.precio
      ) {

        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios",
          tipo: "advertencia",
        });

        return;
      }

      setMostrarModalEdicion(false);

      let datosActualizados = {
        nombre_platillo: platilloEditar.nombre_platillo,
        descripcion: platilloEditar.descripcion || null,
        categoria_platillo: platilloEditar.categoria_platillo,
        precio: parseFloat(platilloEditar.precio),
        url_imagen: platilloEditar.url_imagen,
      };

      if (platilloEditar.archivo) {

        const nombreArchivo = `${Date.now()}_${platilloEditar.archivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_platillos")
          .upload(nombreArchivo, platilloEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_platillos")
          .getPublicUrl(nombreArchivo);

        datosActualizados.url_imagen = urlData.publicUrl;

        if (platilloEditar.url_imagen) {

          const nombreAnterior = platilloEditar.url_imagen
            .split("/")
            .pop()
            .split("?")[0];

          await supabase.storage
            .from("imagenes_platillos")
            .remove([nombreAnterior])
            .catch(() => {});
        }
      }

      const { error } = await supabase
        .from("Platillos")
        .update(datosActualizados)
        .eq("id_platillo", platilloEditar.id_platillo);

      if (error) throw error;

      await cargarPlatillos();

      setToast({
        mostrar: true,
        mensaje: "Platillo actualizado correctamente",
        tipo: "exito",
      });

    } catch (err) {

      console.error("Error al actualizar platillo:", err);

      setToast({
        mostrar: true,
        mensaje: "Error al actualizar platillo",
        tipo: "error",
      });
    }
  };

  const eliminarPlatillo = async () => {

    if (!platilloAEliminar) return;

    try {

      setMostrarModalEliminacion(false);

      if (platilloAEliminar.url_imagen) {

        const nombreImagen = platilloAEliminar.url_imagen
          .split("/")
          .pop()
          .split("?")[0];

        await supabase.storage
          .from("imagenes_platillos")
          .remove([nombreImagen])
          .catch(() => {});
      }

      const { error } = await supabase
        .from("Platillos")
        .delete()
        .eq("id_platillo", platilloAEliminar.id_platillo);

      if (error) throw error;

      await cargarPlatillos();

      setToast({
        mostrar: true,
        mensaje: "Platillo eliminado correctamente",
        tipo: "exito",
      });

    } catch (err) {

      console.error("Error al eliminar platillo:", err);

      setToast({
        mostrar: true,
        mensaje: "Error al eliminar platillo",
        tipo: "error",
      });
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {

    if (!textoBusqueda.trim()) {

      setPlatillosFiltrados(platillos);

    } else {

      const textoLower = textoBusqueda.toLowerCase().trim();

      const filtrados = platillos.filter((pla) => {

        const nombre = pla.nombre_platillo?.toLowerCase() || "";
        const descripcion = pla.descripcion?.toLowerCase() || "";
        const precio = pla.precio?.toString() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });

      setPlatillosFiltrados(filtrados);
    }

  }, [textoBusqueda, platillos]);

  return (
    <Container className="mt-4 pt-3">

      <Row className="align-items-center mb-3">

        <Col xs={9} sm={7} md={7} lg={7}>
          <h3 className="mb-0">
            <i className="bi bi-egg-fried me-2"></i>
            Platillos
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">

          <Button 
            onClick={() => setMostrarModal(true)}
            variant="dark"
            size="md"
          >

            <i className="bi bi-plus-lg"></i>

            <span className="d-none d-sm-inline ms-2">
              Nuevo Platillo
            </span>

          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>

          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar platillo..."
          />
        </Col>
      </Row>

      {!cargando && textoBusqueda.trim() && platillosFiltrados.length === 0 && (
        <Alert variant="info" className="text-center">
          No se encontraron resultados
        </Alert>
      )}

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" />
          </Col>
        </Row>
      )}

      {!cargando && platillos.length > 0 && (
        <Row>

          <Col lg={12} className="d-none d-lg-block">

            <TablaPlatillos
              platillos={platillosPaginados}
              categorias={categorias}
              abrirModalEdicion={(pla) => {
                setPlatilloEditar(pla);
                setMostrarModalEdicion(true);
              }}
              abrirModalEliminacion={(pla) => {
                setPlatilloAEliminar(pla);
                setMostrarModalEliminacion(true);
              }}
            />
          </Col>
        </Row>
      )}

      <Col xs={12} className="d-lg-none">

        <TarjetaPlatillos
          platillos={platillosFiltrados}
          categorias={categorias}
          abrirModalEdicion={(pla) => {
            setPlatilloEditar(pla);
            setMostrarModalEdicion(true);
          }}
          abrirModalEliminacion={(pla) => {
            setPlatilloAEliminar(pla);
            setMostrarModalEliminacion(true);
          }}
        />
      </Col>

      <ModalRegistroPlatillos
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoPlatillo={nuevoPlatillo}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarPlatillo={agregarPlatillo}
        categorias={categorias}
      />

      <ModalEdicionPlatillo
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        platilloEditar={platilloEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarPlatillo={actualizarPlatillo}
        categorias={categorias}
      />

      <ModalEliminacionPlatillo
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarPlatillo={eliminarPlatillo}
        platillo={platilloAEliminar}
      />

      {platillosFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={platillosFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Platillos;