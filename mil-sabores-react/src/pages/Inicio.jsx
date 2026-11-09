import { Link } from "react-router-dom";
import { Categorias, Productos } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import GrillaProductos from "../components/GrillaProductos.jsx";

const BENEFICIOS = [
  ["50%", "de descuento en todos los productos para clientes de 50 años o más."],
  ["10%", <>de por vida al registrarte con el código <b>FELICES50</b>.</>],
  ["Gratis", "una torta en tu cumpleaños si eres estudiante Duoc y te registras con tu correo @duoc.cl."]
];

export default function Inicio() {
  useStore();
  useTitulo("Inicio | Pastelería Mil Sabores");
  const destacados = Productos.todos().filter(p => p.stock > 0).slice(0, 8);
  const ofertas = Productos.ofertas().slice(0, 4);

  return (
    <>
      <section className="py-4 py-lg-5" aria-labelledby="titulo-hero">
        <div className="container">
          <div className="hero-ms p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-12 col-lg-6">
                <span className="etiqueta-ms mb-3">50 aniversario · 1976 – 2026</span>
                <h1 id="titulo-hero" className="display-5">Tienda online Mil Sabores</h1>
                <p className="lead">Tortas y productos de repostería de alta calidad para todas las ocasiones. Celebramos nuestras raíces con recetas tradicionales y la creatividad de los nuevos talentos de la gastronomía chilena.</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link className="btn btn-primary btn-lg" to="/productos">Ver productos</Link>
                  <Link className="btn btn-outline-primary btn-lg" to="/registro">Regístrate y obtén descuentos</Link>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-center">
                <img src="/img/hero.svg" alt="Torta de cumpleaños rosada con una vela" className="img-fluid rounded-4" width="400" height="300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 bg-white" aria-labelledby="titulo-beneficios">
        <div className="container">
          <header className="text-center mb-4">
            <h2 id="titulo-beneficios">Beneficios por nuestros 50 años</h2>
            <p className="text-body-secondary">Regístrate y los descuentos se aplican solos en tu carrito.</p>
          </header>
          <div className="row g-3 row-cols-1 row-cols-md-3">
            {BENEFICIOS.map(([n, t]) => (
              <div className="col" key={n}>
                <article className="card h-100 text-center bg-crema border-0 p-3">
                  <strong className="titulo-marca display-6">{n}</strong>
                  <p className="mb-0">{t}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ofertas.length > 0 && (
        <section className="py-5" aria-labelledby="titulo-ofertas">
          <div className="container">
            <header className="d-flex flex-wrap justify-content-between align-items-end mb-3 gap-2">
              <h2 id="titulo-ofertas" className="mb-0">Ofertas de la semana</h2>
              <Link to="/ofertas" className="btn btn-outline-primary btn-sm">Ver todas las ofertas</Link>
            </header>
            <GrillaProductos productos={ofertas} />
          </div>
        </section>
      )}

      <section className="py-5 bg-white" aria-labelledby="titulo-categorias">
        <div className="container">
          <h2 id="titulo-categorias" className="text-center mb-4">Explora por categoría</h2>
          <div className="row g-3 row-cols-2 row-cols-md-4">
            {Categorias.todas().slice(0, 8).map(c => (
              <div className="col" key={c.id}>
                <Link to={`/categorias/${c.id}`} className="card card-categoria h-100 text-center p-2">
                  <img src={Categorias.imagen(c)} alt="" className="card-img-top rounded-3" />
                  <span className="fw-bold mt-2 small">{c.nombre}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" aria-labelledby="titulo-destacados">
        <div className="container">
          <header className="text-center mb-4">
            <h2 id="titulo-destacados">Nuestros productos</h2>
            <p className="text-body-secondary">Una selección de nuestras tortas y postres más pedidos.</p>
          </header>
          <GrillaProductos productos={destacados} />
          <p className="text-center mt-4"><Link className="btn btn-rosa btn-lg" to="/productos">Ver todo el catálogo</Link></p>
        </div>
      </section>

      <section className="py-5 bg-white" aria-labelledby="titulo-impacto">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <h2 id="titulo-impacto">Impacto comunitario</h2>
              <p>Parte de cada compra financia becas y prácticas para estudiantes de gastronomía de Duoc UC, que además comparten sus recetas y consejos en nuestro blog.</p>
              <ul>
                <li>Talleres gratuitos de repostería para la comunidad local.</li>
                <li>Prácticas profesionales en nuestra cocina.</li>
                <li>Recetas tradicionales preservadas y compartidas.</li>
              </ul>
              <Link className="btn btn-outline-primary" to="/nosotros">Conoce nuestra historia</Link>
            </div>
            <div className="col-12 col-md-6">
              <img src="/img/nosotros.svg" alt="Ilustración del equipo de pasteleros" className="img-fluid rounded-4" width="400" height="300" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
