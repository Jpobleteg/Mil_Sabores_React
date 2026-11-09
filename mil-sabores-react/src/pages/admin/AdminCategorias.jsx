import { Link } from "react-router-dom";
import { Categorias } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

/* Categorías: listado con acceso a Nueva / Editar / Eliminar */
export default function AdminCategorias() {
  useStore();
  useTitulo("Categorías | Administrador Mil Sabores");
  const avisar = useAvisos();

  const eliminar = c => {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    const r = Categorias.eliminar(c.id);
    avisar(r.msg, r.ok ? "ok" : "error");
  };

  return (
    <>
      <CabeceraAdmin titulo="Categorías" subtitulo="Organiza los productos de la tienda">
        <Link className="btn btn-primary" to="/admin/categorias/nueva">+ Nueva categoría</Link>
      </CabeceraAdmin>
      <section className="card shadow-sm"><div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>Imagen</th><th>Nombre</th><th>Descripción</th><th>Productos</th><th>Acciones</th></tr></thead>
            <tbody>
              {Categorias.todas().map(c => (
                <tr key={c.id}>
                  <td><img src={Categorias.imagen(c)} alt="" className="tabla-img" /></td>
                  <td className="fw-bold">{c.nombre}</td>
                  <td className="small">{c.descripcion || "—"}</td>
                  <td><span className="badge text-bg-light border">{Categorias.contarProductos(c.nombre)}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link className="btn btn-outline-primary btn-sm" to={`/categorias/${c.id}`}>Ver</Link>
                      <Link className="btn btn-primary btn-sm" to={`/admin/categorias/${c.id}/editar`}>Editar</Link>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminar(c)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></section>
    </>
  );
}
