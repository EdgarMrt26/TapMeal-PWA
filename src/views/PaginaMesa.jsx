import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const PaginaMesa = () => {
  const { nombre_mesa } = useParams(); // Captura el nombre de la mesa desde la URL
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const manejarMesa = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Si no hay sesión, redirige al login con el redirect codificado
        if (!session) {
          // encodeURIComponent para que caracteres como # o espacios no rompan la URL
          navigate(`/login?redirect=/mesa/${encodeURIComponent(nombre_mesa)}`);
          return;
        }

        const rol = session.user?.user_metadata?.rol;
        if (rol !== "cliente") {
          navigate("/");
          return;
        }

        // Buscar la mesa por su nombre visible (tal cual está en la BD)
        const { data: mesa, error: errorMesa } = await supabase
          .from("Mesas")
          .select("id_mesa, nombre_mesa")
          .eq("nombre_mesa", nombre_mesa)
          .single();

        if (errorMesa || !mesa) {
          setError(`La mesa "${nombre_mesa}" no existe o no está disponible.`);
          return;
        }

        // Guardamos el id_mesa real en localStorage para usarlo en el pedido
        localStorage.setItem("mesa_actual", mesa.id_mesa);
        // Opcional: también puedes guardar el nombre para mostrarlo en el menú
        localStorage.setItem("mesa_nombre", mesa.nombre_mesa);
        navigate("/menu");
      } catch (err) {
        console.error("Error al procesar la mesa:", err);
        setError("Error inesperado al procesar la mesa. Intenta de nuevo.");
      }
    };

    manejarMesa();
  }, [nombre_mesa, navigate]);

  // Si hay error, se muestra un mensaje amigable
  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div className="text-center">
          <div className="alert alert-warning">{error}</div>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  // Mientras se procesa la mesa, se muestra un spinner
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div className="text-center">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-2">Preparando tu mesa...</p>
      </div>
    </div>
  );
};

export default PaginaMesa;