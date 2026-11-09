import { formatoCLP } from "../lib/store.js";

/* Panel de filtros del catálogo. No guarda estado propio: recibe los
   valores por props y avisa cada cambio al componente padre (estado "elevado").
   Props: filtros, categorias, precioTope, sugerencias, onCambiar(campo, valor), onLimpiar() */
export default function FiltrosProductos({ filtros: f, categorias, precioTope, sugerencias = [], onCambiar, onLimpiar }) {
  const cambiar = campo => e => onCambiar(campo, e.target.value);
  return (
    <form className="card card-body shadow-sm" onSubmit={e => e.preventDefault()} aria-labelledby="titulo-filtros">
      <h2 id="titulo-filtros" className="h4">Filtrar</h2>
      <div className="mb-3">
        <label htmlFor="buscar" className="form-label">Buscar</label>
        <input type="search" id="buscar" className="form-control" placeholder="Ej: chocolate, manjar…" list="sugerencias-busqueda"
          autoComplete="off" value={f.buscar} onChange={cambiar("buscar")} />
        <datalist id="sugerencias-busqueda">
          {sugerencias.map(s => <option key={s} value={s} />)}
        </datalist>
      </div>
      <div className="mb-3">
        <label htmlFor="filtro-categoria" className="form-label">Categoría</label>
        <select id="filtro-categoria" className="form-select" value={f.categoria} onChange={cambiar("categoria")}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <fieldset className="mb-3">
        <legend className="form-label fs-6">Forma de la torta</legend>
        {[["", "Todas"], ["Tortas Cuadradas", "Cuadrada"], ["Tortas Circulares", "Circular"]].map(([valor, texto], i) => (
          <div className="form-check form-check-inline" key={valor}>
            <input className="form-check-input" type="radio" name="forma" id={`forma-${i}`} value={valor} checked={f.forma === valor} onChange={cambiar("forma")} />
            <label className="form-check-label" htmlFor={`forma-${i}`}>{texto}</label>
          </div>
        ))}
      </fieldset>
      <div className="mb-3">
        <label htmlFor="filtro-precio" className="form-label">Precio máximo: <output>{formatoCLP(f.precio).replace(" CLP", "")}</output></label>
        <input type="range" className="form-range" id="filtro-precio" min="0" max={precioTope} step="1000" value={f.precio} onChange={cambiar("precio")} />
      </div>
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" role="switch" id="solo-ofertas" checked={f.soloOfertas}
          onChange={e => onCambiar("soloOfertas", e.target.checked)} />
        <label className="form-check-label" htmlFor="solo-ofertas">Solo ofertas</label>
      </div>
      <div className="mb-3">
        <label htmlFor="orden" className="form-label">Ordenar por</label>
        <select id="orden" className="form-select" value={f.orden} onChange={cambiar("orden")}>
          <option value="">Recomendados</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre (A-Z)</option>
        </select>
      </div>
      <button type="button" className="btn btn-outline-primary w-100" onClick={onLimpiar}>Limpiar filtros</button>
    </form>
  );
}
