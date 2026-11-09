import { Link, useNavigate } from "react-router-dom";
import { Carrito, Ordenes, Pasarela, Sesion, TARJETA_APROBADA, TARJETA_RECHAZADA, formatoCLP } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { IntentoPago, rangoEntrega, validarFechaEntrega } from "../lib/checkout.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import Campo from "../components/Campo.jsx";
import TablaCarrito from "../components/TablaCarrito.jsx";
import ResumenCompra from "../components/ResumenCompra.jsx";
import SelectorRegionComuna from "../components/SelectorRegionComuna.jsx";

/* Checkout (Figura 6): datos del cliente, dirección de entrega y pago.
   Si el usuario inició sesión, sus datos se completan automáticamente. */
export default function Checkout() {
  useStore();
  useTitulo("Checkout | Pastelería Mil Sabores");
  const r = Carrito.resumen();

  if (!r.lineas.length) {
    return (
      <div className="container py-5 text-center">
        <h1>Checkout</h1>
        <p>No hay productos en tu carrito.</p>
        <Link className="btn btn-primary" to="/productos">Ver productos</Link>
      </div>
    );
  }
  return <FormularioCheckout resumen={r} />;
}

function valoresIniciales() {
  const u = Sesion.usuario();
  const intento = IntentoPago.leer();
  const base = {
    nombre: "", apellidos: "", correo: "", calle: "", departamento: "", region: "", comuna: "",
    indicaciones: "", fechaEntrega: "", tarjeta: "", vencimiento: "", cvv: ""
  };
  if (u) Object.assign(base, { nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, calle: u.direccion || "", region: u.region || "", comuna: u.comuna || "" });
  if (intento && intento.datos) Object.assign(base, intento.datos);
  return base;
}

