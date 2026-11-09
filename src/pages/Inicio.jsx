import { Link } from "react-router-dom";
import { Productos } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import TarjetaProducto from "../components/TarjetaProducto.jsx";

export default function Inicio() {
  useStore();
  useTitulo("Inicio | Pastelería Mil Sabores");
  const destacados = Productos.todos().filter(p => p.stock > 0).slice(0, 8);

  return (
    <>
      <section className="hero" aria-labelledby="titulo-hero">
        <div className="contenedor">
          <div>
            <span className="etiqueta">🎂 50 aniversario · 1976 – 2026</span>
            <h1 id="titulo-hero">Tienda online Mil Sabores</h1>
            <p>Tortas y productos de repostería de alta calidad para todas las ocasiones. Celebramos nuestras raíces con recetas tradicionales y la creatividad de los nuevos talentos de la gastronomía chilena.</p>
            <div className="acciones">
              <Link className="btn" to="/productos">Ver productos</Link>
              <Link className="btn btn-borde" to="/registro">Regístrate y obtén descuentos</Link>
            </div>
          </div>
          <img src="/img/hero.svg" alt="Torta de cumpleaños rosada con una vela" width="400" height="300" />
        </div>
      </section>

      <section className="seccion franja" aria-labelledby="titulo-beneficios">
        <div className="contenedor">
          <header className="seccion-titulo">
            <h2 id="titulo-beneficios">Beneficios por nuestros 50 años</h2>
            <p>Regístrate y los descuentos se aplican solos en tu carrito.</p>
          </header>
          <div className="hitos">
            <article className="hito"><strong>50%</strong>de descuento en todos los productos para clientes de 50 años o más.</article>
            <article className="hito"><strong>10%</strong>de por vida al registrarte con el código <b>FELICES50</b>.</article>
            <article className="hito"><strong>Gratis</strong>una torta en tu cumpleaños si eres estudiante Duoc y te registras con tu correo @duoc.cl.</article>
          </div>
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-destacados">
        <div className="contenedor">
          <header className="seccion-titulo">
            <h2 id="titulo-destacados">Nuestros productos</h2>
            <p>Una selección de nuestras tortas y postres más pedidos.</p>
          </header>
          <div className="grilla-productos" aria-live="polite">
            {destacados.map(p => <TarjetaProducto key={p.codigo} producto={p} />)}
          </div>
          <p style={{ textAlign: "center", marginTop: 24 }}><Link className="btn btn-rosa" to="/productos">Ver todo el catálogo</Link></p>
        </div>
      </section>

      <section className="seccion franja" aria-labelledby="titulo-impacto">
        <div className="contenedor dos-columnas">
          <div>
            <h2 id="titulo-impacto">Impacto comunitario</h2>
            <p>Parte de cada compra financia becas y prácticas para estudiantes de gastronomía de Duoc UC, que además comparten sus recetas y consejos en nuestro blog.</p>
            <ul>
              <li>Talleres gratuitos de repostería para la comunidad local.</li>
              <li>Prácticas profesionales en nuestra cocina.</li>
              <li>Recetas tradicionales preservadas y compartidas.</li>
            </ul>
            <Link className="btn btn-borde" to="/nosotros">Conoce nuestra historia</Link>
          </div>
          <img src="/img/nosotros.svg" alt="Ilustración del equipo de pasteleros" width="400" height="300" style={{ borderRadius: 20 }} />
        </div>
      </section>
    </>
  );
}
