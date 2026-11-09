import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Carrito as CarritoStore, Productos } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import TablaCarrito from "../components/TablaCarrito.jsx";
import ResumenCompra from "../components/ResumenCompra.jsx";
import GrillaProductos from "../components/GrillaProductos.jsx";

/* Carrito de compras (Figura 5): a la izquierda la lista de productos para
   seguir agregando y a la derecha el carrito con cantidades, cupón y total. */
export default function Carrito() {
  useStore();
  useTitulo("Carrito de compras | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const navigate = useNavigate();
  const [cupon, setCupon] = useState("");
  const [errorCupon, setErrorCupon] = useState("");
  const r = CarritoStore.resumen();
  const disponibles = Productos.todos().filter(p => p.stock > 0);

  const cambiar = (clave, cantidad) => {
    const res = CarritoStore.cambiarCantidad(clave, cantidad);
    if (!res.ok && res.msg) avisar(res.msg, "error");
  };
  const eliminar = clave => {
    CarritoStore.quitar(clave);
    avisar("Producto eliminado del carrito.");
  };
  const limpiar = () => {
    if (window.confirm("¿Seguro que quieres vaciar el carrito?")) CarritoStore.vaciar();
  };
  const aplicarCupon = e => {
    e.preventDefault();
    const res = CarritoStore.aplicarCupon(cupon);
    setErrorCupon(res.ok ? "" : res.msg);
    if (res.ok) avisar(CarritoStore.resumen().porcentaje > 10 ? "Ya tienes un descuento mayor aplicado." : res.msg);
  };

  let nota = "";
  if (!r.usuario) nota = <><Link to="/login">Inicia sesión</Link> o <Link to="/registro">regístrate</Link> para aplicar tus descuentos automáticamente.</>;
  else if (r.beneficios.tortaGratis && !r.descuentoTorta) nota = "¡Feliz cumpleaños! Agrega una torta y te la regalamos.";
  else if (r.motivo) nota = `Beneficio activo: ${r.motivo}.`;

  return (
    <div className="container py-4">
      <div className="alert bg-crema border d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span><strong>Tu carrito</strong> se guarda en este navegador (localStorage) aunque cierres la página.</span>
        {r.lineas.length > 0 && <Link to="/checkout" className="btn btn-primary btn-sm">Ir a pagar</Link>}
      </div>
      <div className="row g-4">
        <section className="col-12 col-lg-4 order-2 order-lg-1" aria-labelledby="titulo-lista">
          <h2 id="titulo-lista" className="h3">Lista de productos</h2>
          <GrillaProductos productos={disponibles} compacta columnas="row-cols-2 row-cols-sm-3 row-cols-lg-2" />
        </section>

        <section className="col-12 col-lg-8 order-1 order-lg-2" aria-labelledby="titulo-carrito">
          <div className="card shadow-sm carrito-fijo">
            <div className="card-body">
              <h1 id="titulo-carrito" className="h3">Carrito de compras</h1>
              {!r.lineas.length ? (
                <div className="text-center py-4" data-testid="carrito-vacio">
                                    <p className="fw-bold">Tu carrito está vacío</p>
                  <Link className="btn btn-primary" to="/productos">Ver productos</Link>
                </div>
              ) : (
                <>
                  <TablaCarrito lineas={r.lineas} editable onCambiar={cambiar} onEliminar={eliminar} />
                  <div className="row g-3 mt-2">
                    <form noValidate onSubmit={aplicarCupon} className="col-12 col-md-6">
                      <label htmlFor="cupon" className="form-label small mb-1">Cupón de descuento</label>
                      <div className="input-group">
                        <input type="text" id="cupon" className={`form-control${errorCupon ? " is-invalid" : CarritoStore.cupon() ? " is-valid" : ""}`}
                          placeholder={CarritoStore.cupon() || "Ej: FELICES50"} autoComplete="off" value={cupon} onChange={e => setCupon(e.target.value)} />
                        <button className="btn btn-outline-primary" type="submit">Aplicar</button>
                      </div>
                      {errorCupon && <div className="invalid-feedback d-block" role="alert">{errorCupon}</div>}
                    </form>
                    <div className="col-12 col-md-6"><ResumenCompra resumen={r} /></div>
                  </div>
                  {nota && <p className="small text-body-secondary mt-2 mb-0">{nota}</p>}
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" className="btn btn-secondary" onClick={limpiar}>Limpiar</button>
                    <button type="button" className="btn btn-primary" onClick={() => navigate("/checkout")}>Comprar ahora</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
