import { Link, useParams } from "react-router-dom";
import { Ordenes, Usuarios, formatoCLP } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Estado from "../../components/admin/Estado.jsx";

/* Historial de compras de un usuario */
export default function HistorialCompras() {
  useStore();
  useTitulo("Historial de compras | Administrador Mil Sabores");
  const { run } = useParams();
  const u = Usuarios.buscarPorRun(run);
  const compras = u ? Ordenes.delCliente(u.correo).reverse() : [];
  const total = compras.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <CabeceraAdmin titulo="Historial de compras" subtitulo={u ? `${u.nombre} ${u.apellidos} · ${u.correo}` : ""}>
        <Link className="btn btn-outline-primary" to={u ? `/admin/usuarios/${encodeURIComponent(u.run)}` : "/admin/usuarios"}>← Volver</Link>
      </CabeceraAdmin>
      <section className="card shadow-sm"><div className="card-body">
        {!u ? <p className="mb-0">Usuario no encontrado.</p> : (
          <>
            <div className="row g-3 mb-3">
              <div className="col-6 col-md-3"><div className="border rounded-3 p-3 text-center"><small>Compras</small><div className="fs-4 fw-bold">{compras.length}</div></div></div>
              <div className="col-6 col-md-3"><div className="border rounded-3 p-3 text-center"><small>Total gastado</small><div className="fs-5 fw-bold precio">{formatoCLP(total)}</div></div></div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light"><tr><th>N°</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {compras.length ? compras.map(o => (
                    <tr key={o.numero}>
                      <td className="fw-bold">{o.numero}</td>
                      <td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td>
                      <td className="small">{o.items.map(i => `${i.cantidad}× ${i.nombre}`).join(", ")}</td>
                      <td className="text-nowrap">{formatoCLP(o.total)}</td>
                      <td><Estado estado={o.estado} /></td>
                      <td><Link className="btn btn-outline-primary btn-sm" to={`/admin/ordenes/${o.numero}`}>Boleta</Link></td>
                    </tr>
                  )) : <tr><td colSpan="6" className="text-center py-4">Este usuario aún no tiene compras.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div></section>
    </>
  );
}
