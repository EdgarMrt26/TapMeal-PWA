import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";

const RutaProtegida = ({ children, rolRequerido }) => {
  const [verificando, setVerificando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const verificar = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        setPermitido(false);
        setVerificando(false);
        return;
      }

      const rol = session.user?.user_metadata?.rol;
      setPermitido(rol === rolRequerido);
      setVerificando(false);
    };

    verificar();
  }, [rolRequerido]);

  if (verificando) return null;

  return permitido ? children : <Navigate to="/login" replace />;
};

export default RutaProtegida;