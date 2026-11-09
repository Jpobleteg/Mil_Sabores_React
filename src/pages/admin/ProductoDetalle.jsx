import { Link, useOutletContext, useParams } from "react-router-dom";
import { Productos, precioTexto } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

export default function ProductoDetalle() {
  useStore();
  useTitulo("Detalle del producto | Administrador Mil Sabores");
  const { esAdmin } = useOutletContext();
  const { codigo } = useParams();
  const p = Productos.buscar(codigo);

  return (
    <>
      <CabeceraAdmin titulo="Detalle del producto">
        <Link className="btn btn-borde" to="/admin/productos">← Volver</Link>
      </CabeceraAdmin>
      <article className="panel">
        {!p ? <p>Producto no encontrado.</p> : (
          <div className="ficha">
            <img src={Productos.imagen(p)} alt={p.nombre} />
            <div>
              <h2>{p.nombre}</h2>
              {Productos.esCritico(p) && <p className="alerta">⚠️ Stock crítico: quedan {p.stock} unidades.</p>}
              <dl>
                <dt>Código</dt><dd>{p.codigo}</dd>
                <dt>Categoría</dt><dd>{p.categoria}</dd>
                <dt>Precio</dt><dd>{precioTexto(p)}</dd>
                <dt>Stock</dt><dd>{p.stock}</dd>
                <dt>Stock crítico</dt><dd>{p.stockCritico === "" || p.stockCritico == null ? "—" : p.stockCritico}</dd>
                <dt>Personalizable</dt><dd>{p.personalizable ? "Sí" : "No"}</dd>
                <dt>Descripción</dt><dd>{p.descripcion || "—"}</dd>
              </dl>
              <p style={{ marginTop: 18 }}>
                {esAdmin && <><Link className="btn" to={`/admin/productos/${encodeURIComponent(p.codigo)}/editar`}>Editar</Link>{" "}</>}
                <Link className="btn btn-borde" to={`/productos/${encodeURIComponent(p.codigo)}`}>Ver en la tienda</Link>
              </p>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
