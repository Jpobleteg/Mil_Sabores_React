import { useState } from "react";
import { Link } from "react-router-dom";
import { Validar } from "../lib/validaciones.js";
import { useAvisos } from "../context/AvisosContext.jsx";

const CATEGORIAS_FOOTER = [
  ["tortas-cuadradas", "Tortas cuadradas"],
  ["tortas-circulares", "Tortas circulares"],
  ["sin-azucar", "Sin azúcar"],
  ["veganos", "Veganos"]
];

/* Pie de página: 4 columnas en escritorio, 2 en tablet y 1 en móvil (grilla de Bootstrap) */
export default function Footer() {
  return (
    <footer className="footer-ms mt-5 pt-5 pb-3">
      <div className="container">
        <div className="row g-4">
          <section className="col-12 col-md-6 col-lg-3">
            <h2>Mil Sabores</h2>
            <p>50 años endulzando Chile. Parte del récord Guinness de la torta más grande del mundo (1995).</p>
            <div className="pagos d-flex gap-2 flex-wrap" aria-label="Medios de pago aceptados"><span>VISA</span><span>MASTERCARD</span><span>REDCOMPRA</span></div>
          </section>
          <nav className="col-12 col-md-6 col-lg-3" aria-label="Categorías destacadas">
            <h2>Categorías</h2>
            <ul className="list-unstyled">
              {CATEGORIAS_FOOTER.map(([id, texto]) => (
                <li key={id}><Link to={`/categorias/${id}`}>{texto}</Link></li>
              ))}
              <li><Link to="/ofertas">Ofertas</Link></li>
            </ul>
          </nav>
          <section className="col-12 col-md-6 col-lg-3">
            <h2>Contacto</h2>
            <address className="mb-2">
              Av. Providencia 1976, Santiago<br />
              <a href="tel:+56912345678">+56 9 1234 5678</a><br />
              <a href="mailto:contacto@milsabores.cl">contacto@milsabores.cl</a>
            </address>
            <p><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></p>
          </section>
          <Newsletter />
        </div>
        <p className="text-center small mt-4 mb-0 opacity-75">© 2026 Pastelería Mil Sabores · Proyecto académico DSY1104 Duoc UC</p>
      </div>
    </footer>
  );
}

function Newsletter() {
  const avisar = useAvisos();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");

  const enviar = e => {
    e.preventDefault();
    const err = Validar.requerido(correo, "El correo") || Validar.correo(correo);
    setError(err);
    if (!err) {
      avisar("¡Gracias! Te avisaremos de nuestras novedades.");
      setCorreo("");
    }
  };

  return (
    <section className="col-12 col-md-6 col-lg-3">
      <h2>Newsletter</h2>
      <p>Recibe promociones y recetas de los estudiantes de gastronomía Duoc.</p>
      <form id="form-newsletter" noValidate onSubmit={enviar} className="input-group">
        <label htmlFor="news-correo" className="visually-hidden">Correo electrónico</label>
        <input type="email" id="news-correo" placeholder="tu@gmail.com" autoComplete="email"
          value={correo} onChange={e => setCorreo(e.target.value)} className={`form-control${error ? " is-invalid" : ""}`} />
        <button className="btn btn-rosa" type="submit">Suscribir</button>
      </form>
      {error && <div className="small mt-1 text-warning fw-bold" role="alert">{error}</div>}
    </section>
  );
}
