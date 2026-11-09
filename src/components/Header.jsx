import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Carrito, Categorias, Sesion, formatoCLP } from "../lib/store.js";
import { useStore } from "../hooks/useStore.js";

/* Barra de navegación responsiva (navbar de Bootstrap).
   En pantallas pequeñas el menú se colapsa y se abre con el botón ☰;
   el estado "abierto" lo maneja React (no se usa el JS de Bootstrap). */
export default function Header() {
  useStore();
  const [abierto, setAbierto] = useState(false);
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);

  /* Cierra los menús al cambiar de página */
  useEffect(() => { setAbierto(false); setCategoriasAbierto(false); }, [pathname]);

  /* Cierra el desplegable de categorías al hacer clic fuera */
  useEffect(() => {
    const cerrar = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setCategoriasAbierto(false); };
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  const total = Carrito.resumen().total;
  const cantidad = Carrito.cantidadTotal();

  return (
    <header className="sticky-top shadow-sm">
      {/* Fila principal: logo, menú y carrito (como el diseño original) */}
      <nav className="navbar navbar-expand-lg navbar-ms py-2" aria-label="Menú principal">
        <div className="container">
          <Link className="navbar-brand-ms d-flex align-items-center gap-2 me-3" to="/" aria-label="Pastelería Mil Sabores, ir al inicio">
            <img src="/img/logo.svg" alt="" width="44" height="44" className="rounded-circle" />
            <span className="text-nowrap">Mil Sabores<small>PASTELERÍA · DESDE 1976</small></span>
          </Link>
          <div className="d-flex align-items-center gap-1 order-lg-last ms-auto ms-lg-3">
            <Link className="btn btn-carrito text-nowrap" to="/carrito" aria-label={`Ver carrito: ${cantidad} productos`}>
              <IconoCarrito /><span className="d-none d-sm-inline"> Carrito</span> <span className="badge">{cantidad}</span>
              {cantidad > 0 && <span className="d-none d-xl-inline ms-1">{formatoCLP(total).replace(" CLP", "")}</span>}
            </Link>
            <button className="btn btn-outline-primary btn-sm d-lg-none" type="button" aria-controls="menu-principal" aria-expanded={abierto}
              aria-label="Abrir menú" onClick={() => setAbierto(a => !a)}>☰</button>
          </div>
          <div className={`collapse navbar-collapse${abierto ? " show" : ""}`} id="menu-principal">
            <ul className="navbar-nav ms-auto gap-lg-1">
              <li className="nav-item"><NavLink className="nav-link" to="/" end>Home</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/productos">Productos</NavLink></li>
              <li className="nav-item dropdown" ref={dropdownRef}>
                <button type="button" className={`nav-link dropdown-toggle btn btn-link${pathname.startsWith("/categorias") ? " active" : ""}`}
                  aria-expanded={categoriasAbierto} onClick={() => setCategoriasAbierto(a => !a)}>Categorías</button>
                <ul className={`dropdown-menu${categoriasAbierto ? " show" : ""}`}>
                  <li><Link className="dropdown-item" to="/categorias">Todas las categorías</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  {Categorias.todas().map(c => (
                    <li key={c.id}><Link className="dropdown-item" to={`/categorias/${c.id}`}>{c.nombre}</Link></li>
                  ))}
                </ul>
              </li>
              <li className="nav-item"><NavLink className="nav-link" to="/ofertas">Ofertas</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/nosotros">Nosotros</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/blogs">Blogs</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/contacto">Contacto</NavLink></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Barra rosa oscuro: buscador y sesión */}
      <div className="barra-sesion-ms small">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2 py-1">
          <Buscador />
          <ZonaSesion />
        </div>
      </div>
    </header>
  );
}

/* Ícono de carrito (SVG, el mismo del diseño original) */
function IconoCarrito() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor" style={{ verticalAlign: "-3px" }}>
      <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 2h2.3l3.4 11.2a2 2 0 0 0 1.9 1.4h7.9a2 2 0 0 0 1.9-1.5L23 6H6.2l-.9-3A1.5 1.5 0 0 0 3.9 2z" />
    </svg>
  );
}

/* Buscador: envía al catálogo con el texto en la URL (?q=) */
function Buscador() {
  const [texto, setTexto] = useState("");
  const navigate = useNavigate();
  const buscar = e => {
    e.preventDefault();
    navigate(`/productos${texto.trim() ? `?q=${encodeURIComponent(texto.trim())}` : ""}`);
    setTexto("");
  };
  return (
    <form className="d-flex flex-grow-1" style={{ maxWidth: 360 }} role="search" onSubmit={buscar}>
      <label htmlFor="buscador-header" className="visually-hidden">Buscar productos</label>
      <input id="buscador-header" className="form-control form-control-sm me-2" type="search" placeholder="Buscar…"
        value={texto} onChange={e => setTexto(e.target.value)} />
      <button className="btn btn-light btn-sm" type="submit">Buscar</button>
    </form>
  );
}

/* Botones de sesión: Iniciar sesión / Crear cuenta, o menú del usuario conectado */
function ZonaSesion() {
  const navigate = useNavigate();
  const s = Sesion.actual();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const cerrar = e => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  const salir = () => {
    setAbierto(false);
    Sesion.cerrar();
    navigate("/");
  };

  if (!s) {
    return (
      <div className="d-flex gap-2" id="zona-sesion">
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/registro">Registrar usuario</Link>
      </div>
    );
  }
  return (
    <div className="dropdown" ref={ref} id="zona-sesion">
      <button type="button" className="btn btn-link btn-sm dropdown-toggle text-nowrap text-white p-0" aria-expanded={abierto} onClick={() => setAbierto(a => !a)}>
        Hola, {s.nombre}
      </button>
      <ul className={`dropdown-menu dropdown-menu-end${abierto ? " show" : ""}`}>
        {(s.tipo === "Administrador" || s.tipo === "Vendedor") && <li><Link className="dropdown-item" to="/admin" onClick={() => setAbierto(false)}>Panel {s.tipo.toLowerCase()}</Link></li>}
        <li><Link className="dropdown-item" to="/perfil" onClick={() => setAbierto(false)}>Mi perfil</Link></li>
        <li><hr className="dropdown-divider" /></li>
        <li><button type="button" className="dropdown-item text-danger" onClick={salir}>Cerrar sesión</button></li>
      </ul>
    </div>
  );
}
