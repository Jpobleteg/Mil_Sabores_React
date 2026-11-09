import { useState } from "react";
import { Link } from "react-router-dom";
import { TAMANOS } from "../lib/data.js";
import { CODIGO_PROMO, Carrito as CarritoStore, MAX_POR_ITEM, Ordenes, Productos, formatoCLP } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";
import Dialogo from "../components/Dialogo.jsx";
import Boleta from "../components/Boleta.jsx";

/* Fecha mínima de entrega: 2 días desde hoy; máxima: 60 días */
const aISO = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
function rangoEntrega() {
  const hoy = new Date();
  const min = new Date(hoy); min.setDate(hoy.getDate() + 2);
  const max = new Date(hoy); max.setDate(hoy.getDate() + 60);
  return { min: aISO(min), max: aISO(max) };
}

export default function Carrito() {
  useStore();
  useTitulo("Carrito de compras | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const [cuponAplicado, setCuponAplicado] = useState("");
  const [cupon, setCupon] = useState("");
  const [errorCupon, setErrorCupon] = useState("");
  const [boleta, setBoleta] = useState(null);
  const rango = rangoEntrega();

  const r = CarritoStore.resumen(cuponAplicado);

  /* ----- Acciones sobre los ítems ----- */
  const cambiar = (clave, cantidad) => {
    const res = CarritoStore.cambiarCantidad(clave, cantidad);
    if (!res.ok && res.msg) avisar(res.msg, "error");
  };
  const eliminar = clave => {
    CarritoStore.quitar(clave);
    avisar("Producto eliminado del carrito.");
  };
  const vaciar = () => {
    if (window.confirm("¿Seguro que quieres vaciar el carrito?")) CarritoStore.vaciar();
  };

  /* ----- Cupón ----- */
  const aplicarCupon = e => {
    e.preventDefault();
    const codigo = cupon.trim().toUpperCase();
    let err = Validar.requerido(codigo, "El cupón");
    if (!err && codigo !== CODIGO_PROMO) err = "Cupón no válido. Prueba con FELICES50.";
    setErrorCupon(err);
    if (!err) {
      setCuponAplicado(codigo);
      const nuevo = CarritoStore.resumen(codigo);
      avisar(nuevo.porcentaje > 10 ? "Ya tienes un descuento mayor aplicado." : "Cupón aplicado: 10% de descuento.");
    }
  };

  /* ----- Pago → boleta ----- */
  const { errores, campo, enviar, reiniciar } = useFormulario({ fechaEntrega: "" }, {
    fechaEntrega: v => {
      if (!v) return "Selecciona una fecha de entrega.";
      const f = new Date(v + "T00:00:00");
      if (v < rango.min) return "La entrega debe ser al menos en 2 días más.";
      if (v > rango.max) return "Solo aceptamos pedidos hasta 60 días en adelante.";
      if (f.getDay() === 0) return "No hacemos entregas los domingos. Elige otro día.";
      return "";
    }
  });

  const pagar = enviar(v => {
    const resumen = CarritoStore.resumen(cuponAplicado);
    if (!resumen.lineas.length) return;
    const u = resumen.usuario;
    const orden = Ordenes.crear(resumen, {
      fecha: v.fechaEntrega,
      direccion: u ? `${u.direccion}, ${u.comuna}` : "Retiro en tienda"
    });
    setBoleta(orden);
    setCuponAplicado("");
    setCupon("");
    reiniciar();
  });

  let nota;
  if (!r.usuario) {
    nota = <><Link to="/login">Inicia sesión</Link> o <Link to="/registro">regístrate</Link> para aplicar tus descuentos automáticamente.</>;
  } else if (r.beneficios.tortaGratis && !r.descuentoTorta) {
    nota = "🎉 ¡Feliz cumpleaños! Agrega una torta y te la regalamos.";
  } else {
    nota = r.motivo ? `Beneficio activo: ${r.motivo}.` : "";
  }

  return (
    <>
      <div className="contenedor">
        <h1 style={{ marginTop: 32 }}>Mi carrito de compras</h1>
        <div className="carrito">
          <section className="carrito-lista" aria-labelledby="titulo-items">
            <h2 id="titulo-items" className="oculto-visual">Productos en el carrito</h2>
            <div aria-live="polite">
              {!r.lineas.length ? (
                <div className="vacio">
                  <p style={{ fontSize: "3rem", margin: 0 }}>🧁</p>
                  <h2>Tu carrito está vacío</h2>
                  <p>Descubre nuestras tortas y postres.</p>
                  <Link className="btn" to="/productos">Ver productos</Link>
                </div>
              ) : (
                <>
                  {r.lineas.map(l => (
                    <ItemCarrito key={l.clave} linea={l} onCambiar={cambiar} onEliminar={eliminar} />
                  ))}
                  <p style={{ textAlign: "right", margin: "12px 0 0" }}>
                    <button type="button" className="link-btn" onClick={vaciar}>Vaciar carrito</button>
                  </p>
                </>
              )}
            </div>
          </section>

          <aside className="resumen" aria-labelledby="titulo-resumen">
            <h2 id="titulo-resumen" style={{ fontSize: "1.5rem" }}>Resumen</h2>
            <dl>
              <dt>Productos ({CarritoStore.cantidadTotal()})</dt><dd>{formatoCLP(r.subtotal)}</dd>
              {r.descuentoTorta > 0 && <>
                <dt className="descuento">Torta de cumpleaños gratis 🎂<br /><small>{r.tortaGratisNombre}</small></dt>
                <dd className="descuento">−{formatoCLP(r.descuentoTorta)}</dd>
              </>}
              {r.descuentoPct > 0 && <>
                <dt className="descuento">{r.motivo}</dt><dd className="descuento">−{formatoCLP(r.descuentoPct)}</dd>
              </>}
              <dt className="total">Total</dt><dd className="total">{formatoCLP(r.total)}</dd>
            </dl>

            <form noValidate onSubmit={aplicarCupon}>
              <div className="campo">
                <label htmlFor="cupon">Cupón de descuento</label>
                <div className="cupon">
                  <input type="text" id="cupon" placeholder="Ej: FELICES50" autoComplete="off" value={cupon}
                    onChange={e => setCupon(e.target.value)}
                    className={errorCupon ? "invalido" : cuponAplicado ? "valido" : undefined} />
                  <button className="btn btn-borde btn-chico" type="submit">Aplicar</button>
                </div>
                <small className="error" aria-live="polite">{errorCupon}</small>
              </div>
            </form>

            <form noValidate onSubmit={pagar}>
              <Campo id="fechaEntrega" label="Fecha de entrega preferida" ayuda="Entregas desde 2 días hábiles, de lunes a sábado." error={errores.fechaEntrega}>
                <input type="date" min={rango.min} max={rango.max} required {...campo("fechaEntrega")} />
              </Campo>
              <button className="btn btn-pagar btn-bloque" type="submit" disabled={!r.lineas.length}>Pagar</button>
            </form>
            <p className="texto-secundario" style={{ fontSize: ".85rem", marginTop: 10 }}>{nota}</p>
          </aside>
        </div>
      </div>

      <Dialogo abierto={Boolean(boleta)} onCerrar={() => setBoleta(null)} aria-labelledby="titulo-boleta">
        {boleta && <Boleta orden={boleta} />}
      </Dialogo>
    </>
  );
}

/* Una línea del carrito con sus botones − / + y el campo de cantidad */
function ItemCarrito({ linea: l, onCambiar, onEliminar }) {
  const t = TAMANOS.find(t => t.id === l.tamano);
  const [texto, setTexto] = useState(String(l.cantidad));
  const avisar = useAvisos();

  /* Mantiene el input sincronizado si la cantidad cambia desde los botones */
  const [anterior, setAnterior] = useState(l.cantidad);
  if (anterior !== l.cantidad) {
    setAnterior(l.cantidad);
    setTexto(String(l.cantidad));
  }

  const confirmar = () => {
    const n = parseInt(texto, 10);
    if (Number.isNaN(n)) {
      avisar("Ingresa una cantidad válida.", "error");
      setTexto(String(l.cantidad));
      return;
    }
    if (n !== l.cantidad) onCambiar(l.clave, n);
    setTexto(String(l.cantidad));
  };

  return (
    <article className="item-carrito">
      <Link to={`/productos/${encodeURIComponent(l.codigo)}`}>
        <img src={Productos.imagen(l.producto)} alt={l.producto.nombre} width="96" height="72" />
      </Link>
      <div>
        <h3>{l.producto.nombre}</h3>
        <p className="extra">
          {formatoCLP(l.unitario)} c/u{t && ` · ${t.nombre}`}{l.mensaje && ` · Mensaje: “${l.mensaje}”`}
        </p>
        <div className="cantidad">
          <button type="button" aria-label="Quitar una unidad" onClick={() => onCambiar(l.clave, l.cantidad - 1)}>−</button>
          <input type="number" min="1" max={MAX_POR_ITEM} aria-label={`Cantidad de ${l.producto.nombre}`}
            value={texto} onChange={e => setTexto(e.target.value)} onBlur={confirmar}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmar(); } }} />
          <button type="button" aria-label="Agregar una unidad" onClick={() => onCambiar(l.clave, l.cantidad + 1)}>+</button>
        </div>
      </div>
      <div className="item-acciones">
        <strong className="precio">{formatoCLP(l.subtotal)}</strong>
        <button type="button" className="btn btn-borde btn-chico" onClick={() => onEliminar(l.clave)}>Eliminar</button>
      </div>
    </article>
  );
}
