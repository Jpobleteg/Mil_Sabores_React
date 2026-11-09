import { Link, useParams } from "react-router-dom";
import { Ordenes, formatoCLP } from "../lib/store.js";
import { useTitulo } from "../hooks/useStore.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import TablaCarrito from "../components/TablaCarrito.jsx";

/* Compra exitosa (Figura 7): resumen de la orden con los datos en solo lectura */
export default function CompraExitosa() {
  useTitulo("Compra exitosa | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const { numero } = useParams();
  const o = Ordenes.obtener(numero);

  if (!o) {
    return (
      <div className="container py-5 text-center">
        <h1>Orden no encontrada</h1>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  const c = o.datosCliente || { nombre: o.cliente, apellidos: "", correo: o.correo };
  const e = o.entrega;
  const lineas = o.items.map((i, n) => ({ ...i, clave: `${i.codigo}-${n}`, producto: null, subtotal: i.unitario * i.cantidad }));
  const Solo = ({ id, label, valor, col = "col-12 col-md-4", area = false }) => (
    <div className={col}>
      <label htmlFor={id} className="form-label small mb-1">{label}</label>
      {area
        ? <textarea id={id} className="form-control bg-body-tertiary" rows="2" value={valor || ""} readOnly />
        : <input id={id} className="form-control bg-body-tertiary" value={valor || ""} readOnly />}
    </div>
  );

  return (
    <div className="container py-4">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 900 }}>
        <div className="card-body p-3 p-lg-4">
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <h1 className="h3 text-success mb-0" style={{ fontFamily: "inherit", fontWeight: 900 }}>
              Se ha realizado la compra. nro #{o.numero}
            </h1>
            <small className="text-body-secondary">Código autorización: {o.autorizacion || "—"}</small>
          </div>
          <p className="text-body-secondary small">Te enviamos el detalle a {c.correo || "tu correo"}. Estado: <strong>{o.estado}</strong></p>

          <div className="row g-3">
            <Solo id="ok-nombre" label="Nombre" valor={c.nombre} />
            <Solo id="ok-apellidos" label="Apellidos" valor={c.apellidos} />
            <Solo id="ok-correo" label="Correo" valor={c.correo} />
          </div>
          <h2 className="h5 mt-4" style={{ fontFamily: "inherit" }}>Dirección de entrega de los productos</h2>
          <div className="row g-3">
            <Solo id="ok-calle" label="Calle" valor={e.calle || e.direccion} col="col-12 col-md-6" />
            <Solo id="ok-depto" label="Departamento" valor={e.departamento} col="col-12 col-md-6" />
            <Solo id="ok-region" label="Región" valor={e.region} col="col-12 col-md-6" />
            <Solo id="ok-comuna" label="Comuna" valor={e.comuna} col="col-12 col-md-6" />
            <Solo id="ok-fecha" label="Fecha de entrega" valor={e.fecha} col="col-12 col-md-6" />
            <Solo id="ok-indicaciones" label="Indicaciones para la entrega" valor={e.indicaciones} col="col-12" area />
          </div>
          <div className="mt-4"><TablaCarrito lineas={lineas} /></div>
          <div className="card mt-3 text-center p-3 shadow-sm">
            <span className="fs-5">Total pagado: <strong className="precio" data-testid="total-pagado">{formatoCLP(o.total)}</strong></span>
            {o.descuento > 0 && <small className="text-success">Ahorraste {formatoCLP(o.descuento)}</small>}
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-3 no-imprimir">
            <button type="button" className="btn btn-danger" onClick={() => window.print()}>Imprimir boleta en PDF</button>
            <button type="button" className="btn btn-primary" onClick={() => avisar(`Boleta enviada a ${c.correo || "tu correo"}.`)}>Enviar boleta por email</button>
            <Link to="/productos" className="btn btn-outline-primary">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
