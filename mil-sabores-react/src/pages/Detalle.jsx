import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TAMANOS } from "../lib/data.js";
import { Carrito, Categorias, MAX_POR_ITEM, Productos, origenReceta } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";
import Precio from "../components/Precio.jsx";
import Migas from "../components/Migas.jsx";
import GrillaProductos from "../components/GrillaProductos.jsx";

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
  const cat = p ? Categorias.porNombre(p.categoria) : null;

  return (
    <div className="container py-2">
      <Migas items={[
        { texto: "Home", to: "/" }, { texto: "Productos", to: "/productos" },
        ...(p ? [{ texto: p.categoria, to: cat ? `/categorias/${cat.id}` : "/categorias" }, { texto: p.nombre }] : [])
      ]} />
      <article className="card shadow-sm p-3 p-lg-4">
        {p ? <FichaProducto key={p.codigo} p={p} /> : (
          <div className="text-center py-5">
            <h1>Producto no encontrado</h1>
            <p>El producto que buscas no existe o fue retirado.</p>
            <Link className="btn btn-primary" to="/productos">Volver al catálogo</Link>
          </div>
        )}
      </article>
      {p && (
        <section className="py-5" aria-labelledby="titulo-relacionados">
          <h2 id="titulo-relacionados" className="mb-3">Productos relacionados</h2>
          <GrillaProductos productos={relacionados} />
        </section>
      )}
    </div>
  );
}

function FichaProducto({ p }) {
  const avisar = useAvisos();
  const conTamano = Productos.esTorta(p) && p.personalizable;
  const agotado = p.stock <= 0;
  const img = Productos.imagen(p);
  const maxCantidad = Math.max(1, Math.min(MAX_POR_ITEM, p.stock));
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
    <div className="row g-4">
      <div className="col-12 col-md-6">
        <img src={vistas[vista].src} alt={p.nombre} className="img-fluid rounded-4 w-100 bg-rosa-claro" width="400" height="300" />
        <div className="d-flex gap-2 mt-2" role="group" aria-label="Vistas del producto">
          {vistas.map((v, i) => (
            <button key={i} type="button" className="miniatura" aria-pressed={vista === i} onClick={() => setVista(i)}>
              <img src={v.src} alt={v.alt} />
            </button>
          ))}
        </div>
      </div>
      <div className="col-12 col-md-6">
        <span className="badge bg-rosa-claro text-chocolate">{p.categoria}</span>
        <h1 className="mt-2">{p.nombre}</h1>
        <p className="fs-3 mb-2"><Precio producto={p} factor={factor} /></p>
        <p>{p.descripcion || ""}</p>
        <p className="small text-body-secondary">Código: {p.codigo} · {agotado ? "Sin stock" : `Stock disponible: ${p.stock}`}</p>
        <hr />
        <form noValidate onSubmit={agregar} className="row g-3">
          {conTamano && (
            <Campo id="tamano" label="Tamaño" className="col-12 col-sm-6">
              <select {...campo("tamano", "form-select")}>
                {TAMANOS.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </Campo>
          )}
          <Campo id="cantidad" label="Cantidad" error={errores.cantidad} className="col-12 col-sm-6">
            <input type="number" min="1" max={maxCantidad} {...campo("cantidad")} />
          </Campo>
          {p.personalizable && (
            <Campo id="mensaje" label="Mensaje especial" opcional="(opcional)" ayuda="Lo escribimos sobre la torta. Máximo 50 caracteres."
              error={errores.mensaje} max={50} largo={valores.mensaje.length}>
              <input type="text" placeholder="Ej: ¡Feliz cumpleaños, Sofía!" autoComplete="off" {...campo("mensaje")} />
            </Campo>
          )}
          <div className="col-12">
            <button className="btn btn-primary btn-lg w-100" type="submit" disabled={agotado}>{agotado ? "Agotado" : "Añadir al carrito"}</button>
          </div>
        </form>
        <div className="alert alert-light border mt-3 mb-3 small"><strong>Origen de la receta:</strong> {origenReceta(p)}</div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <strong>Compartir:</strong>
          <a className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${urlCod}`}>Facebook</a>
          <a className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${textoCompartir}&url=${urlCod}`}>X</a>
          <a className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${textoCompartir}%20${urlCod}`}>WhatsApp</a>
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={copiarEnlace}>Copiar enlace</button>
        </div>
      </div>
    </div>
  );
}
