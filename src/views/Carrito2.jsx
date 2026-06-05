import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Nav, Offcanvas, Navbar, Container } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";
import Logo from "../../assets/Logo.png";

const RUTAS_PUBLICAS = ["/login", "/registro"];

const RUTAS_CLIENTE = [
  "/",
  "/menu",
  "/carrito",
  "/pedidosCliente",
  "/historial",
  "/cuenta",
];

const navLinks = [
  { label: "Inicio", ruta: "/", icon: "bi-house-door" },
  { label: "Menú", ruta: "/menu", icon: "bi-egg-fried" },
  { label: "Pedidos", ruta: "/pedidosCliente", icon: "bi-receipt" },
  { label: "Carrito", ruta: "/carrito", icon: "bi-cart3" },
  { label: "Historial", ruta: "/historial", icon: "bi-clock-history" },
  { label: "Cuenta", ruta: "/cuenta", icon: "bi-person-circle" },
];

const Encabezado = () => {

  const [rol, setRol] = useState(null);

  const [verificando, setVerificando] = useState(true);

  const [mostrarMenuCliente, setMostrarMenuCliente] =
    useState(false);

  const [mostrarMenuAdmin, setMostrarMenuAdmin] =
    useState(false);

  const [esDesktop, setEsDesktop] =
    useState(window.innerWidth >= 992);

  const navigate = useNavigate();

  const location = useLocation();

  // =========================
  // VERIFICAR SESION
  // =========================

  useEffect(() => {

    const verificarSesion = async () => {

      const { data } =
        await supabase.auth.getSession();

      const session = data?.session;

      setRol(
        session
          ? session.user?.user_metadata?.rol || null
          : null
      );

      setVerificando(false);

    };

    verificarSesion();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          setRol(
            session
              ? session.user?.user_metadata?.rol || null
              : null
          );

        }
      );

    return () =>
      listener.subscription.unsubscribe();

  }, []);

  // =========================
  // RESPONSIVE
  // =========================

  useEffect(() => {

    const manejarResize = () => {

      const desktop =
        window.innerWidth >= 992;

      setEsDesktop(desktop);

      if (desktop) {

        setMostrarMenuCliente(false);

        setMostrarMenuAdmin(false);

      }

    };

    window.addEventListener(
      "resize",
      manejarResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        manejarResize
      );

  }, []);

  // =========================
  // NAVEGAR
  // =========================

  const manejarNavegacion = (ruta) => {

    navigate(ruta);

    setMostrarMenuCliente(false);

    setMostrarMenuAdmin(false);

  };

  // =========================
  // CERRAR SESION
  // =========================

  const cerrarSesion = async () => {

  // cerrar menus antes de salir
  setMostrarMenuCliente(false);
  setMostrarMenuAdmin(false);

  await supabase.auth.signOut();

  localStorage.removeItem(
    "usuario-supabase"
  );

  navigate("/login");

};

  // =========================
  // ACTIVAR LINK
  // =========================

  const activo = (ruta) =>
    location.pathname === ruta
      ? "active"
      : "";

  const paginaPublica =
    RUTAS_PUBLICAS.includes(
      location.pathname
    );

  if (verificando) return null;

  // ====================================
  // OCULTAR SOLO LOGIN Y REGISTRO
  // ====================================

  if (
    paginaPublica &&
    rol !== "cliente" &&
    rol !== "admin"
  ) {
    return null;
  }

  // ====================================
  // CLIENTE
  // ====================================

  if (
    rol === "cliente" ||
    (rol === null &&
      RUTAS_CLIENTE.includes(
        location.pathname
      ))
  ) {

    return (
      <>
        <nav
          style={{
            background: "white",

            padding: "0 30px",

            height: 58,

            display: "flex",

            alignItems: "center",

            justifyContent:
              "space-between",

            boxShadow:
              "0 1px 8px rgba(0,0,0,0.08)",

            position: "sticky",

            top: 0,

            zIndex: 100,
          }}
        >

          {/* LOGO */}
          <div
            onClick={() =>
              manejarNavegacion("/")
            }
            style={{
              display: "flex",

              alignItems: "center",

              gap: 10,

              cursor: "pointer",
            }}
          >

            <img
              src={Logo}
              alt="TapMeal"
              style={{
                height: 32,
              }}
            />

            <span
              style={{
                fontWeight: 800,

                fontSize: "1.1rem",

                color: "#0c0c2c",
              }}
            >
              TapMeal
            </span>

          </div>

          {/* DESKTOP */}
          <div
            className="d-none d-md-flex"
            style={{
              alignItems: "center",

              gap: 5,
            }}
          >

            {navLinks.map((link) => (

              <button
                key={link.ruta}
                onClick={() =>
                  manejarNavegacion(
                    link.ruta
                  )
                }
                style={{
                  background:
                    location.pathname ===
                    link.ruta
                      ? "rgba(255,106,0,0.08)"
                      : "transparent",

                  border: "none",

                  padding:
                    "7px 12px",

                  borderRadius: 8,

                  fontWeight: 600,

                  fontSize: "0.88rem",

                  cursor: "pointer",

                  color:
                    location.pathname ===
                    link.ruta
                      ? "#ff6a00"
                      : "#1a1a2e",
                }}
              >

                <i
                  className={`bi ${link.icon} me-1`}
                />

                {link.label}

              </button>

            ))}

            {/* CERRAR SESION */}
            <button
              onClick={cerrarSesion}
              style={{
                background: "#0c0c2c",

                color: "white",

                border: "none",

                padding:
                  "8px 16px",

                borderRadius: 8,

                fontWeight: 600,

                cursor: "pointer",

                marginLeft: 8,
              }}
            >
              Cerrar Sesión
            </button>

          </div>

          {/* MOVIL */}
          <button
            className="d-md-none"
            onClick={() =>
              setMostrarMenuCliente(
                true
              )
            }
            style={{
              background:
                "transparent",

              border: "none",

              fontSize: "1.5rem",

              color: "#0c0c2c",

              cursor: "pointer",
            }}
          >

            <i className="bi bi-list" />

          </button>

        </nav>

        {/* MENU MOVIL */}
        <Offcanvas
          show={mostrarMenuCliente}
          onHide={() =>
            setMostrarMenuCliente(
              false
            )
          }
          placement="start"
          style={{
            width: 260,
          }}
        >

          <Offcanvas.Header
            style={{
              background: "#0c0c2c",
            }}
          >

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: 10,
              }}
            >

              <img
                src={Logo}
                alt="TapMeal"
                style={{
                  height: 30,
                }}
              />

              <span
                style={{
                  color: "white",

                  fontWeight: 800,
                }}
              >
                TapMeal
              </span>

            </div>

          </Offcanvas.Header>

          <Offcanvas.Body
            style={{
              display: "flex",

              flexDirection: "column",

              padding: 0,
            }}
          >

            <Nav className="flex-column">

              {navLinks.map((link) => (

                <Nav.Link
                  key={link.ruta}
                  onClick={() =>
                    manejarNavegacion(
                      link.ruta
                    )
                  }
                  style={{
                    padding:
                      "14px 20px",

                    fontWeight: 600,

                    color:
                      location.pathname ===
                      link.ruta
                        ? "#ff6a00"
                        : "#1a1a2e",

                    background:
                      location.pathname ===
                      link.ruta
                        ? "rgba(255,106,0,0.06)"
                        : "transparent",
                  }}
                >

                  <i
                    className={`bi ${link.icon} me-2`}
                  />

                  {link.label}

                </Nav.Link>

              ))}

            </Nav>

            {/* BOTON */}
            <div
              style={{
                marginTop: "auto",

                padding: 20,
              }}
            >

              <button
                onClick={cerrarSesion}
                style={{
                  width: "100%",

                  background:
                    "#dc3545",

                  color: "white",

                  border: "none",

                  padding:
                    "12px",

                  borderRadius: 10,

                  fontWeight: 700,
                }}
              >
                <i className="bi bi-box-arrow-right me-2" />

                Cerrar Sesión

              </button>

            </div>

          </Offcanvas.Body>

        </Offcanvas>
      </>
    );

  }

  // ====================================
  // ADMIN
  // ====================================

  if (rol === "admin") {

    return (
      <>
        <Navbar
          expand="lg"
          fixed="top"
          className="color-navbar d-lg-none"
          variant="dark"
        >

          <Container fluid>

            <span className="text-white fw-bold">
              TapMeal
            </span>

            <Navbar.Toggle
              onClick={() =>
                setMostrarMenuAdmin(
                  true
                )
              }
            />

          </Container>

        </Navbar>

        {!esDesktop && (

          <Offcanvas
            show={mostrarMenuAdmin}
            onHide={() =>
              setMostrarMenuAdmin(
                false
              )
            }
            placement="start"
            className="sidebar-custom"
          >

            <Offcanvas.Body className="d-flex flex-column p-0">

              <ContenidoSidebarAdmin
                activo={activo}
                manejarNavegacion={
                  manejarNavegacion
                }
                cerrarSesion={
                  cerrarSesion
                }
              />

            </Offcanvas.Body>

          </Offcanvas>

        )}

        {esDesktop && (

          <div className="sidebar-custom d-flex flex-column">

            <ContenidoSidebarAdmin
              activo={activo}
              manejarNavegacion={
                manejarNavegacion
              }
              cerrarSesion={
                cerrarSesion
              }
            />

          </div>

        )}
      </>
    );

  }

  return null;

};

