import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import FormularioRegistro from "../components/registro/FormularioRegistro";
import Logo from "../assets/Logo.png";

const RegistroCliente = () => {
  const navegar = useNavigate();

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

    try {
      setCargando(true);

      // 1. Crear usuario en Supabase Auth con rol "cliente" (sin id_cliente aún)
      const { data, error: errorAuth } = await supabase.auth.signUp({
        email: form.correo.trim(),
        password: form.contrasena,
        options: {
          data: { rol: "cliente" },
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

      // 2. Insertar en tabla Clientes y obtener el id_cliente generado
      const { data: nuevoCliente, error: errorCliente } = await supabase
        .from("Clientes")
        .insert([{
          nombre_cliente: form.nombre.trim(),
          apellido_cliente: form.apellido.trim(),
          telefono: form.telefono.trim() || null,
          direccion: form.direccion.trim() || null,
        }])
        .select()
        .single();

      if (errorCliente) {
        console.error("Error al guardar en tabla Clientes:", errorCliente.message);
        setError("Error al completar el registro. Contacta al soporte.");
        return;
      }

      // 3. Actualizar los metadatos del usuario con el id_cliente recién creado
      const idCliente = nuevoCliente.id_cliente;
      await supabase.auth.updateUser({
        data: { rol: "cliente", id_cliente: idCliente }
      });

      // 4. Redirigir al menú (como estaba originalmente)
      localStorage.setItem("usuario-supabase", form.correo.trim());
      navegar("/menu");

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

      {/* NAVBAR */}
      <nav style={{
        background: "white", padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)", flexShrink: 0,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navegar("/")}
        >
          <img src={Logo} alt="TapMeal" style={{ height: 34, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0c0c2c" }}>TapMeal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0c0c2c", fontSize: "0.88rem", fontWeight: 600 }}>
          <i className="bi bi-person-plus-fill" />
          <span>Crear cuenta</span>
        </div>
      </nav>

      {/* FORMULARIO CENTRADO */}
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
          irALogin={() => navegar("/login")}
        />
      </div>
    </div>
  );
};

export default RegistroCliente;