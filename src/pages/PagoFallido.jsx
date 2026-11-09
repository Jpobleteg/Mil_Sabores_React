import { Link } from "react-router-dom";
import { Carrito, formatoCLP } from "../lib/store.js";
import { IntentoPago } from "../lib/checkout.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import TablaCarrito from "../components/TablaCarrito.jsx";

/* No se pudo realizar el pago (Figura 8). El carrito se conserva y el
   botón "Volver a realizar el pago" abre el checkout con los datos precargados. */
export default function PagoFallido() {
  useStore();
  useTitulo("Pago rechazado | Pastelería Mil Sabores");
  const intento = IntentoPago.leer();
  const r = Carrito.resumen();
  const d = intento ? intento.datos : null;

  return (
    <div className="container py-4">
      <div className="card shadow-sm mx-auto border-danger" style={{ maxWidth: 900 }}>
        <div className="card-body p-3 p-lg-4">
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <h1 className="h3 text-danger mb-0" style={{ fontFamily: "inherit", fontWeight: 900 }}>
              No se pudo realizar el pago{intento ? `. nro #${intento.numero}` : ""}
            </h1>
          </div>
          <div className="alert alert-danger mt-3" role="alert">
            {intento ? intento.motivo : "El pago no se completó."} No se realizó ningún cargo. Tus productos siguen en el carrito.
          </div>

          {d && (
            <div className="row g-2 small mb-3">
              <div className="col-md-6"><strong>Cliente:</strong> {d.nombre} {d.apellidos} · {d.correo}</div>
              <div className="col-md-6"><strong>Entrega:</strong> {d.calle}{d.departamento ? `, ${d.departamento}` : ""}, {d.comuna}</div>
              {intento.finalTarjeta && <div className="col-md-6"><strong>Tarjeta:</strong> terminada en {intento.finalTarjeta}</div>}
            </div>
          )}

          {r.lineas.length > 0 && <TablaCarrito lineas={r.lineas} />}
          <div className="card mt-3 text-center p-3">
            <span className="fs-5">Total a pagar: <strong className="precio">{formatoCLP(r.total)}</strong></span>
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
            <Link to="/checkout" className="btn btn-primary">Volver a realizar el pago</Link>
            <Link to="/carrito" className="btn btn-outline-secondary">Revisar carrito</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
