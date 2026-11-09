import { Link } from "react-router-dom";
import { Carrito, Productos, enOferta } from "../lib/store.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Precio from "./Precio.jsx";

/* Tarjeta de producto (card de Bootstrap) reutilizable en home, catálogo,
   categorías, ofertas, relacionados y carrito.
   Props:
     producto  → objeto del catálogo (obligatorio)
     compacta  → versión pequeña sin descripción ni categoría
     onAgregar → función opcional; si no se pasa, añade al carrito */
export default function TarjetaProducto({ producto: p, compacta = false, onAgregar }) {
  const avisar = useAvisos();
  const agotado = p.stock <= 0;
  const url = `/productos/${encodeURIComponent(p.codigo)}`;

  /* Añade 1 unidad; las tortas personalizables se agregan en tamaño pequeño */
  const agregar = () => {
    if (onAgregar) return onAgregar(p);
    const tamano = Productos.esTorta(p) && p.personalizable ? "S" : "";
    const r = Carrito.agregar(p.codigo, 1, tamano, "");
    avisar(r.msg, r.ok ? "ok" : "error");
  };

  return (
    <article className="card card-producto h-100 shadow-sm position-relative" data-testid="tarjeta-producto">
      {enOferta(p) && <span className="badge text-bg-danger badge-oferta">Oferta</span>}
      <Link to={url}>
        <img src={Productos.imagen(p)} alt={p.nombre} loading="lazy" className="card-img-top" width="400" height="300" />
      </Link>
      <div className={`card-body d-flex flex-column ${compacta ? "p-2" : ""}`}>
        {!compacta && <span className="categoria">{p.categoria}</span>}
        <h3 className={`card-title ${compacta ? "h6" : "h5"} mt-1`}><Link to={url}>{p.nombre}</Link></h3>
        <div className="mb-2">
          {agotado
            ? <span className="badge text-bg-secondary">Agotado</span>
            : !compacta && p.personalizable && <span className="badge bg-rosa-claro text-chocolate">Personalizable</span>}
          {compacta && !agotado && <small className="text-body-secondary">Stock: {p.stock}</small>}
        </div>
        <div className="mt-auto d-flex flex-wrap justify-content-between align-items-center gap-2">
          <Precio producto={p} conBadge={false} className={compacta ? "small d-flex flex-column" : "d-flex flex-column lh-sm"} />
          <button className={`btn btn-rosa ${compacta ? "btn-sm w-100" : "btn-sm"}`} type="button" disabled={agotado} onClick={agregar}
            aria-label={`Añadir ${p.nombre} al carrito`}>Añadir</button>
        </div>
      </div>
    </article>
  );
}
