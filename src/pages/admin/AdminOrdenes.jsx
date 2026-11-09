import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ESTADOS, Ordenes, formatoCLP } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Estado from "../../components/admin/Estado.jsx";
import Paginacion, { paginar } from "../../components/admin/Paginacion.jsx";

/* Órdenes / boletas: listado con búsqueda, filtro por estado y cambio de estado */
export default function AdminOrdenes() {
  useStore();
  useTitulo("Órdenes | Administrador Mil Sabores");
  const { esAdmin } = useOutletContext();
  const avisar = useAvisos();
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);

  const t = buscar.trim().toLowerCase();
  const lista = Ordenes.todas().filter(o =>
    (!t || `${o.numero} ${o.cliente} ${o.correo}`.toLowerCase().includes(t)) && (!estado || o.estado === estado)).reverse();
  const pag = paginar(lista, pagina, 10);

  const cambiarEstado = (numero, nuevo) => {
    const o = Ordenes.cambiarEstado(numero, nuevo);
    if (o) avisar(`Orden ${o.numero}: ${o.estado}. Se notificará al cliente.`);
  };

  return (
    <>
      <CabeceraAdmin titulo="Órdenes / Boletas" subtitulo={`${lista.length} orden${lista.length === 1 ? "" : "es"}`} />
      <section className="card shadow-sm"><div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <label htmlFor="buscar-orden" className="visually-hidden">Buscar orden</label>
            <input type="search" id="buscar-orden" className="form-control" placeholder="Buscar por N° de boleta, cliente o correo" value={buscar}
              onChange={e => { setBuscar(e.target.value); setPagina(1); }} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="filtro-estado" className="visually-hidden">Estado</label>
            <select id="filtro-estado" className="form-select" value={estado} onChange={e => { setEstado(e.target.value); setPagina(1); }}>
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>N° boleta</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {pag.visibles.length ? pag.visibles.map(o => (
                <tr key={o.numero}>
                  <td className="fw-bold">{o.numero}</td>
                  <td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td>
                  <td>{o.cliente}</td>
                  <td>{o.entrega.fecha}</td>
                  <td className="text-nowrap">{formatoCLP(o.total)}</td>
                  <td style={{ minWidth: 150 }}>
                    {esAdmin ? (
                      <>
                        <label className="visually-hidden" htmlFor={`estado-${o.numero}`}>Estado</label>
                        <select id={`estado-${o.numero}`} className="form-select form-select-sm" value={o.estado} onChange={e => cambiarEstado(o.numero, e.target.value)}>
                          {ESTADOS.map(e => <option key={e}>{e}</option>)}
                        </select>
                      </>
                    ) : <Estado estado={o.estado} />}
                  </td>
                  <td><Link className="btn btn-outline-primary btn-sm text-nowrap" to={`/admin/ordenes/${o.numero}`}>Mostrar boleta</Link></td>
                </tr>
              )) : <tr><td colSpan="7" className="text-center py-4">No hay órdenes todavía.</td></tr>}
            </tbody>
          </table>
        </div>
        <Paginacion total={pag.total} pagina={pag.pagina} onCambiar={setPagina} />
      </div></section>
    </>
  );
}
