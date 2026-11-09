import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TAMANOS } from "../lib/data.js";
import { Carrito, MAX_POR_ITEM, Productos, formatoCLP, origenReceta } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";
import TarjetaProducto from "../components/TarjetaProducto.jsx";

export default function Detalle() {
  useStore();
  const { codigo } = useParams();
  const p = Productos.buscar(codigo);
  useTitulo(p ? `${p.nombre} | Pastelería Mil Sabores` : "Detalle del producto | Pastelería Mil Sabores");

  /* Relacionados: misma categoría primero, luego otros */
  const otros = p ? Productos.todos().filter(x => x.codigo !== p.codigo) : [];
  const relacionados = p
    ? [...otros.filter(x => x.categoria === p.categoria), ...otros.filter(x => x.categoria !== p.categoria)].slice(0, 4)
    : [];

  return (
    <div className="contenedor">
      <nav className="migas" aria-label="Ruta de navegación">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          {p && <>
            <li><Link to={`/productos?categoria=${encodeURIComponent(p.categoria)}`}>{p.categoria}</Link></li>
            <li aria-current="page">{p.nombre}</li>
          </>}
        </ol>
      </nav>
      <article className="detalle" aria-live="polite">
        {p ? <FichaProducto key={p.codigo} p={p} /> : (
          <div>
            <h1>Producto no encontrado</h1>
            <p>El producto que buscas no existe o fue retirado.</p>
            <Link className="btn" to="/productos">Volver al catálogo</Link>
          </div>
        )}
      </article>
      <section className="seccion" aria-labelledby="titulo-relacionados">
        <h2 id="titulo-relacionados">Productos relacionados</h2>
        <div className="grilla-productos">
          {relacionados.map(r => <TarjetaProducto key={r.codigo} producto={r} />)}
        </div>
      </section>
    </div>
  );
}

function FichaProducto({ p }) {
  const avisar = useAvisos();
  const conTamano = Productos.esTorta(p) && p.personalizable;
  const agotado = p.stock <= 0;
  const img = Productos.imagen(p);
  const maxCantidad = Math.min(MAX_POR_ITEM, p.stock);
  const vistas = [
    { src: img, alt: "Vista 1" },
    { src: "/img/hero.svg", alt: "Vista de celebración" },
    { src: "/img/nosotros.svg", alt: "Hecho por nuestro equipo" }
  ];
  const [vista, setVista] = useState(0);

  const reglas = {
    cantidad: v => Validar.requerido(v, "La cantidad") ||
      Validar.numero(v, { min: 1, entero: true, campo: "La cantidad" }) ||
      (Number(v) > maxCantidad ? `Puedes llevar como máximo ${maxCantidad} unidades.` : "")
  };
  if (p.personalizable) reglas.mensaje = v => Validar.maxLargo(v, 50, "El mensaje");

  const { valores, errores, campo, enviar } = useFormulario({ tamano: "S", mensaje: "", cantidad: "1" }, reglas);
  const factor = conTamano ? TAMANOS.find(t => t.id === valores.tamano).factor : 1;

  const agregar = enviar(v => {
    const r = Carrito.agregar(p.codigo, Number(v.cantidad), conTamano ? v.tamano : "", p.personalizable ? v.mensaje : "");
    avisar(r.msg, r.ok ? "ok" : "error");
  });

  const url = window.location.href;
  const urlCod = encodeURIComponent(url);
  const textoCompartir = encodeURIComponent(`¡Mira esta delicia de Pastelería Mil Sabores! ${p.nombre}`);

  const copiarEnlace = async () => {
    try { await navigator.clipboard.writeText(url); avisar("Enlace copiado."); }
    catch { avisar("No se pudo copiar el enlace.", "error"); }
  };

  return (
    <>
      <div className="galeria">
        <div className="principal"><img src={vistas[vista].src} alt={p.nombre} width="400" height="300" /></div>
        <div className="miniaturas" role="group" aria-label="Vistas del producto">
          {vistas.map((v, i) => (
            <button key={i} type="button" aria-pressed={vista === i} onClick={() => setVista(i)}>
              <img src={v.src} alt={v.alt} />
            </button>
          ))}
        </div>
      </div>
      <div className="detalle-info">
        <span className="insignia">{p.categoria}</span>
        <h1>{p.nombre}</h1>
        <p className="precio">{formatoCLP(p.precio * factor)}</p>
        <p>{p.descripcion || ""}</p>
        <p className="texto-secundario">Código: {p.codigo} · {agotado ? "Sin stock" : `Stock disponible: ${p.stock}`}</p>
        <hr />
        <form noValidate onSubmit={agregar}>
          {conTamano && (
            <Campo id="tamano" label="Tamaño">
              <select {...campo("tamano")}>
                {TAMANOS.map(t => <option key={t.id} value={t.id}>{t.nombre} — {formatoCLP(p.precio * t.factor)}</option>)}
              </select>
            </Campo>
          )}
          {p.personalizable && (
            <Campo id="mensaje" label="Mensaje especial" opcional="(opcional)" ayuda="Lo escribimos sobre la torta. Máximo 50 caracteres."
              error={errores.mensaje} max={50} largo={valores.mensaje.length}>
              <input type="text" placeholder="Ej: ¡Feliz cumpleaños, Sofía!" autoComplete="off" {...campo("mensaje")} />
            </Campo>
          )}
          <Campo id="cantidad" label="Cantidad" error={errores.cantidad}>
            <input type="number" min="1" max={maxCantidad} style={{ maxWidth: 120 }} {...campo("cantidad")} />
          </Campo>
          <button className="btn btn-bloque" type="submit" disabled={agotado}>{agotado ? "Agotado" : "Añadir al carrito"}</button>
        </form>
        <hr />
        <div className="origen"><strong>Origen de la receta:</strong> {origenReceta(p)}</div>
        <hr />
        <div className="compartir">
          <strong>Compartir:</strong>
          <a className="btn btn-borde btn-chico" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${urlCod}`}>Facebook</a>
          <a className="btn btn-borde btn-chico" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${textoCompartir}&url=${urlCod}`}>X</a>
          <a className="btn btn-borde btn-chico" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${textoCompartir}%20${urlCod}`}>WhatsApp</a>
          <button className="btn btn-borde btn-chico" type="button" onClick={copiarEnlace}>Copiar enlace</button>
        </div>
      </div>
    </>
  );
}
