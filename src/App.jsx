import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LayoutTienda from "./components/LayoutTienda.jsx";
import Inicio from "./pages/Inicio.jsx";
import Productos from "./pages/Productos.jsx";
import Detalle from "./pages/Detalle.jsx";
import Carrito from "./pages/Carrito.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Perfil from "./pages/Perfil.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Blogs from "./pages/Blogs.jsx";
import BlogDetalle from "./pages/BlogDetalle.jsx";
import Contacto from "./pages/Contacto.jsx";
import NoEncontrado from "./pages/NoEncontrado.jsx";

import RequiereRol from "./components/admin/RequiereRol.jsx";
import LayoutAdmin from "./components/admin/LayoutAdmin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminOrdenes from "./pages/admin/AdminOrdenes.jsx";
import AdminProductos from "./pages/admin/AdminProductos.jsx";
import ProductoForm from "./pages/admin/ProductoForm.jsx";
import ProductoDetalle from "./pages/admin/ProductoDetalle.jsx";
import AdminUsuarios from "./pages/admin/AdminUsuarios.jsx";
import UsuarioForm from "./pages/admin/UsuarioForm.jsx";
import UsuarioDetalle from "./pages/admin/UsuarioDetalle.jsx";

const SOLO_ADMIN = ["Administrador"];
const ADMIN_Y_VENDEDOR = ["Administrador", "Vendedor"];
const soloAdmin = elemento => <RequiereRol roles={SOLO_ADMIN}>{elemento}</RequiereRol>;

/* Vuelve arriba al cambiar de página */
function SubirAlCambiar() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <SubirAlCambiar />
      <Routes>
        {/* ---------- Tienda ---------- */}
        <Route element={<LayoutTienda />}>
          <Route index element={<Inicio />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/:codigo" element={<Detalle />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:slug" element={<BlogDetalle />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>

        {/* ---------- Panel administrador ---------- */}
        <Route path="admin" element={<RequiereRol roles={ADMIN_Y_VENDEDOR}><LayoutAdmin /></RequiereRol>}>
          <Route index element={<Dashboard />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={soloAdmin(<ProductoForm />)} />
          <Route path="productos/:codigo" element={<ProductoDetalle />} />
          <Route path="productos/:codigo/editar" element={soloAdmin(<ProductoForm />)} />
          <Route path="usuarios" element={soloAdmin(<AdminUsuarios />)} />
          <Route path="usuarios/nuevo" element={soloAdmin(<UsuarioForm />)} />
          <Route path="usuarios/:run" element={soloAdmin(<UsuarioDetalle />)} />
          <Route path="usuarios/:run/editar" element={soloAdmin(<UsuarioForm />)} />
        </Route>
      </Routes>
    </>
  );
}
