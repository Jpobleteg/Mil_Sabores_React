import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sesion } from "../../lib/store.js";

const MENU = [
  { to: "/admin", icono: "📊", texto: "Dashboard", roles: ["Administrador", "Vendedor"], end: true },
  { to: "/admin/ordenes", icono: "🧾", texto: "Órdenes", roles: ["Administrador", "Vendedor"] },
  { to: "/admin/productos", icono: "🎂", texto: "Productos", roles: ["Administrador", "Vendedor"] },
  { to: "/admin/usuarios", icono: "👥", texto: "Usuarios", roles: ["Administrador"] }
];

/* Estructura del panel: menú lateral + contenido.
   Cada página recibe por contexto la función para abrir el menú en móviles. */
export default function LayoutAdmin() {
  const s = Sesion.actual();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => { setAbierto(false); }, [pathname]);

  const salir = () => {
    Sesion.cerrar();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin">
      <aside className={`admin-menu${abierto ? " abierto" : ""}`} id="admin-menu" aria-label="Menú del administrador">
        <Link className="logo" to="/admin">
          <img src="/img/logo.svg" alt="" width="42" height="42" />
          <span>Mil Sabores<small>ADMINISTRADOR</small></span>
        </Link>
        <nav aria-label="Secciones del panel">
          <ul>
            {MENU.filter(m => m.roles.includes(s.tipo)).map(m => (
              <li key={m.to}>
                <NavLink to={m.to} end={m.end}><span className="icono" aria-hidden="true">{m.icono}</span>{m.texto}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="abajo">
          <ul>
            <li><Link to="/"><span className="icono" aria-hidden="true">🏪</span>Ver tienda</Link></li>
            <li><button type="button" className="link-menu" onClick={salir}><span className="icono" aria-hidden="true">🚪</span>Cerrar sesión</button></li>
          </ul>
          <p className="perfil-admin">{s.nombre} · {s.tipo}</p>
        </div>
      </aside>
      <main className="admin-contenido" id="contenido">
        <Outlet context={{ abrirMenu: () => setAbierto(a => !a), menuAbierto: abierto, sesion: s, esAdmin: s.tipo === "Administrador" }} />
      </main>
    </div>
  );
}
