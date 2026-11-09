import { Link } from "react-router-dom";
import { Carrito, Productos, precioTexto } from "../lib/store.js";
import { useAvisos } from "../context/AvisosContext.jsx";

/* Tarjeta de producto reutilizable (home, catálogo y relacionados) */
export default function TarjetaProducto({ producto: p }) {
  const avisar = useAvisos();
  const agotado = p.stock <= 0;
  const url = `/productos/${encodeURIComponent(p.codigo)}`;

  /* Añade 1 unidad; las tortas personalizables se agregan en tamaño pequeño */
  const agregar = () => {
    const tamano = Productos.esTorta(p) && p.personalizable ? "S" : "";
    const r = Carrito.agregar(p.codigo, 1, tamano, "");
    avisar(r.msg, r.ok ? "ok" : "error");
  };

  return (
    <article className="tarjeta">
      <Link className="imagen" to={url}>
        <img src={Productos.imagen(p)} alt={p.nombre} loading="lazy" width="400" height="300" />
      </Link>
      <div className="cuerpo">
        <span className="categoria">{p.categoria}</span>
        <h3><Link to={url}>{p.nombre}</Link></h3>
        {agotado
          ? <span className="insignia insignia-agotado">Agotado</span>
          : p.personalizable && <span className="insignia">Personalizable</span>}
        <div className="pie">
          <span className="precio">{precioTexto(p)}</span>
          <button className="btn btn-chico btn-rosa" type="button" disabled={agotado} onClick={agregar}
            aria-label={`Añadir ${p.nombre} al carrito`}>Añadir</button>
        </div>
      </div>
    </article>
  );
}
