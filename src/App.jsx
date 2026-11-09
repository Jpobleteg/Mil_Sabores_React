import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LayoutTienda from "./components/LayoutTienda.jsx";
import Inicio from "./pages/Inicio.jsx";
import Productos from "./pages/Productos.jsx";
import Detalle from "./pages/Detalle.jsx";
import Categorias from "./pages/Categorias.jsx";
import Ofertas from "./pages/Ofertas.jsx";
import Carrito from "./pages/Carrito.jsx";
import Checkout from "./pages/Checkout.jsx";
import CompraExitosa from "./pages/CompraExitosa.jsx";
import PagoFallido from "./pages/PagoFallido.jsx";
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
import { ADMIN, ADMIN_Y_VENDEDOR } from "./components/admin/menuAdmin.js";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminOrdenes from "./pages/admin/AdminOrdenes.jsx";
import OrdenDetalle from "./pages/admin/OrdenDetalle.jsx";
import AdminProductos from "./pages/admin/AdminProductos.jsx";
import ProductosCriticos from "./pages/admin/ProductosCriticos.jsx";
import ProductoForm from "./pages/admin/ProductoForm.jsx";
import ProductoDetalle from "./pages/admin/ProductoDetalle.jsx";
import AdminCategorias from "./pages/admin/AdminCategorias.jsx";
import CategoriaForm from "./pages/admin/CategoriaForm.jsx";
import AdminUsuarios from "./pages/admin/AdminUsuarios.jsx";
import UsuarioForm from "./pages/admin/UsuarioForm.jsx";
import UsuarioDetalle from "./pages/admin/UsuarioDetalle.jsx";
import HistorialCompras from "./pages/admin/HistorialCompras.jsx";
import Reportes from "./pages/admin/Reportes.jsx";
import PerfilAdmin from "./pages/admin/PerfilAdmin.jsx";

const soloAdmin = elemento => <RequiereRol roles={ADMIN}>{elemento}</RequiereRol>;

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
          <Route path="categorias" element={<Categorias />} />
          <Route path="categorias/:id" element={<Categorias />} />
          <Route path="ofertas" element={<Ofertas />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="compra/exitosa/:numero" element={<CompraExitosa />} />
          <Route path="compra/error" element={<PagoFallido />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:slug" element={<BlogDetalle />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>

        {/* ---------- Panel administrador (Figura 10) ---------- */}
        <Route path="admin" element={<RequiereRol roles={ADMIN_Y_VENDEDOR}><LayoutAdmin /></RequiereRol>}>
          <Route index element={<Dashboard />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
          <Route path="ordenes/:numero" element={<OrdenDetalle />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/criticos" element={<ProductosCriticos />} />
          <Route path="productos/nuevo" element={soloAdmin(<ProductoForm />)} />
          <Route path="productos/:codigo" element={<ProductoDetalle />} />
          <Route path="productos/:codigo/editar" element={soloAdmin(<ProductoForm />)} />
          <Route path="categorias" element={soloAdmin(<AdminCategorias />)} />
          <Route path="categorias/nueva" element={soloAdmin(<CategoriaForm />)} />
          <Route path="categorias/:id/editar" element={soloAdmin(<CategoriaForm />)} />
          <Route path="usuarios" element={soloAdmin(<AdminUsuarios />)} />
          <Route path="usuarios/nuevo" element={soloAdmin(<UsuarioForm />)} />
          <Route path="usuarios/:run" element={soloAdmin(<UsuarioDetalle />)} />
          <Route path="usuarios/:run/editar" element={soloAdmin(<UsuarioForm />)} />
          <Route path="usuarios/:run/compras" element={soloAdmin(<HistorialCompras />)} />
          <Route path="reportes" element={soloAdmin(<Reportes />)} />
          <Route path="perfil" element={<PerfilAdmin />} />
        </Route>
      </Routes>
    </>
  );
}
