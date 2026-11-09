import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CATEGORIAS } from "../../lib/data.js";
import { Productos, precioTexto } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Paginacion, { paginar } from "../../components/admin/Paginacion.jsx";

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
      <CabeceraAdmin titulo="Productos">
        {esAdmin && <Link className="btn" to="/admin/productos/nuevo">+ Nuevo producto</Link>}
      </CabeceraAdmin>
      <section className="panel">
        <div className="herramientas">
          <label htmlFor="buscar-producto" className="oculto-visual">Buscar producto</label>
          <input type="search" id="buscar-producto" placeholder="Buscar por código o nombre" value={buscar}
            onChange={e => { setBuscar(e.target.value); setPagina(1); }} />
          <label htmlFor="filtro-cat" className="oculto-visual">Categoría</label>
          <select id="filtro-cat" value={categoria} onChange={e => { setCategoria(e.target.value); setPagina(1); }}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead><tr><th>Imagen</th><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
            <tbody>
              {pag.visibles.length ? pag.visibles.map(p => {
                const critico = Productos.esCritico(p);
                return (
                  <tr key={p.codigo}>
                    <td><img src={Productos.imagen(p)} alt="" /></td>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>{precioTexto(p)}</td>
                    <td className={critico ? "critico" : ""}>{p.stock}{critico && " ⚠️"}</td>
                    <td className="acciones">
                      <Link className="btn btn-borde btn-chico" to={`/admin/productos/${encodeURIComponent(p.codigo)}`}>Ver</Link>
                      {esAdmin && <>
                        <Link className="btn btn-chico" to={`/admin/productos/${encodeURIComponent(p.codigo)}/editar`}>Editar</Link>
                        <button className="btn btn-peligro btn-chico" type="button" onClick={() => eliminar(p.codigo)}>Eliminar</button>
                      </>}
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan="7">No hay productos que coincidan.</td></tr>}
            </tbody>
          </table>
        </div>
        <Paginacion total={pag.total} pagina={pag.pagina} onCambiar={setPagina} />
      </section>
    </>
  );
}
