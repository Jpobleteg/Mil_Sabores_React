import { Link } from "react-router-dom";
import { Productos, enOferta, formatoCLP, precioTexto } from "../../lib/store.js";

/* Tabla de productos del panel.
   Props: productos, esAdmin (muestra Editar/Eliminar), onEliminar(codigo) */
export default function TablaProductosAdmin({ productos, esAdmin, onEliminar }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light"><tr><th>Imagen</th><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
        <tbody>
          {productos.length ? productos.map(p => {
            const critico = Productos.esCritico(p);
            return (
              <tr key={p.codigo} className={critico ? "table-warning" : ""}>
                <td><img src={Productos.imagen(p)} alt="" className="tabla-img" /></td>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td className="text-nowrap">
                  {precioTexto(p)}
                  {enOferta(p) && <><br /><small className="text-body-secondary text-decoration-line-through">{formatoCLP(p.precio)}</small> <span className="badge text-bg-danger">Oferta</span></>}
                </td>
                <td>{p.stock}{critico && <span className="badge text-bg-warning ms-1">Crítico</span>}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link className="btn btn-outline-primary btn-sm" to={`/admin/productos/${encodeURIComponent(p.codigo)}`}>Ver</Link>
                    {esAdmin && <>
                      <Link className="btn btn-primary btn-sm" to={`/admin/productos/${encodeURIComponent(p.codigo)}/editar`}>Editar</Link>
                      <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => onEliminar(p.codigo)}>Eliminar</button>
                    </>}
                  </div>
                </td>
              </tr>
            );
          }) : <tr><td colSpan="7" className="text-center py-4">No hay productos que coincidan.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
