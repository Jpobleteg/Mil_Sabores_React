import { Link, useOutletContext, useParams } from "react-router-dom";
import { ESTADOS, Ordenes } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Boleta from "../../components/Boleta.jsx";

/* Mostrar boleta de una orden */
export default function OrdenDetalle() {
  useStore();
  useTitulo("Boleta | Administrador Mil Sabores");
  const { numero } = useParams();
  const { esAdmin } = useOutletContext();
  const avisar = useAvisos();
  const o = Ordenes.obtener(numero);

  return (
    <>
      <CabeceraAdmin titulo="Mostrar boleta">
        <Link className="btn btn-outline-primary no-imprimir" to="/admin/ordenes">← Volver</Link>
        {o && <button type="button" className="btn btn-danger no-imprimir" onClick={() => window.print()}>Imprimir</button>}
      </CabeceraAdmin>
      <section className="card shadow-sm"><div className="card-body">
        {!o ? <p className="mb-0">La orden no existe.</p> : (
          <>
            <Boleta orden={o} />
            {esAdmin && (
              <div className="d-flex flex-wrap gap-2 align-items-center no-imprimir">
                <label htmlFor="estado-orden" className="fw-bold">Cambiar estado:</label>
                <select id="estado-orden" className="form-select w-auto" value={o.estado}
                  onChange={e => { Ordenes.cambiarEstado(o.numero, e.target.value); avisar(`Orden ${o.numero}: ${e.target.value}.`); }}>
                  {ESTADOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div></section>
    </>
  );
}
