import { enOferta, formatoCLP, porcentajeOferta, precioFinal } from "../lib/store.js";

/* Muestra el precio de un producto; si está en oferta, tacha el precio normal.
   factor: multiplica el precio (tamaño de la torta) */
export default function Precio({ producto, factor = 1, className = "", conBadge = true }) {
  const final = precioFinal(producto) * factor;
  return (
    <span className={className}>
      {enOferta(producto) && (
        <span className="precio-anterior me-2" data-testid="precio-anterior">{formatoCLP(producto.precio * factor)}</span>
      )}
      <span className="precio">{final === 0 ? "FREE" : formatoCLP(final)}</span>
      {conBadge && enOferta(producto) && <span className="badge text-bg-danger ms-2">-{porcentajeOferta(producto)}%</span>}
    </span>
  );
}