export function FormularioCheckout({ resumen: r }) {
  const navigate = useNavigate();
  const rango = rangoEntrega();
  const conSesion = Boolean(r.usuario);

  const form = useFormulario(valoresIniciales(), {
    nombre: v => Validar.requerido(v, "El nombre") || Validar.maxLargo(v, 50, "El nombre"),
    apellidos: v => Validar.requerido(v, "Los apellidos") || Validar.maxLargo(v, 100, "Los apellidos"),
    correo: v => Validar.requerido(v, "El correo") || Validar.maxLargo(v, 100, "El correo") || Validar.correo(v),
    calle: v => Validar.requerido(v, "La calle") || Validar.maxLargo(v, 300, "La dirección"),
    departamento: v => Validar.maxLargo(v, 50, "El departamento"),
    region: v => Validar.requerido(v, "La región"),
    comuna: v => Validar.requerido(v, "La comuna"),
    indicaciones: v => Validar.maxLargo(v, 300, "Las indicaciones"),
    fechaEntrega: v => validarFechaEntrega(v),
    tarjeta: v => Validar.requerido(v, "El número de tarjeta") || Validar.tarjeta(v),
    vencimiento: v => Validar.requerido(v, "El vencimiento") || Validar.vencimiento(v),
    cvv: v => Validar.requerido(v, "El CVV") || Validar.cvv(v)
  });
  const { valores: v, errores, campo, enviar, resumen: resumenErrores } = form;

  const pagar = enviar(datos => {
    const resumen = Carrito.resumen();
    const pago = Pasarela.procesar({ tarjeta: datos.tarjeta, total: resumen.total }, resumen.lineas);
    const { tarjeta, vencimiento, cvv, ...sinTarjeta } = datos;
    const cliente = { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim().toLowerCase() };
    const entrega = {
      fecha: datos.fechaEntrega, calle: datos.calle.trim(), departamento: datos.departamento.trim(),
      region: datos.region, comuna: datos.comuna, indicaciones: datos.indicaciones.trim()
    };
    if (pago.aprobado) {
      const orden = Ordenes.crear(resumen, entrega, cliente, pago.autorizacion);
      IntentoPago.limpiar();
      navigate(`/compra/exitosa/${orden.numero}`);
    } else {
      IntentoPago.guardar({
        numero: "I" + String(Date.now()).slice(-8), fecha: new Date().toISOString(),
        motivo: pago.motivo, total: resumen.total, finalTarjeta: tarjeta.replace(/\s/g, "").slice(-4), datos: sinTarjeta
      });
      navigate("/compra/error");
    }
  });

  /* Formatea el número de tarjeta en grupos de 4 mientras se escribe */
  const cambiarTarjeta = e => {
    const limpio = e.target.value.replace(/\D/g, "").slice(0, 19);
    form.cambiarValor("tarjeta", limpio.replace(/(.{4})/g, "$1 ").trim());
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 900 }}>
        <div className="card-body p-3 p-lg-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <h1 className="h2 mb-0">Carrito de compra</h1>
              <small className="text-body-secondary">Completa la siguiente información</small>
            </div>
            <span className="badge text-bg-primary fs-6 p-2" data-testid="total-a-pagar">Total a pagar: {formatoCLP(r.total)}</span>
          </div>
          <TablaCarrito lineas={r.lineas} />

          <form noValidate onSubmit={pagar} className="mt-4">
            {resumenErrores && <div className="alert alert-danger" role="alert">{resumenErrores}</div>}
            {conSesion && <div className="alert alert-success py-2 small">Completamos tus datos desde tu cuenta. Puedes modificarlos para esta compra.</div>}

            <h2 className="h4 mt-2">Información del cliente</h2>
            <p className="small text-body-secondary">Completa la siguiente información</p>
            <div className="row g-3">
              <Campo id="nombre" label="Nombre *" error={errores.nombre} className="col-12 col-md-6">
                <input type="text" autoComplete="given-name" {...campo("nombre")} />
              </Campo>
              <Campo id="apellidos" label="Apellidos *" error={errores.apellidos} className="col-12 col-md-6">
                <input type="text" autoComplete="family-name" {...campo("apellidos")} />
              </Campo>
              <Campo id="correo" label="Correo *" error={errores.correo} className="col-12 col-md-6">
                <input type="email" autoComplete="email" placeholder="nombre@gmail.com" {...campo("correo")} />
              </Campo>
            </div>

            <h2 className="h4 mt-4">Dirección de entrega de los productos</h2>
            <p className="small text-body-secondary">Ingrese dirección de forma detallada</p>
            <div className="row g-3">
              <Campo id="calle" label="Calle *" error={errores.calle} className="col-12 col-md-6">
                <input type="text" autoComplete="street-address" placeholder="Calle y número" {...campo("calle")} />
              </Campo>
              <Campo id="departamento" label="Departamento" opcional="(opcional)" error={errores.departamento} className="col-12 col-md-6">
                <input type="text" placeholder="Ej: 603" {...campo("departamento")} />
              </Campo>
              <SelectorRegionComuna form={form} />
              <Campo id="indicaciones" label="Indicaciones para la entrega" opcional="(opcional)" error={errores.indicaciones}
                max={300} largo={v.indicaciones.length}>
                <textarea rows="2" placeholder="Ej: Entre calles, color del edificio, no tiene timbre." {...campo("indicaciones")} />
              </Campo>
              <Campo id="fechaEntrega" label="Fecha de entrega *" ayuda="Entregas desde 2 días, de lunes a sábado." error={errores.fechaEntrega} className="col-12 col-md-6">
                <input type="date" min={rango.min} max={rango.max} {...campo("fechaEntrega")} />
              </Campo>
            </div>

            <h2 className="h4 mt-4">Pago</h2>
            <p className="small text-body-secondary mb-2">
              Pasarela simulada. Tarjeta de prueba aprobada: <code>{TARJETA_APROBADA}</code> · rechazada: <code>{TARJETA_RECHAZADA}</code>
            </p>
            <div className="row g-3">
              <Campo id="tarjeta" label="Número de tarjeta *" error={errores.tarjeta} className="col-12 col-md-6">
                <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" {...campo("tarjeta")} onChange={cambiarTarjeta} />
              </Campo>
              <Campo id="vencimiento" label="Vencimiento *" error={errores.vencimiento} className="col-6 col-md-3">
                <input type="text" autoComplete="cc-exp" placeholder="MM/AA" maxLength={5} {...campo("vencimiento")} />
              </Campo>
              <Campo id="cvv" label="CVV *" error={errores.cvv} className="col-6 col-md-3">
                <input type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} {...campo("cvv")} />
              </Campo>
            </div>

            <div className="row mt-4 align-items-end g-3">
              <div className="col-12 col-md-6"><ResumenCompra resumen={r} /></div>
              <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
                <Link to="/carrito" className="btn btn-outline-secondary">Volver al carrito</Link>
                <button type="submit" className="btn btn-primary btn-lg">Pagar ahora {formatoCLP(r.total).replace(" CLP", "")}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
