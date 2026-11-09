import { Link, useOutletContext } from "react-router-dom";
import { Productos } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import TablaProductosAdmin from "../../components/admin/TablaProductosAdmin.jsx";

/* Listado de productos con stock igual o menor a su stock crítico */
export default function ProductosCriticos() {
  useStore();
  useTitulo("Productos críticos | Administrador Mil Sabores");
  const { esAdmin } = useOutletContext();
  const avisar = useAvisos();
  const criticos = Productos.criticos().sort((a, b) => a.stock - b.stock);

  const eliminar = codigo => {
    if (window.confirm(`¿Eliminar el producto ${codigo}?`)) {
      Productos.eliminar(codigo);
      avisar("Producto eliminado.");
    }
  };

  return (
    <>
      <CabeceraAdmin titulo="Listado de productos críticos" subtitulo="Stock igual o bajo el stock crítico definido">
        <Link className="btn btn-outline-primary" to="/admin/productos">← Productos</Link>
      </CabeceraAdmin>
      <section className="card shadow-sm"><div className="card-body">
        {criticos.length
          ? <div className="alert alert-warning">Hay {criticos.length} producto{criticos.length === 1 ? "" : "s"} que necesitan reposición.</div>
          : <div className="alert alert-success mb-0">No hay productos críticos. ¡Inventario en orden!</div>}
        {criticos.length > 0 && <TablaProductosAdmin productos={criticos} esAdmin={esAdmin} onEliminar={eliminar} />}
      </div></section>
    </>
  );
}
