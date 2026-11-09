import { useState } from "react";
import { Productos, porcentajeOferta } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import GrillaProductos from "../components/GrillaProductos.jsx";
import Migas from "../components/Migas.jsx";

/* Vista Ofertas: todos los productos con precio de oferta vigente */
export default function Ofertas() {
  useStore();
  useTitulo("Ofertas | Pastelería Mil Sabores");
  const [orden, setOrden] = useState("descuento");
  const ofertas = Productos.ofertas();
  if (orden === "descuento") ofertas.sort((a, b) => porcentajeOferta(b) - porcentajeOferta(a));
  if (orden === "precio") ofertas.sort((a, b) => a.precioOferta - b.precioOferta);

  return (
    <div className="container py-3">
      <Migas items={[{ texto: "Home", to: "/" }, { texto: "Ofertas" }]} />
      <div className="p-4 mb-4 rounded-4 bg-rosa-claro text-center">
        <h1 className="mb-1">Ofertas</h1>
        <p className="mb-0">Descuentos por nuestro 50 aniversario. Se suman a tus beneficios de usuario (se aplica el mayor porcentaje).</p>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <p className="mb-0 text-body-secondary" data-testid="cantidad-ofertas">{ofertas.length} producto{ofertas.length === 1 ? "" : "s"} en oferta</p>
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="orden-ofertas" className="small text-nowrap">Ordenar por</label>
          <select id="orden-ofertas" className="form-select form-select-sm" value={orden} onChange={e => setOrden(e.target.value)}>
            <option value="descuento">Mayor descuento</option>
            <option value="precio">Menor precio</option>
          </select>
        </div>
      </div>
      <GrillaProductos productos={ofertas} vacio="No hay ofertas vigentes por ahora." />
    </div>
  );
}
