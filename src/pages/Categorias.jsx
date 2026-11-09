import { Link, useParams } from "react-router-dom";
import { Categorias as CategoriasStore, Productos } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import GrillaProductos from "../components/GrillaProductos.jsx";
import Migas from "../components/Migas.jsx";

/* Vista Categorías: tarjetas de categoría arriba y, debajo, los productos
   separados por categoría. Con /categorias/:id se muestra solo esa categoría. */
export default function Categorias() {
  useStore();
  const { id } = useParams();
  const categorias = CategoriasStore.todas();
  const seleccionada = id ? CategoriasStore.obtener(id) : null;
  useTitulo(`${seleccionada ? seleccionada.nombre : "Categorías"} | Pastelería Mil Sabores`);
  const visibles = seleccionada ? [seleccionada] : categorias;

  return (
    <div className="container py-3">
      <Migas items={[{ texto: "Home", to: "/" }, { texto: "Categorías", to: "/categorias" }, ...(seleccionada ? [{ texto: seleccionada.nombre }] : [])]} />
      <h1 className="text-center mb-4">{seleccionada ? seleccionada.nombre : "Categorías"}</h1>

      <nav aria-label="Categorías" className="mb-5">
        <div className="row g-3 row-cols-2 row-cols-sm-3 row-cols-md-4 justify-content-center">
          {categorias.map(c => (
            <div className="col" key={c.id}>
              <Link to={`/categorias/${c.id}`} className={`card card-categoria h-100 text-center p-2 shadow-sm${seleccionada && seleccionada.id === c.id ? " activa" : ""}`}
                aria-current={seleccionada && seleccionada.id === c.id ? "page" : undefined}>
                <img src={CategoriasStore.imagen(c)} alt="" className="rounded-3 w-100" />
                <span className="fw-bold small mt-2">{c.nombre}</span>
                <span className="badge text-bg-light mt-1">{CategoriasStore.contarProductos(c.nombre)}</span>
              </Link>
            </div>
          ))}
        </div>
      </nav>

      {id && !seleccionada && (
        <div className="alert alert-warning">La categoría no existe. <Link to="/categorias">Ver todas</Link></div>
      )}

      {visibles.map(c => (
        <section key={c.id} className="mb-5" aria-labelledby={`titulo-${c.id}`}>
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
            <div>
              <h2 id={`titulo-${c.id}`} className="h3 mb-0">{c.nombre}</h2>
              {c.descripcion && <small className="text-body-secondary">{c.descripcion}</small>}
            </div>
            {!seleccionada && <Link to={`/categorias/${c.id}`} className="btn btn-outline-primary btn-sm">Ver categoría</Link>}
          </div>
          <GrillaProductos productos={Productos.porCategoria(c.nombre)} vacio="Aún no hay productos en esta categoría." />
        </section>
      ))}
    </div>
  );
}
