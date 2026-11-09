import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Carrito, Sesion } from "../lib/store.js";
import { useStore } from "../hooks/useStore.js";

const MENU = [
  { to: "/", texto: "Home", end: true },
  { to: "/productos", texto: "Productos" },
  { to: "/nosotros", texto: "Nosotros" },
  { to: "/blogs", texto: "Blogs" },
  { to: "/contacto", texto: "Contacto" }
];

export default function Header() {
  useStore();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();

  /* Cierra el menú móvil al cambiar de página */
  useEffect(() => { setAbierto(false); }, [pathname]);

  return (
    <>
      <header className="header">
        <div className="contenedor">
          <Link className="logo" to="/" aria-label="Pastelería Mil Sabores, ir al inicio">
            <img src="/img/logo.svg" alt="Logo Pastelería Mil Sabores" width="48" height="48" />
            <span>Mil Sabores<small>PASTELERÍA · DESDE 1976</small></span>
          </Link>
          <button className="menu-toggle" type="button" aria-expanded={abierto} aria-controls="menu-principal"
            aria-label="Abrir menú" onClick={() => setAbierto(a => !a)}>☰</button>
          <nav className={`nav${abierto ? " abierto" : ""}`} id="menu-principal" aria-label="Menú principal">
            <ul>
              {MENU.map(m => (
                <li key={m.to}><NavLink to={m.to} end={m.end}>{m.texto}</NavLink></li>
              ))}
            </ul>
          </nav>
          <Link className="carrito-link" to="/carrito" aria-label="Ver carrito de compras">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 2h2.3l3.4 11.2a2 2 0 0 0 1.9 1.4h7.9a2 2 0 0 0 1.9-1.5L23 6H6.2l-.9-3A1.5 1.5 0 0 0 3.9 2z" /></svg>
            {" "}Carrito <span className="contador-carrito">{Carrito.cantidadTotal()}</span>
          </Link>
        </div>
      </header>
      <BarraSesion />
    </>
  );
}

function BarraSesion() {
  const navigate = useNavigate();
  const s = Sesion.actual();

  const salir = () => {
    Sesion.cerrar();
    navigate("/");
  };

  return (
    <div className="barra-sesion">
      <div className="contenedor" id="zona-sesion">
        {!s ? (
          <><Link to="/login">Iniciar sesión</Link> | <Link to="/registro">Registrar usuario</Link></>
        ) : (
          <>
            Hola, <strong>{s.nombre}</strong>
            {(s.tipo === "Administrador" || s.tipo === "Vendedor") && <> | <Link to="/admin">Panel {s.tipo.toLowerCase()}</Link></>}
            {" | "}<Link to="/perfil">Mi perfil</Link>{" | "}
            <button type="button" className="link-btn" onClick={salir}>Cerrar sesión</button>
          </>
        )}
      </div>
    </div>
  );
}
