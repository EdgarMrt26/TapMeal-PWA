import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const PaginaMesa = () => {
  const { nombre_mesa } = useParams(); // ahora captura el nombre
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const manejarMesa = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate(`/login?redirect=/mesa/${nombre_mesa}`);
          return;
        }

        const rol = session.user?.user_metadata?.rol;
        if (rol !== "cliente") {
          navigate("/");
          return;
        }

        // Buscar la mesa por su nombre visible
        const { data: mesa, error: errorMesa } = await supabase
          .from("Mesas")
          .select("id_mesa")
          .eq("nombre_mesa", nombre_mesa)
          .single();

        if (errorMesa || !mesa) {
          setError(`La mesa "${nombre_mesa}" no existe.`);
          return;
        }

        // Guardamos el id_mesa real en localStorage
        localStorage.setItem("mesa_actual", mesa.id_mesa);
        navigate("/menu");
      } catch (err) {
        console.error(err);
        setError("Error al procesar la mesa. Intenta de nuevo.");
      }
    };

    manejarMesa();
  }, [nombre_mesa, navigate]);

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