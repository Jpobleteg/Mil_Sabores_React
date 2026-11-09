import { Link, useParams } from "react-router-dom";
import { useTitulo } from "../hooks/useStore.js";
import NoEncontrado from "./NoEncontrado.jsx";
import Migas from "../components/Migas.jsx";

function MigasBlog({ texto }) {
  return <Migas items={[{ texto: "Home", to: "/" }, { texto: "Blogs", to: "/blogs" }, { texto }]} />;
}

function TortaMasGrande() {
  useTitulo("La torta más grande del mundo | Pastelería Mil Sabores");
  return (
    <article className="articulo container py-3" style={{ maxWidth: 820 }}>
      <MigasBlog texto="Caso curioso #1" />
      <header>
        <p className="text-body-secondary"><time dateTime="2026-08-12">12 de agosto de 2026</time> · Dato curioso</p>
        <h1>La torta más grande del mundo</h1>
      </header>
      <img src="/img/blog/guinness.svg" alt="Torta gigante de tres pisos con el año 1995" width="400" height="300" className="img-fluid w-100 mb-3" />
      <p>Corría 1995 cuando Pastelería Mil Sabores recibió una invitación poco común: sumarse a un equipo de pasteleros que buscaba preparar la torta más grande del mundo. Durante semanas, nuestros maestros coordinaron turnos, recetas y transporte para que cada capa llegara fresca al lugar del evento.</p>
      <h2>Una cocina de cientos de manos</h2>
      <p>El desafío no era solo el tamaño: había que mantener el mismo sabor y textura en cada sección. Por eso se estandarizaron las recetas de bizcocho y relleno, y se repartieron tareas entre equipos que trabajaban en paralelo.</p>
      <blockquote>“Lo más difícil no fue hornear, fue lograr que todas las piezas encajaran como una sola torta”, recuerda uno de nuestros pasteleros fundadores.</blockquote>
      <h2>Lo que aprendimos</h2>
      <ul>
        <li>La planificación es tan importante como la receta.</li>
        <li>Trabajar en equipo permite lograr lo que parece imposible.</li>
        <li>Una celebración compartida se recuerda por décadas.</li>
      </ul>
      <p>Treinta y un años después, ese espíritu sigue presente en cada torta que preparamos.</p>
      <p>
        <Link className="btn btn-outline-primary" to="/blogs">← Volver a blogs</Link>{" "}
        <Link className="btn btn-primary" to="/categorias/tortas-especiales">Ver tortas especiales</Link>
      </p>
    </article>
  );
}

function TortaDeManjar() {
  useTitulo("El secreto de la torta de manjar | Pastelería Mil Sabores");
  return (
    <article className="articulo container py-3" style={{ maxWidth: 820 }}>
      <MigasBlog texto="Caso curioso #2" />
      <header>
        <p className="text-body-secondary"><time dateTime="2026-09-03">3 de septiembre de 2026</time> · Receta</p>
        <h1>El secreto de la torta de manjar</h1>
      </header>
      <img src="/img/blog/manjar.svg" alt="Torta de manjar junto a un frasco de manjar" width="400" height="300" className="img-fluid w-100 mb-3" />
      <p>La torta de manjar nuez es una de las favoritas en Chile, sobre todo en septiembre. Le pedimos a estudiantes de gastronomía de Duoc UC que nos compartieran sus mejores consejos.</p>
      <h2>Consejos de los estudiantes</h2>
      <ol>
        <li><strong>Bizcocho aireado:</strong> bate las claras a punto de nieve y únelas con movimientos envolventes.</li>
        <li><strong>Remojo justo:</strong> humedece el bizcocho con almíbar tibio, sin empaparlo.</li>
        <li><strong>Manjar a temperatura ambiente:</strong> así se esparce sin romper las capas.</li>
        <li><strong>Nueces tostadas:</strong> unos minutos en sartén realzan su sabor.</li>
      </ol>
      <h2>Mira cómo se prepara</h2>
      <div className="ratio ratio-16x9 mb-3">
        <iframe src="https://www.youtube-nocookie.com/embed/9saCoPwW-5k" title="Video: preparación de torta manjar nuez" loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      <p>¿No tienes tiempo de prepararla? Nuestra <Link to="/productos/TT002">Torta Circular de Manjar</Link> sigue la receta tradicional de la casa.</p>
      <p><Link className="btn btn-outline-primary" to="/blogs">← Volver a blogs</Link></p>
    </article>
  );
}

const ARTICULOS = { "torta-mas-grande": TortaMasGrande, "torta-de-manjar": TortaDeManjar };

export default function BlogDetalle() {
  const { slug } = useParams();
  const Articulo = ARTICULOS[slug];
  return Articulo ? <Articulo /> : <NoEncontrado />;
}
