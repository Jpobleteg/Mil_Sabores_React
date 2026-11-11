import { useState } from "react";
import { Link } from "react-router-dom";
import { TAMANOS } from "../lib/data.js";
import { MAX_POR_ITEM, Productos, formatoCLP } from "../lib/store.js";

/* Tabla de productos del carrito / boleta (Bootstrap table).*/
export default function TablaCarrito({ lineas, editable = false, onCambiar, onEliminar }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0 bg-white">
        <thead className="table-light">
          <tr>
            <th scope="col">Imagen</th><th scope="col">Nombre</th><th scope="col">Precio</th>
            <th scope="col">Cantidad</th><th scope="col" className="text-end">Subtotal</th>
            {editable && <th scope="col"><span className="visually-hidden">Acciones</span></th>}
          </tr>
        </thead>
        <tbody>
          {lineas.map(l => (
            <tr key={l.clave} data-testid="fila-carrito">
              <td><img src={imagenLinea(l)} alt="" className="mini-img" /></td>
              <td>
                {l.producto ? <Link to={`/productos/${encodeURIComponent(l.codigo)}`} className="fw-bold text-decoration-none">{l.producto.nombre}</Link> : l.nombre}
                <Extras linea={l} />
              </td>
              <td className="text-nowrap">{formatoCLP(l.unitario)}</td>
              <td>{editable ? <Cantidad linea={l} onCambiar={onCambiar} /> : l.cantidad}</td>
              <td className="text-end text-nowrap fw-bold">{formatoCLP(l.subtotal ?? l.unitario * l.cantidad)}</td>
              {editable && (
                <td className="text-end">
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onEliminar(l.clave)}
                    aria-label={`Eliminar ${l.producto ? l.producto.nombre : ""}`} title="Eliminar">✕</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function imagenLinea(l) {
  const p = l.producto || Productos.buscar(l.codigo);
  return p ? Productos.imagen(p) : "/img/logo.svg";
}

function Extras({ linea: l }) {
  const t = TAMANOS.find(t => t.id === l.tamano);
  if (!t && !l.mensaje) return null;
  return (
    <div className="small text-body-secondary">
      {t && t.nombre}{t && l.mensaje && " · "}{l.mensaje && `“${l.mensaje}”`}
    </div>
  );
}

/* Control de cantidad: estado local del texto, se confirma al salir o con Enter */
function Cantidad({ linea: l, onCambiar }) {
  const [texto, setTexto] = useState(String(l.cantidad));
  const [anterior, setAnterior] = useState(l.cantidad);
  if (anterior !== l.cantidad) {
    setAnterior(l.cantidad);
    setTexto(String(l.cantidad));
  }
  const confirmar = () => {
    const n = parseInt(texto, 10);
    if (!Number.isNaN(n) && n !== l.cantidad) onCambiar(l.clave, n);
    else setTexto(String(l.cantidad));
  };
  const nombre = l.producto ? l.producto.nombre : "";
  return (
    <div className="input-group input-group-sm flex-nowrap" style={{ width: "8rem" }}>
      <button type="button" className="btn btn-outline-secondary" aria-label={`Quitar una unidad de ${nombre}`} onClick={() => onCambiar(l.clave, l.cantidad - 1)}>−</button>
      <input type="number" className="form-control cantidad-ms" min="1" max={MAX_POR_ITEM} aria-label={`Cantidad de ${nombre}`}
        value={texto} onChange={e => setTexto(e.target.value)} onBlur={confirmar}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmar(); } }} />
      <button type="button" className="btn btn-outline-secondary" aria-label={`Agregar una unidad de ${nombre}`} onClick={() => onCambiar(l.clave, l.cantidad + 1)}>+</button>
    </div>
  );
}
