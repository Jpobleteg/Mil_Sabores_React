import { Link, useOutletContext, useParams } from "react-router-dom";
import { Productos, enOferta, formatoCLP, precioTexto } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

/* Mostrar producto */
export default function ProductoDetalle() {
  useStore();
  useTitulo("Detalle del producto | Administrador Mil Sabores");
  const { esAdmin } = useOutletContext();
  const { codigo } = useParams();
  const p = Productos.buscar(codigo);

  return (
    <>
      <CabeceraAdmin titulo="Mostrar producto">
        <Link className="btn btn-outline-primary" to="/admin/productos">← Volver</Link>
        {p && esAdmin && <Link className="btn btn-primary" to={`/admin/productos/${encodeURIComponent(p.codigo)}/editar`}>Editar producto</Link>}
      </CabeceraAdmin>
      <article className="card shadow-sm"><div className="card-body">
        {!p ? <p className="mb-0">Producto no encontrado.</p> : (
          <div className="row g-4">
            <div className="col-12 col-md-4"><img src={Productos.imagen(p)} alt={p.nombre} className="img-fluid rounded-3 bg-rosa-claro w-100" /></div>
            <div className="col-12 col-md-8">
              <h2 className="h3">{p.nombre}</h2>
              {Productos.esCritico(p) && <div className="alert alert-warning py-2">⚠️ Stock crítico: quedan {p.stock} unidades.</div>}
              <dl className="row mb-3">
                <dt className="col-sm-4">Código</dt><dd className="col-sm-8">{p.codigo}</dd>
                <dt className="col-sm-4">Categoría</dt><dd className="col-sm-8">{p.categoria}</dd>
                <dt className="col-sm-4">Precio</dt><dd className="col-sm-8">{formatoCLP(p.precio)}</dd>
                <dt className="col-sm-4">Precio oferta</dt><dd className="col-sm-8">{enOferta(p) ? precioTexto(p) : "—"}</dd>
                <dt className="col-sm-4">Stock</dt><dd className="col-sm-8">{p.stock}</dd>
                <dt className="col-sm-4">Stock crítico</dt><dd className="col-sm-8">{p.stockCritico === "" || p.stockCritico == null ? "—" : p.stockCritico}</dd>
                <dt className="col-sm-4">Personalizable</dt><dd className="col-sm-8">{p.personalizable ? "Sí" : "No"}</dd>
                <dt className="col-sm-4">Descripción</dt><dd className="col-sm-8">{p.descripcion || "—"}</dd>
              </dl>
              <Link className="btn btn-outline-primary" to={`/productos/${encodeURIComponent(p.codigo)}`}>Ver en la tienda</Link>
            </div>
          </div>
        )}
      </div></article>
    </>
  );
}
