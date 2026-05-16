import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig"; // ← importación necesaria
import Logo from "../assets/Logo.png";

const caracteristicas = [
  {
    icon: "bi-qr-code-scan",
    titulo: "Escanea y Ordena",
    descripcion: "Escanea el código QR de tu mesa y realiza tu pedido al instante.",
  },
  {
    icon: "bi-phone",
    titulo: "Menú Digital",
    descripcion: "Navega por nuestro menú completo con fotos y descripciones.",
  },
  {
    icon: "bi-credit-card",
    titulo: "Pago Fácil",
    descripcion: "Paga con efectivo o tarjeta de forma segura y rápida.",
  },
];

export default function Inicio() {
  const [visible, setVisible] = useState(false);
  const [sesionActiva, setSesionActiva] = useState(false);
  const navegar = useNavigate();

  // Animación de entrada
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Verificar sesión al montar y suscribirse a cambios
  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession();
      setSesionActiva(!!data?.session);
    };
    verificarSesion();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesionActiva(!!session);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario-supabase");
    navegar("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6f0", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        .fade-up { opacity: 0; transform: translateY(18px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade-up.show { opacity: 1; transform: translateY(0); }
        .btn-sesion {
          background: #111; color: white; border: none;
          padding: 9px 22px; border-radius: 8px;
          font-weight: 600; font-size: 0.88rem; cursor: pointer;
          transition: background 0.2s;
        }
        .btn-sesion:hover { background: #333; }
        .btn-outline-dark-custom {
          background: transparent; color: #0c0c2c;
          border: 2px solid #0c0c2c; padding: 10px 22px;
          border-radius: 8px; font-weight: 600; font-size: 0.92rem;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .btn-outline-dark-custom:hover { background: #0c0c2c; color: white; }
        .btn-outline-orange-custom {
          background: transparent; color: #ff6a00;
          border: 2px solid #ff6a00; padding: 10px 22px;
          border-radius: 8px; font-weight: 600; font-size: 0.92rem;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .btn-outline-orange-custom:hover { background: #ff6a00; color: white; }
        .feature-card {
          background: white; border-radius: 16px; padding: 32px 24px;
          text-align: center; border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          flex: 1; min-width: 180px;
        }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.10); }
        .feature-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(255,106,0,0.1); color: #ff6a00;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.7rem; margin: 0 auto 18px;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        background: "white", padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={Logo} alt="Logo TapMeal" style={{ height: 34, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0c0c2c" }}>TapMeal</span>
        </div>

        {/* Botón dinámico según sesión */}
        {sesionActiva ? (
          <button className="btn-sesion" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        ) : (
          <button className="btn-sesion" onClick={() => navegar("/login")}>
            Iniciar Sesión
          </button>
        )}
      </nav>

      {/* HERO */}
      <div
        className={`fade-up ${visible ? "show" : ""}`}
        style={{ textAlign: "center", padding: "72px 24px 48px", maxWidth: 600, margin: "0 auto" }}
      >
        <h1 style={{ fontWeight: 800, fontSize: "2.6rem", color: "#0c0c2c", marginBottom: 14, lineHeight: 1.2 }}>
          Ordena con un <span style={{ color: "#ff6a00" }}>Tap</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.05rem", marginBottom: 32, lineHeight: 1.7 }}>
          Pide tu comida favorita de manera rápida y sencilla
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-outline-dark-custom" onClick={() => navegar("/menu")}>
            <i className="bi bi-phone" /> Ver Menú
          </button>
          <button className="btn-outline-orange-custom">
            <i className="bi bi-qr-code-scan" /> Escanear Mesa
          </button>
        </div>
      </div>

      {/* TARJETAS */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        padding: "0 24px 64px",
        display: "flex", gap: 20, flexWrap: "wrap",
      }}>
        {caracteristicas.map((c, i) => (
          <div
            key={i}
            className={`feature-card fade-up ${visible ? "show" : ""}`}
            style={{ transitionDelay: `${200 + i * 90}ms` }}
          >
            <div className="feature-icon">
              <i className={`bi ${c.icon}`} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0c0c2c", marginBottom: 10 }}>
              {c.titulo}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
              {c.descripcion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}