import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Encabezado from "./components/navegacion/Encabezado";
import { CarritoProveedor } from "./components/contexto/CarritoContexto";

// Vistas públicas
import Inicio from "./views/Inicio";
import Login from "./views/Login";
import RegistroCliente from "./views/RegistroCliente";
import Menu from "./views/Menu";
import Carrito from "./views/Carrito";
import PedidosCliente from "./views/PedidosCliente";
import DetallePedidoCliente from "./views/DetallePedidoCliente";
import Cuenta from "./views/Cuenta";

// NUEVAS VISTAS
import EstadoPedidoMesa from "./views/EstadoPedidoMesa";

// Vistas admin
import Categorias from "./views/Categorias";
import Productos from "./views/Platillos";
import Clientes from "./views/Clientes";
import Mesas from "./views/Mesas";
import Pedidos from "./views/Pedidos";
import Extras from "./views/Extras";
import Salsas from "./views/Salsas";
import MenuAdmin from "./views/MenuAdmin";
import Estadisticas from "./views/Estadisticas";

import RutaProtegida from "./components/rutas/RutaProtegida";
import Pagina404 from "./views/Pagina404";
import "./App.css";

const RUTAS_SIN_MARGEN = [
  "/", "/login", "/registro", "/menu", "/carrito",
  "/pedidosCliente", "/historial", "/cuenta",
];

const AppContenido = () => {
  const location = useLocation();
  const sinMargen = RUTAS_SIN_MARGEN.includes(location.pathname) 
    || location.pathname.startsWith('/pedidoCliente/')
    || location.pathname.startsWith('/menu/');

  return (
    <>
      <Encabezado />
      <main className={sinMargen ? "" : "margen-superior-main"}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/"         element={<Inicio />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<RegistroCliente />} />
          <Route path="/menu"     element={<Menu />} />
          <Route path="/menu/:idMesa" element={<Menu />} />
          <Route path="/carrito"  element={<Carrito />} />

          {/* Ruta para clientes */}
          <Route path="/pedidosCliente" element={<PedidosCliente />} />
          <Route path="/pedidoCliente/:id" element={<DetallePedidoCliente />} />
          <Route path="/cuenta"  element={<Cuenta />} />

          <Route path="/estado-mesa/:idMesa" element={<RutaProtegida rolRequerido="admin"><EstadoPedidoMesa /></RutaProtegida>} />
          {/* Rutas del Admin */}
          <Route path="/categorias" element={<RutaProtegida rolRequerido="admin"><Categorias /></RutaProtegida>} />
          <Route path="/productos"  element={<RutaProtegida rolRequerido="admin"><Productos /></RutaProtegida>} />
          <Route path="/clientes"   element={<RutaProtegida rolRequerido="admin"><Clientes /></RutaProtegida>} />
          <Route path="/mesas"      element={<RutaProtegida rolRequerido="admin"><Mesas /></RutaProtegida>} />
          <Route path="/pedidos"    element={<RutaProtegida rolRequerido="admin"><Pedidos /></RutaProtegida>} />
          <Route path="/extras"     element={<RutaProtegida rolRequerido="admin"><Extras /></RutaProtegida>} />
          <Route path="/salsas"     element={<RutaProtegida rolRequerido="admin"><Salsas /></RutaProtegida>} />
          <Route path="/menu-admin" element={<RutaProtegida rolRequerido="admin"><MenuAdmin /></RutaProtegida>} />
          <Route path="/estadisticas" element={<RutaProtegida rolRequerido="admin"><Estadisticas /></RutaProtegida>} />

          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
    </>
  );
};


const App = () => (
  <Router>
    <CarritoProveedor>
      <AppContenido />
    </CarritoProveedor>
  </Router>
);

export default App;
