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
      <section className="py-5" aria-labelledby="titulo-nosotros">
        <div className="container"><div className="row g-4 align-items-center">
          <div className="col-12 col-md-6">
            <h1 id="titulo-nosotros">Nuestra historia</h1>
            <p>Pastelería Mil Sabores nació en 1976 como un pequeño local de barrio en Santiago. Cincuenta años después somos un referente de la repostería chilena, con recetas que pasan de generación en generación.</p>
            <p>En 1995 fuimos parte del equipo que creó la torta más grande del mundo, un récord Guinness que todavía nos llena de orgullo. Hoy renovamos nuestra tienda online para que disfrutes esa misma tradición desde tu casa.</p>
          </div>
          <div className="col-12 col-md-6"><img src="/img/blog/guinness.svg" alt="Ilustración de una torta gigante de varios pisos" width="400" height="300" className="img-fluid rounded-4" /></div>
        </div></div>
      </section>

      <section className="py-5 bg-white" aria-label="Misión y visión">
        <div className="container"><div className="row g-4 row-cols-1 row-cols-md-2">
          <div className="col"><article className="card h-100 p-4 bg-crema border-0">
            <h2>Misión</h2>
            <p>Ofrecer una experiencia dulce y memorable a nuestros clientes, proporcionando tortas y productos de repostería de alta calidad para todas las ocasiones, mientras celebramos nuestras raíces históricas y fomentamos la creatividad en la repostería.</p>
          </article></div>
          <div className="col"><article className="card h-100 p-4 bg-crema border-0">
            <h2>Visión</h2>
            <p>Convertirnos en la tienda online líder de productos de repostería en Chile, conocida por nuestra innovación, calidad y el impacto positivo en la comunidad, especialmente en la formación de nuevos talentos en gastronomía.</p>
          </article></div>
        </div></div>
      </section>

      <section className="py-5" aria-labelledby="titulo-equipo">
        <div className="container">
          <header className="text-center mb-4">
            <h2 id="titulo-equipo">Equipo de desarrollo</h2>
            <p>Estudiantes de Desarrollo Fullstack II (DSY1104) de Duoc UC.</p>
          </header>
          <div className="row g-4 row-cols-1 row-cols-md-3">
            {EQUIPO.map(i => (
              <div className="col" key={i.id}><article className="card h-100 text-center p-4 shadow-sm">
                <div className="rounded-circle bg-rosa-claro text-chocolate fw-bold mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }} aria-hidden="true">{i.id}</div>
                <h3>{i.nombre}</h3>
                <p className="mb-0">{i.rol}</p>
              </article></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
