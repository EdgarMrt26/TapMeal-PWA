import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const PaginaMesa = () => {
  const { id_mesa } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("Verificando sesión...");

  useEffect(() => {
    const manejarMesa = async () => {
      try {
        setMensaje("Verificando sesión...");

        // ✅ Esperar hasta que Supabase resuelva la sesión correctamente
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setMensaje("Redirigiendo al registro...");
          // Guardar el id_mesa en localStorage ANTES de redirigir
          // para que cuando regrese después de login/registro, la mesa siga guardada
          localStorage.setItem("mesa_pendiente", id_mesa);
          navigate(`/registro?redirect=/mesa/${encodeURIComponent(id_mesa)}`);
          return;
        }

        const rol = session.user?.user_metadata?.rol;
        if (rol !== "cliente") {
          navigate("/");
          return;
        }

        setMensaje("Buscando mesa...");

        const { data: mesa, error: errorMesa } = await supabase
          .from("Mesas")
          .select("id_mesa, nombre_mesa, estado")
          .eq("id_mesa", id_mesa)
          .single();

        if (errorMesa || !mesa) {
          setError(`La mesa con ID "${id_mesa}" no existe o no está disponible.`);
          return;
        }

        setMensaje(`Preparando ${mesa.nombre_mesa}...`);

        // ✅ Guardar mesa en localStorage
        localStorage.setItem("mesa_actual", mesa.id_mesa);
        localStorage.setItem("mesa_nombre", mesa.nombre_mesa);

        // ✅ Actualizar estado de la mesa a Ocupada
        await supabase
          .from("Mesas")
          .update({ estado: "Ocupada" })
          .eq("id_mesa", mesa.id_mesa);

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
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f5f5f5", padding: 24,
      }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "#ff6a00" }} />
          <div className="alert alert-warning mt-3">{error}</div>
          <button className="btn btn-outline-secondary mt-2" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f5f5",
    }}>
      <div className="text-center">
        <div className="spinner-border text-warning mb-3" role="status" />
        <p style={{ color: "#6b7280", fontWeight: 600 }}>{mensaje}</p>
      </div>
    </div>
  );
};

export default PaginaMesa;