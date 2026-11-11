import { ESTADOS, formatoCLP } from "../lib/store.js";
import TablaCarrito from "./TablaCarrito.jsx";


export default function Boleta({ orden: o }) {
  const paso = ESTADOS.indexOf(o.estado);
  const lineas = o.items.map((i, n) => ({ ...i, clave: `${i.codigo}-${n}`, producto: null, subtotal: i.unitario * i.cantidad }));
  const e = o.entrega || {};
  const fechaEntrega = e.fecha
    ? new Date(e.fecha + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div data-testid="boleta">
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <div>
          <h2 className="h4 mb-0">Boleta N° {o.numero}</h2>
          <small className="text-body-secondary">{new Date(o.fecha).toLocaleString("es-CL")}</small>
        </div>
        <div className="text-end small">
          {o.autorizacion && <div>Código de autorización: <strong>{o.autorizacion}</strong></div>}
          <span className={`badge estado-${o.estado.replace(/\s/g, "-")}`}>{o.estado}</span>
        </div>
      </div>
      <div className="row g-3 mb-3 small">
        <div className="col-md-6">
          <h3 className="h6">Cliente</h3>
          <div>{o.cliente}</div>
          <div>{o.correo || "Sin correo"}</div>
        </div>
        <div className="col-md-6">
          <h3 className="h6">Entrega</h3>
          <div className="text-capitalize">{fechaEntrega}</div>
          <div>{e.direccion}{e.region ? `, ${e.region}` : ""}</div>
          {e.indicaciones && <div className="text-body-secondary">Indicaciones: {e.indicaciones}</div>}
        </div>
      </div>
      <TablaCarrito lineas={lineas} />
      <dl className="row mt-3 mb-0">
        <dt className="col-8 text-end fw-normal">Subtotal</dt><dd className="col-4 text-end mb-1">{formatoCLP(o.subtotal)}</dd>
        <dt className="col-8 text-end fw-normal">Descuentos</dt><dd className="col-4 text-end mb-1">−{formatoCLP(o.descuento)}</dd>
        <dt className="col-8 text-end">Total pagado</dt><dd className="col-4 text-end fw-bold precio fs-5 mb-0">{formatoCLP(o.total)}</dd>
      </dl>
      <ol className="estado-pedido" aria-label="Estado del pedido">
        {ESTADOS.map((x, i) => <li key={x} className={i <= paso ? "activo" : ""}>{x}</li>)}
      </ol>
    </div>
  );
}
