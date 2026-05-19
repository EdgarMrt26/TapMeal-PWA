import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import TarjetaMenuAdmin from "../components/menuAdmin/TarjetaMenuAdmin";

const MenuAdmin = () => {
  const [platillos, setPlatillos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [resPlatillos, resCategorias] = await Promise.all([
          supabase.from("Platillos").select("*").order("nombre_platillo", { ascending: true }),
          supabase.from("Categorias").select("id_categoria, nombre_categoria").order("nombre_categoria"),
        ]);
        setPlatillos(resPlatillos.data || []);
        setCategorias(resCategorias.data || []);
      } catch (err) {
        console.error("Error cargando menú para admin:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
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
    <div style={{ padding: "40px" }}>
      <h2 className="mb-4" style={{ fontWeight: 800, color: "#0c0c2c" }}>
        <i className="bi bi-egg-fried me-2" style={{ color: "#ff6a00" }}></i>
        Menú (Vista Administrador)
      </h2>
      <p className="text-muted mb-4">Visualización del menú de Platillos</p>

      {/* Buscador */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, background: "white",
          borderRadius: 10, padding: "8px 14px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb",
        }}>
          <i className="bi bi-search" style={{ color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Buscar platillos..."
            value={textoBusqueda}
            onChange={e => setTextoBusqueda(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1, fontSize: "0.9rem", background: "transparent" }}
          />
        </div>
      </div>

      {/* Filtros de categoría */}
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

      {/* Cargando o resultados */}
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
              <TarjetaMenuAdmin
                platillo={platillo}
                categoriaNombre={obtenerNombreCategoria(platillo.categoria_platillo)}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MenuAdmin;