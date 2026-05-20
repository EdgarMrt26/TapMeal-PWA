import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const PaginaMesa = () => {
  const { id_mesa } = useParams(); // ✅ Captura el id_mesa desde la URL /mesa/3
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const manejarMesa = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Si no hay sesión, redirige al login con el redirect codificado
        if (!session) {
          navigate(`/login?redirect=/mesa/${encodeURIComponent(id_mesa)}`);
          return;
        }

        const rol = session.user?.user_metadata?.rol;
        if (rol !== "cliente") {
          navigate("/");
          return;
        }

        // ✅ Buscar la mesa por id_mesa (número) que viene directo en la URL
        const { data: mesa, error: errorMesa } = await supabase
          .from("Mesas")
          .select("id_mesa, nombre_mesa, estado")
          .eq("id_mesa", id_mesa)
          .single();

        if (errorMesa || !mesa) {
          setError(`La mesa no existe o no está disponible.`);
          return;
        }

        // ✅ Guardar el id_mesa y nombre en localStorage para usarlo en el pedido
        localStorage.setItem("mesa_actual", mesa.id_mesa);
        localStorage.setItem("mesa_nombre", mesa.nombre_mesa);

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