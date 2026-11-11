import { Carrito, formatoCLP } from "../lib/store.js";

export default function ResumenCompra({ resumen: r }) {
  return (
    <dl className="row mb-0" data-testid="resumen-compra">
      <dt className="col-7 fw-normal">Productos ({Carrito.cantidadTotal()})</dt>
      <dd className="col-5 text-end">{formatoCLP(r.subtotal)}</dd>
      {r.descuentoTorta > 0 && <>
        <dt className="col-7 fw-normal text-success">Torta de cumpleaños gratis<br /><small>{r.tortaGratisNombre}</small></dt>
        <dd className="col-5 text-end text-success">−{formatoCLP(r.descuentoTorta)}</dd>
      </>}
      {r.descuentoPct > 0 && <>
        <dt className="col-7 fw-normal text-success">{r.motivo}</dt>
        <dd className="col-5 text-end text-success">−{formatoCLP(r.descuentoPct)}</dd>
      </>}
      <dt className="col-7 border-top pt-2 fs-5">Total</dt>
      <dd className="col-5 border-top pt-2 text-end fs-5 precio mb-0" data-testid="total">{formatoCLP(r.total)}</dd>
    </dl>
  );
}
