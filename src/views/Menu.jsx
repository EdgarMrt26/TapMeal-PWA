import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import TarjetaMenu from "../components/menu/TarjetaMenu";
import BotonCarrito from "../components/carrito/BotonCarrito";
import { useCarrito } from "../components/contexto/CarritoContexto";

const Menu = () => {
  const [platillos, setPlatillos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [extras, setExtras] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [sesionActiva, setSesionActiva] = useState(false);
  const { agregarAlCarrito } = useCarrito();
  const navegar = useNavigate();

  useEffect(() => {
    const inicializar = async () => {
      try {
        setCargando(true);

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        const rol = session?.user?.user_metadata?.rol;

        if (rol === "admin") { navegar("/categorias"); return; }
        if (session && rol === "cliente") setSesionActiva(true);

        const [resPlatillos, resCategorias, resExtras] = await Promise.all([
          supabase.from("Platillos").select("*").order("nombre_platillo", { ascending: true }),
          supabase.from("Categorias").select("id_categoria, nombre_categoria").order("nombre_categoria"),
          supabase.from("Extras").select("*").order("descripcion"),
        ]);

        setPlatillos(resPlatillos.data || []);
        setCategorias(resCategorias.data || []);
        setExtras(resExtras.data || []);
      } catch (err) {
        console.error("Error al cargar menú:", err);
      } finally {
        setCargando(false);
      }
    };
    inicializar();
  }, []);

  const platillosFiltrados = useMemo(() => {
    let filtrados = platillos;
    if (categoriaSeleccionada !== "todas") {
      filtrados = filtrados.filter(p => p.categoria_platillo === parseInt(categoriaSeleccionada));
    }
    if (textoBusqueda.trim()) {
      const lower = textoBusqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre_platillo?.toLowerCase().includes(lower) ||
        p.descripcion?.toLowerCase().includes(lower)
      );
    }
    return filtrados;
  }, [platillos, categoriaSeleccionada, textoBusqueda]);

  const obtenerNombreCategoria = (idCategoria) => {
    const cat = categorias.find(c => c.id_categoria === idCategoria);
    return cat ? cat.nombre_categoria : "Sin categoría";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* BANNER INVITADO */}
      {!sesionActiva && (
        <div style={{
          background: "rgba(255,106,0,0.06)", borderBottom: "1px solid rgba(255,106,0,0.15)",
          padding: "10px 24px", textAlign: "center", fontSize: "0.85rem", color: "#92400e",
        }}>
          <i className="bi bi-eye me-2" />
          Estás viendo el menú como <strong>invitado</strong>.{" "}
          <span
            onClick={() => navegar("/registro")}
            style={{ color: "#ff6a00", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Regístrate gratis
          </span>{" "}
          para ordenar.
        </div>
      )}

      {/* BOTÓN CARRITO FLOTANTE */}
      <BotonCarrito visible={sesionActiva} />

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, color: "#0c0c2c", marginBottom: 4 }}>Menú</h2>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
            {sesionActiva ? "Elige tus platillos favoritos" : "Explora nuestros platillos"}
          </p>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: 20, maxWidth: 400 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "white",
            borderRadius: 10, padding: "8px 14px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb",
          }}>
            <i className="bi bi-search" style={{ color: "#9ca3af" }} />
            <input
              type="text" placeholder="Buscar platillos..."
              value={textoBusqueda} onChange={e => setTextoBusqueda(e.target.value)}
              style={{ border: "none", outline: "none", flex: 1, fontSize: "0.9rem", background: "transparent" }}
            />
          </div>
        </div>

        {/* Filtros categoría */}
        {!cargando && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <button
              onClick={() => setCategoriaSeleccionada("todas")}
              style={{
                padding: "6px 16px", borderRadius: 20, border: "none", fontWeight: 600,
                fontSize: "0.82rem", cursor: "pointer",
                background: categoriaSeleccionada === "todas" ? "#ff6a00" : "white",
                color: categoriaSeleccionada === "todas" ? "white" : "#374151",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              Todo
            </button>
            {categorias.map(cat => (
              <button
                key={cat.id_categoria}
                onClick={() => setCategoriaSeleccionada(String(cat.id_categoria))}
                style={{
                  padding: "6px 16px", borderRadius: 20, border: "none", fontWeight: 600,
                  fontSize: "0.82rem", cursor: "pointer",
                  background: categoriaSeleccionada === String(cat.id_categoria) ? "#ff6a00" : "white",
                  color: categoriaSeleccionada === String(cat.id_categoria) ? "white" : "#374151",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                {cat.nombre_categoria}
              </button>
            ))}
          </div>
        )}

        {cargando && (
          <div className="text-center my-5">
            <Spinner animation="border" style={{ color: "#ff6a00" }} />
            <p className="mt-3 text-muted">Cargando menú...</p>
          </div>
        )}

        {!cargando && platillosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2" />No se encontraron platillos.
          </Alert>
        )}

        {!cargando && platillosFiltrados.length > 0 && (
          <Row className="g-3">
            {platillosFiltrados.map(platillo => (
              <Col xs={6} sm={6} md={4} lg={3} key={platillo.id_platillo}>
                <TarjetaMenu
                  platillo={platillo}
                  categoriaNombre={obtenerNombreCategoria(platillo.categoria_platillo)}
                  extras={extras}
                  onAgregar={agregarAlCarrito}
                  esInvitado={!sesionActiva}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Menu;