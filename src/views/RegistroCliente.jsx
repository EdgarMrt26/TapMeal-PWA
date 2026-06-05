import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import FormularioRegistro from "../components/registro/FormularioRegistro";
import Logo from "../assets/Logo.png";

const RegistroCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mesaId = queryParams.get("mesa") || null; // si viene de QR

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const registrar = async () => {
    setError(null);

    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim() || !form.contrasena.trim()) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (form.contrasena !== form.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(form.correo.trim())) {
      setError("Solo se permiten correos @gmail.com");
      return;
    }

    try {
      setCargando(true);
      const emailLower = form.correo.trim().toLowerCase();

      // 1. Crear usuario en Auth
      const { data: authData, error: errorAuth } = await supabase.auth.signUp({
        email: emailLower,
        password: form.contrasena,
        options: {
          data: {
            rol: "cliente",
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
          },
        },
      });

      if (errorAuth) {
        if (errorAuth.message.includes("already registered")) {
          setError("Este correo ya está registrado. Intenta iniciar sesión.");
        } else {
          setError("Error al crear la cuenta: " + errorAuth.message);
        }
        return;
      }

      if (!authData.user) throw new Error("No se pudo obtener el usuario");

      // 2. Insertar en tabla Clientes con auth_user_id
      const { data: nuevoCliente, error: errorCliente } = await supabase
        .from("Clientes")
        .insert([
          {
            auth_user_id: authData.user.id,
            nombre_cliente: form.nombre.trim(),
            apellido_cliente: form.apellido.trim(),
            telefono: form.telefono.trim() || null,
            direccion: form.direccion.trim() || null,
          },
        ])
        .select()
        .single();

      if (errorCliente) {
        console.error("Error al guardar en Clientes:", errorCliente);
        setError("Error al completar el registro. Contacta al soporte.");
        return;
      }

      // 3. Actualizar metadatos del usuario con el id_cliente
      const idCliente = nuevoCliente.id_cliente;
      await supabase.auth.updateUser({
        data: {
          rol: "cliente",
          id_cliente: idCliente,
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
        },
      });

      // 4. Redirigir según si viene de mesa o no
      localStorage.setItem("usuario-supabase", emailLower);
      if (mesaId) {
        navigate(`/menu/${mesaId}`);
      } else {
        navigate("/menu");
      }
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f5",
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <nav style={{
        background: "white", padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)", flexShrink: 0,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="TapMeal" style={{ height: 34, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0c0c2c" }}>TapMeal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0c0c2c", fontSize: "0.88rem", fontWeight: 600 }}>
          <i className="bi bi-person-plus-fill" />
          <span>Crear cuenta</span>
        </div>
      </nav>

      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "32px 24px",
      }}>
        <FormularioRegistro
          form={form}
          error={error}
          cargando={cargando}
          manejarCambio={manejarCambio}
          registrar={registrar}
          irALogin={() => navigate(mesaId ? `/login?mesa=${mesaId}` : "/login")}
        />
      </div>
    </div>
  );
};

export default RegistroCliente;