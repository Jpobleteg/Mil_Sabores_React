import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Categorias, Productos as ProductosStore } from "../lib/store.js";
import { filtrarProductos } from "../lib/filtros.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import GrillaProductos from "../components/GrillaProductos.jsx";
import FiltrosProductos from "../components/FiltrosProductos.jsx";

export default function Productos() {
  useStore();
  useTitulo("Productos | Pastelería Mil Sabores");
  const [params] = useSearchParams();
  const productos = ProductosStore.todos();
  const precioTope = Math.ceil(Math.max(1000, ...productos.map(p => p.precio)) / 1000) * 1000;

  const vacios = { buscar: "", categoria: "", forma: "", precio: precioTope, orden: "", soloOfertas: false };
  const [f, setF] = useState({ ...vacios, buscar: params.get("q") || "", categoria: params.get("categoria") || "" });

  /* Búsqueda o categoría recibidas por URL (buscador del header) */
  useEffect(() => {
    setF(prev => ({ ...prev, categoria: params.get("categoria") || prev.categoria, buscar: params.get("q") ?? prev.buscar }));
  }, [params]);

  const lista = filtrarProductos(productos, f);
  const n = lista.length;

  return (
    <div className="container py-4">
      <header className="text-center mb-4">
        <h1>Productos</h1>
        <p className="text-body-secondary">Filtra por categoría, forma, precio u ofertas para encontrar tu torta ideal.</p>
      </header>
      <div className="row g-4">
        <aside className="col-12 col-lg-3">
          <FiltrosProductos filtros={f} categorias={Categorias.nombres()} precioTope={precioTope}
            sugerencias={productos.map(p => p.nombre)}
            onCambiar={(campo, valor) => setF(prev => ({ ...prev, [campo]: valor }))}
            onLimpiar={() => setF(vacios)} />
        </aside>
        <section className="col-12 col-lg-9" aria-labelledby="titulo-listado">
          <h2 id="titulo-listado" className="visually-hidden">Listado de productos</h2>
          <p className="text-body-secondary" aria-live="polite" data-testid="resultado">{n} producto{n === 1 ? "" : "s"} encontrado{n === 1 ? "" : "s"}</p>
          <GrillaProductos productos={lista} columnas="row-cols-1 row-cols-sm-2 row-cols-xl-3"
            vacio="No encontramos productos con esos filtros. Prueba con otra categoría o sube el precio máximo." />
        </section>
      </div>
    </div>
  );
}
