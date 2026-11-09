import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

/* Estructura común de la tienda: header + barra de sesión + contenido + footer */
export default function LayoutTienda() {
  return (
    <>
      <Header />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
