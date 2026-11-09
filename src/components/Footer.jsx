import { useState } from "react";
import { Link } from "react-router-dom";
import { Validar } from "../lib/validaciones.js";
import { useAvisos } from "../context/AvisosContext.jsx";

const CATEGORIAS_FOOTER = [
  ["Tortas Cuadradas", "Tortas cuadradas"],
  ["Tortas Circulares", "Tortas circulares"],
  ["Productos Sin Azúcar", "Sin azúcar"],
  ["Productos Vegana", "Veganos"]
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor">
        <section>
          <h2>Mil Sabores</h2>
          <p>50 años endulzando Chile. Parte del récord Guinness de la torta más grande del mundo (1995).</p>
          <div className="pagos" aria-label="Medios de pago aceptados"><span>VISA</span><span>MASTERCARD</span><span>REDCOMPRA</span></div>
        </section>
        <nav aria-label="Categorías destacadas">
          <h2>Categorías</h2>
          <ul>
            {CATEGORIAS_FOOTER.map(([cat, texto]) => (
              <li key={cat}><Link to={`/productos?categoria=${encodeURIComponent(cat)}`}>{texto}</Link></li>
            ))}
          </ul>
        </nav>
        <section>
          <h2>Contacto</h2>
          <address>
            Av. Providencia 1976, Santiago<br />
            <a href="tel:+56912345678">+56 9 1234 5678</a><br />
            <a href="mailto:contacto@milsabores.cl">contacto@milsabores.cl</a>
          </address>
          <p><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></p>
        </section>
        <Newsletter />
      </div>
      <p className="legal">© 2026 Pastelería Mil Sabores · Proyecto académico DSY1104 Duoc UC</p>
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
    <section>
      <h2>Newsletter</h2>
      <p>Recibe promociones y recetas de los estudiantes de gastronomía Duoc.</p>
      <form id="form-newsletter" noValidate onSubmit={enviar}>
        <label htmlFor="news-correo" className="oculto-visual">Correo electrónico</label>
        <input type="email" id="news-correo" placeholder="tu@gmail.com" autoComplete="email"
          value={correo} onChange={e => setCorreo(e.target.value)} className={error ? "invalido" : undefined} />
        <button className="btn btn-rosa btn-chico" type="submit">Suscribir</button>
      </form>
      <small className="error" aria-live="polite">{error}</small>
    </section>
  );
}
