import { formatoCLP, ESTADOS } from "../lib/store.js";

/* Boleta / detalle de orden (se usa en el carrito y en el admin) */
export default function Boleta({ orden: o, modo = "cliente" }) {
  const paso = ESTADOS.indexOf(o.estado);
  const fechaEntrega = modo === "cliente"
    ? new Date(o.entrega.fecha + "T00:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
    : o.entrega.fecha;

  return (
    <div className="boleta">
      <header>
        {modo === "cliente" ? (
          <>
            <img src="/img/logo.svg" alt="" width="56" height="56" style={{ margin: "0 auto" }} />
            <h2 id="titulo-boleta">¡Gracias por tu compra!</h2>
            <p>Boleta N° <strong>{o.numero}</strong> · {new Date(o.fecha).toLocaleString("es-CL")}</p>
          </>
        ) : (
          <>
            <h2>Boleta {o.numero}</h2>
            <p>{o.cliente} · {o.correo || "sin correo"}</p>
          </>
        )}
      </header>
      <table>
        <thead><tr><th>Producto</th><th>Cant.</th><th>Total</th></tr></thead>
        <tbody>
          {o.items.map((i, n) => (
            <tr key={n}>
              <td>{i.nombre}{i.mensaje && <><br /><small>“{i.mensaje}”</small></>}</td>
              <td>{i.cantidad}</td>
              <td>{formatoCLP(i.unitario * i.cantidad)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan="2">Subtotal</td><td>{formatoCLP(o.subtotal)}</td></tr>
          {(o.descuento > 0 || modo === "admin") && (
            <tr><td colSpan="2">Descuentos</td><td>−{formatoCLP(o.descuento)}</td></tr>
          )}
          <tr><td colSpan="2">{modo === "cliente" ? "Total pagado" : "Total"}</td><td>{formatoCLP(o.total)}</td></tr>
        </tfoot>
      </table>
      <p style={{ marginTop: 14 }}><strong>Entrega:</strong> {fechaEntrega} · {o.entrega.direccion}</p>
      <ol className="estado-pedido" aria-label="Estado del pedido">
        {ESTADOS.map((e, i) => <li key={e} className={i <= paso ? "activo" : ""}>{e}</li>)}
      </ol>
      {modo === "cliente" && (
        <p style={{ fontSize: ".9rem" }} className="texto-secundario">Te avisaremos por correo cada vez que cambie el estado de tu pedido.</p>
      )}
      <form method="dialog" style={{ textAlign: "center" }}><button className="btn">Cerrar</button></form>
    </div>
  );
}
