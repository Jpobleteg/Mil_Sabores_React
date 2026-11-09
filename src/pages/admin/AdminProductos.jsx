import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Categorias, Productos } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Paginacion, { paginar } from "../../components/admin/Paginacion.jsx";
import TablaProductosAdmin from "../../components/admin/TablaProductosAdmin.jsx";

export default function AdminProductos() {
  useStore();
  useTitulo("Productos | Administrador Mil Sabores");
  const { esAdmin } = useOutletContext();
  const avisar = useAvisos();
  const [buscar, setBuscar] = useState("");
  const [categoria, setCategoria] = useState("");
  const [pagina, setPagina] = useState(1);

  const t = buscar.trim().toLowerCase();
  const lista = Productos.todos().filter(p =>
    (!t || (p.codigo + " " + p.nombre).toLowerCase().includes(t)) && (!categoria || p.categoria === categoria));
  const pag = paginar(lista, pagina, 8);

  const eliminar = codigo => {
    if (window.confirm(`¿Eliminar el producto ${codigo}?`)) {
      Productos.eliminar(codigo);
      avisar("Producto eliminado.");
    }
  };

  return (
    <>
      <CabeceraAdmin titulo="Productos" subtitulo={`${lista.length} producto${lista.length === 1 ? "" : "s"}`}>
        <Link className="btn btn-outline-warning" to="/admin/productos/criticos">⚠️ Críticos ({Productos.criticos().length})</Link>
        {esAdmin && <Link className="btn btn-outline-primary" to="/admin/reportes">📈 Reportes</Link>}
        {esAdmin && <Link className="btn btn-primary" to="/admin/productos/nuevo">+ Nuevo producto</Link>}
      </CabeceraAdmin>
      <section className="card shadow-sm"><div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <label htmlFor="buscar-producto" className="visually-hidden">Buscar producto</label>
            <input type="search" id="buscar-producto" className="form-control" placeholder="Buscar por código o nombre" value={buscar}
              onChange={e => { setBuscar(e.target.value); setPagina(1); }} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="filtro-cat" className="visually-hidden">Categoría</label>
            <select id="filtro-cat" className="form-select" value={categoria} onChange={e => { setCategoria(e.target.value); setPagina(1); }}>
              <option value="">Todas las categorías</option>
              {Categorias.nombres().map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <TablaProductosAdmin productos={pag.visibles} esAdmin={esAdmin} onEliminar={eliminar} />
        <Paginacion total={pag.total} pagina={pag.pagina} onCambiar={setPagina} />
      </div></section>
    </>
  );
}
