import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const PaginaMesa = () => {
  const { id_mesa } = useParams();
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const manejarMesa = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate(`/login?redirect=/mesa/${id_mesa}`);
        return;
      }

      const rol = session.user?.user_metadata?.rol;
      if (rol !== "cliente") {
        navigate("/");
        return;
      }

      localStorage.setItem("mesa_actual", id_mesa);
      navigate("/menu");
    };

    manejarMesa();
  }, [id_mesa, navigate]);

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