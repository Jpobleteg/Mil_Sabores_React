import { enOferta, precioFinal } from "./store.js";

/* Función pura que aplica los filtros del catálogo (fácil de probar). */
export const normalizar = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function filtrarProductos(productos, f) {
  const texto = normalizar((f.buscar || "").trim());
  const max = f.precio === undefined || f.precio === "" ? Infinity : Number(f.precio);
  const lista = productos.filter(p =>
    (!texto || normalizar(`${p.nombre} ${p.descripcion} ${p.categoria}`).includes(texto)) &&
    (!f.categoria || p.categoria === f.categoria) &&
    (!f.forma || p.categoria === f.forma) &&
    (!f.soloOfertas || enOferta(p)) &&
    precioFinal(p) <= max
  );
  if (f.orden === "precio-asc") lista.sort((a, b) => precioFinal(a) - precioFinal(b));
  if (f.orden === "precio-desc") lista.sort((a, b) => precioFinal(b) - precioFinal(a));
  if (f.orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return lista;
}
