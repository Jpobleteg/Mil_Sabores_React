import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useStore.js";

export const BLOGS = [
  {
    slug: "torta-mas-grande",
    fecha: "2026-08-12", fechaTexto: "12 de agosto de 2026", tipo: "Dato curioso",
    titulo: "Caso curioso #1: la torta más grande del mundo",
    resumen: "En 1995 nuestros pasteleros se unieron a cientos de voluntarios para romper un récord Guinness. Te contamos cómo se organizó y cuántos huevos hicieron falta.",
    imagen: "/img/blog/guinness.svg", alt: "Torta gigante de tres pisos con el año 1995"
  },
  {
    slug: "torta-de-manjar",
    fecha: "2026-09-03", fechaTexto: "3 de septiembre de 2026", tipo: "Receta",
    titulo: "Caso curioso #2: el secreto de la torta de manjar",
    resumen: "Estudiantes de gastronomía de Duoc comparten sus consejos para lograr un manjar perfecto y una torta de manjar nuez digna de Fiestas Patrias.",
    imagen: "/img/blog/manjar.svg", alt: "Torta de manjar junto a un frasco de manjar"
  }
];

export default function Blogs() {
  useTitulo("Blogs | Pastelería Mil Sabores");
  return (
    <div className="contenedor">
      <header className="seccion-titulo" style={{ marginTop: 32 }}>
        <h1>Noticias importantes</h1>
        <p>Historias, recetas y consejos de nuestros pasteleros y de los estudiantes de gastronomía de Duoc.</p>
      </header>
      <div className="blog-lista">
        {BLOGS.map(b => (
          <article key={b.slug} className="blog-tarjeta">
            <div>
              <p className="fecha"><time dateTime={b.fecha}>{b.fechaTexto}</time> · {b.tipo}</p>
              <h2>{b.titulo}</h2>
              <p>{b.resumen}</p>
              <Link className="btn" to={`/blogs/${b.slug}`}>Ver caso</Link>
            </div>
            <img src={b.imagen} alt={b.alt} width="400" height="300" />
          </article>
        ))}
      </div>
    </div>
  );
}
