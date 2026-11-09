import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sesion } from "../../lib/store.js";
import { useStore } from "../../hooks/useStore.js";
import { menuPara } from "./menuAdmin.js";

/* Estructura del panel: menú lateral + contenido.
   En pantallas grandes el menú está fijo; en móvil se abre con "☰ Menú".
   Las páginas reciben por contexto: abrirMenu, sesion y esAdmin. */
export default function LayoutAdmin() {
  useStore();
  const s = Sesion.actual();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => { setAbierto(false); }, [pathname]);

  const salir = () => {
    Sesion.cerrar();
    navigate("/login", { replace: true });
  };

  if (!s) return null;

  return (
    <div className="admin-ms d-flex">
      <aside className={`admin-sidebar d-flex flex-column p-3${abierto ? " abierto" : ""}`} id="admin-menu" aria-label="Menú del administrador">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link className="marca d-flex align-items-center gap-2" to="/admin">
            <img src="/img/logo.svg" alt="" width="36" height="36" /> Mil Sabores
          </Link>
          <button type="button" className="btn btn-sm btn-outline-light d-lg-none" aria-label="Cerrar menú" onClick={() => setAbierto(false)}>✕</button>
        </div>
        <nav aria-label="Secciones del panel">
          <ul className="nav nav-pills flex-column gap-1">
            {menuPara(s.tipo).map(m => (
              <li className="nav-item" key={m.to}>
                <NavLink className="nav-link" to={m.to} end={m.end}><span aria-hidden="true" className="me-2">{m.icono}</span>{m.texto}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-3 border-top border-light border-opacity-25 d-grid gap-2">
          <Link to="/" className="btn btn-dark">🏪 Tienda</Link>
          <button type="button" className="btn btn-danger" onClick={salir}>Cerrar sesión</button>
          <small className="text-center opacity-75">{s.nombre} · {s.tipo}</small>
        </div>
      </aside>
      {abierto && <div className="modal-backdrop fade show d-lg-none" onClick={() => setAbierto(false)} />}
      <main className="flex-grow-1 p-3 p-lg-4" id="contenido" style={{ minWidth: 0 }}>
        <Outlet context={{ abrirMenu: () => setAbierto(a => !a), menuAbierto: abierto, sesion: s, esAdmin: s.tipo === "Administrador" }} />
      </main>
    </div>
  );
}
