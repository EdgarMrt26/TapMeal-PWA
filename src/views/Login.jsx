import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { supabase } from "../database/supabaseconfig";
import Logo from "../assets/Logo.png";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const navegar = useNavigate();
  const [searchParams] = useSearchParams();

  const obtenerMesaDestino = () => {
    const mesaQuery = searchParams.get("mesa");
    const redirect = searchParams.get("redirect");

    let mesaDesdeRedirect = null;

    if (redirect) {
      const match = decodeURIComponent(redirect).match(/\/menu\/(\d+)/);
      if (match) mesaDesdeRedirect = match[1];
    }

    return mesaQuery || mesaDesdeRedirect || localStorage.getItem("mesa_actual");
  };

  const redirigirSegunRol = (rol) => {
    const mesaDestino = obtenerMesaDestino();

    if (mesaDestino) {
      localStorage.setItem("mesa_actual", mesaDestino);
      localStorage.setItem("modo_pedido", "en_local");
    }

    if (rol === "admin") {
      navegar("/categorias");
      return;
    }

    if (mesaDestino) {
      navegar(`/menu/${mesaDestino}`);
      return;
    }

    navegar("/menu");
  };

  const iniciarSesion = async () => {
    setError(null);

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      const { data, error: errorAuth } = await supabase.auth.signInWithPassword({
        email: usuario.trim(),
        password: contrasena,
      });

      if (errorAuth) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      if (data.user) {
        const rol = data.user.user_metadata?.rol;
        localStorage.setItem("usuario-supabase", usuario.trim());
        redirigirSegunRol(rol);
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
      console.error("Error en la solicitud:", err);
    }
  };

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const rol = data.session.user?.user_metadata?.rol;
        redirigirSegunRol(rol);
      }
    };

    verificarSesion();
  }, []);

  const mesaDestino = obtenerMesaDestino();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f5",
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <nav style={{
        background: "white",
        padding: "0 28px",
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navegar("/")}
        >
          <img src={Logo} alt="Logo TapMeal" style={{ height: 34, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0c0c2c" }}>TapMeal</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0c0c2c", fontSize: "0.88rem", fontWeight: 600 }}>
          <i className="bi bi-person-fill" />
          <span>Iniciar Sesión</span>
        </div>
      </nav>

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}>
        <div>
          <FormularioLogin
            usuario={usuario}
            contrasena={contrasena}
            error={error}
            setUsuario={setUsuario}
            setContrasena={setContrasena}
            iniciarSesion={iniciarSesion}
          />

          <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.88rem", color: "#6b7280" }}>
            ¿No tienes cuenta?{" "}
            <span
              onClick={() => navegar(mesaDestino ? `/registro?mesa=${mesaDestino}` : "/registro")}
              style={{ color: "#ff6a00", fontWeight: 700, cursor: "pointer" }}
            >
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;