const ContenidoSidebarAdmin = ({
  activo,
  manejarNavegacion,
  cerrarSesion,
}) => (

  <>
    <div className="sidebar-header">

      <h5>TapMeal</h5>

      <small>
        Panel Administrativo
      </small>

    </div>

    <hr className="sidebar-divider" />

    <Nav className="flex-column menu-sidebar">

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/productos"
          )
        }
        className={activo(
          "/productos"
        )}
      >
        Platillos
      </Nav.Link>

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/categorias"
          )
        }
        className={activo(
          "/categorias"
        )}
      >
        Categorías
      </Nav.Link>

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/clientes"
          )
        }
        className={activo(
          "/clientes"
        )}
      >
        Clientes
      </Nav.Link>

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/pedidos"
          )
        }
        className={activo(
          "/pedidos"
        )}
      >
        Pedidos
      </Nav.Link>

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/mesas"
          )
        }
        className={activo(
          "/mesas"
        )}
      >
        Mesas
      </Nav.Link>

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/extras"
          )
        }
        className={activo(
          "/extras"
        )}
      >
        Extras
      </Nav.Link>

      <Nav.Link
        onClick={() =>
          manejarNavegacion(
            "/salsas"
          )
        }
        className={activo(
          "/salsas"
        )}
      >
        Salsas
      </Nav.Link>

    </Nav>

    <div className="mt-auto p-3">

      <button
        className="btn btn-cerrar-sesion w-100"
        onClick={cerrarSesion}
      >
        Cerrar Sesión
      </button>

    </div>
  </>
);

export default Encabezado;

