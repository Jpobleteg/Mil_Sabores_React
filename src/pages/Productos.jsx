import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIAS } from "../lib/data.js";
import { Productos as ProductosStore, formatoCLP } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import TarjetaProducto from "../components/TarjetaProducto.jsx";

const normalizar = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Productos() {
  useStore();
  useTitulo("Productos | Pastelería Mil Sabores");
  const [params] = useSearchParams();
  const productos = ProductosStore.todos();
  const precioTope = Math.ceil(Math.max(1000, ...productos.map(p => p.precio)) / 1000) * 1000;

  const filtrosIniciales = () => ({
    buscar: params.get("q") || "",
    categoria: params.get("categoria") || "",
    forma: "",
    precio: precioTope,
    orden: ""
  });
  const [f, setF] = useState(filtrosIniciales);

  /* Categoría recibida por URL (ej: desde el footer) */
  useEffect(() => {
    setF(prev => ({ ...prev, categoria: params.get("categoria") || "", buscar: params.get("q") || prev.buscar }));
  }, [params]);

  const cambiar = campo => e => setF(prev => ({ ...prev, [campo]: e.target.value }));

  const texto = normalizar(f.buscar.trim());
  const max = Number(f.precio);
  const lista = productos.filter(p =>
    (!texto || normalizar(p.nombre + " " + p.descripcion + " " + p.categoria).includes(texto)) &&
    (!f.categoria || p.categoria === f.categoria) &&
    (!f.forma || p.categoria === f.forma) &&
    p.precio <= max
  );
  if (f.orden === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
  if (f.orden === "precio-desc") lista.sort((a, b) => b.precio - a.precio);
  if (f.orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const n = lista.length;

  const limpiar = e => {
    e.preventDefault();
    setF({ buscar: "", categoria: "", forma: "", precio: precioTope, orden: "" });
  };

  return (
    <div className="contenedor">
      <header className="seccion-titulo" style={{ marginTop: 32 }}>
        <h1>Productos</h1>
        <p>Filtra por categoría, forma, tamaño o precio para encontrar tu torta ideal.</p>
      </header>
      <div className="catalogo">
        <aside className="filtros" aria-labelledby="titulo-filtros">
          <h2 id="titulo-filtros">Filtrar</h2>
          <form id="form-filtros" onSubmit={e => e.preventDefault()} onReset={limpiar}>
            <div className="campo">
              <label htmlFor="buscar">Buscar</label>
              <input type="search" id="buscar" placeholder="Ej: chocolate, manjar…" list="sugerencias-busqueda" autoComplete="off"
                value={f.buscar} onChange={cambiar("buscar")} />
              <datalist id="sugerencias-busqueda">
                {productos.map(p => <option key={p.codigo} value={p.nombre} />)}
              </datalist>
            </div>
            <div className="campo">
              <label htmlFor="filtro-categoria">Categoría</label>
              <select id="filtro-categoria" value={f.categoria} onChange={cambiar("categoria")}>
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <fieldset>
              <legend>Forma de la torta</legend>
              {[["", "Todas"], ["Tortas Cuadradas", "Cuadrada"], ["Tortas Circulares", "Circular"]].map(([valor, texto]) => (
                <label key={valor}>
                  <input type="radio" name="forma" value={valor} checked={f.forma === valor} onChange={cambiar("forma")} /> {texto}
                </label>
              ))}
            </fieldset>
            <div className="campo">
              <label htmlFor="filtro-precio">Precio máximo: <output id="precio-salida">{formatoCLP(max).replace(" CLP", "")}</output></label>
              <input type="range" id="filtro-precio" min="0" max={precioTope} step="1000" value={f.precio} onChange={cambiar("precio")} />
            </div>
            <div className="campo">
              <label htmlFor="orden">Ordenar por</label>
              <select id="orden" value={f.orden} onChange={cambiar("orden")}>
                <option value="">Recomendados</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre (A-Z)</option>
              </select>
            </div>
            <button type="reset" className="btn btn-borde btn-bloque">Limpiar filtros</button>
          </form>
        </aside>
        <section aria-labelledby="titulo-listado">
          <h2 id="titulo-listado" className="oculto-visual">Listado de productos</h2>
          <p className="resultado-info" aria-live="polite">{n} producto{n === 1 ? "" : "s"} encontrado{n === 1 ? "" : "s"}</p>
          <div className="grilla-productos">
            {n ? lista.map(p => <TarjetaProducto key={p.codigo} producto={p} />) : (
              <div className="vacio">
                <p>No encontramos productos con esos filtros.</p>
                <p className="texto-secundario">Sugerencia: prueba con otra categoría o sube el precio máximo.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
