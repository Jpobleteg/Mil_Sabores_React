import { useTitulo } from "../hooks/useStore.js";

const EQUIPO = [
  { id: "I1", nombre: "Integrante 1", rol: "Tienda: home, catálogo, detalle de producto y carrito." },
  { id: "I2", nombre: "Integrante 2", rol: "Formularios: registro, inicio de sesión, contacto y validaciones JavaScript." },
  { id: "I3", nombre: "Integrante 3", rol: "Panel administrador: mantenedores de productos, usuarios y órdenes." }
];

export default function Nosotros() {
  useTitulo("Nosotros | Pastelería Mil Sabores");
  return (
    <>
      <section className="seccion" aria-labelledby="titulo-nosotros">
        <div className="contenedor dos-columnas">
          <div>
            <h1 id="titulo-nosotros">Nuestra historia</h1>
            <p>Pastelería Mil Sabores nació en 1976 como un pequeño local de barrio en Santiago. Cincuenta años después somos un referente de la repostería chilena, con recetas que pasan de generación en generación.</p>
            <p>En 1995 fuimos parte del equipo que creó la torta más grande del mundo, un récord Guinness que todavía nos llena de orgullo. Hoy renovamos nuestra tienda online para que disfrutes esa misma tradición desde tu casa.</p>
          </div>
          <img src="/img/blog/guinness.svg" alt="Ilustración de una torta gigante de varios pisos" width="400" height="300" style={{ borderRadius: 20 }} />
        </div>
      </section>

      <section className="seccion franja" aria-label="Misión y visión">
        <div className="contenedor dos-columnas">
          <article className="tarjeta-simple">
            <h2>Misión</h2>
            <p>Ofrecer una experiencia dulce y memorable a nuestros clientes, proporcionando tortas y productos de repostería de alta calidad para todas las ocasiones, mientras celebramos nuestras raíces históricas y fomentamos la creatividad en la repostería.</p>
          </article>
          <article className="tarjeta-simple">
            <h2>Visión</h2>
            <p>Convertirnos en la tienda online líder de productos de repostería en Chile, conocida por nuestra innovación, calidad y el impacto positivo en la comunidad, especialmente en la formación de nuevos talentos en gastronomía.</p>
          </article>
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-equipo">
        <div className="contenedor">
          <header className="seccion-titulo">
            <h2 id="titulo-equipo">Equipo de desarrollo</h2>
            <p>Estudiantes de Desarrollo Fullstack II (DSY1104) de Duoc UC.</p>
          </header>
          <div className="tarjetas-3">
            {EQUIPO.map(i => (
              <article key={i.id} className="tarjeta-simple">
                <div className="avatar" aria-hidden="true">{i.id}</div>
                <h3>{i.nombre}</h3>
                <p>{i.rol}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
