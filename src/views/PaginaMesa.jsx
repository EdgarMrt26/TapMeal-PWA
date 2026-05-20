import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const PaginaMesa = () => {
  const { id_mesa } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const manejarMesa = async () => {
      try {
        // ✅ Guardar la mesa en localStorage ANTES de cualquier redirect
        // para que esté disponible sin importar si va a registro o login
        localStorage.setItem("mesa_actual", id_mesa);

        const { data: { session } } = await supabase.auth.getSession();

        // Sin sesión → va a registro (flujo principal para clientes nuevos)
        if (!session) {
          navigate("/registro");
          return;
        }

        const rol = session.user?.user_metadata?.rol;
        if (rol !== "cliente") {
          navigate("/");
          return;
        }

        // Ya tiene sesión → buscar la mesa y guardar nombre, luego al menú
        const { data: mesa, error: errorMesa } = await supabase
          .from("Mesas")
          .select("id_mesa, nombre_mesa")
          .eq("id_mesa", id_mesa)
          .single();

        if (errorMesa || !mesa) {
          setError(`La mesa no existe o no está disponible.`);
          return;
        }

        localStorage.setItem("mesa_nombre", mesa.nombre_mesa);

        // Marcar mesa como ocupada
        await supabase
          .from("Mesas")
          .update({ estado: "Ocupada" })
          .eq("id_mesa", id_mesa);

        navigate("/menu");
      } catch (err) {
        console.error("Error al procesar la mesa:", err);
        setError("Error inesperado al procesar la mesa. Intenta de nuevo.");
      }
    };

    manejarMesa();
  }, [id_mesa, navigate]);

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