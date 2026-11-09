import TarjetaProducto from "./TarjetaProducto.jsx";

/* Lista responsiva de productos con la grilla de Bootstrap:
   1 columna en móvil, 2 en tablet, 3 en escritorio y 4 en pantallas grandes.
   Props: productos (arreglo), vacio (texto si no hay productos), columnas (clases row-cols) */
export default function GrillaProductos({ productos, vacio = "No hay productos para mostrar.", columnas = "row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4", compacta = false }) {
  if (!productos.length) {
    return <div className="alert alert-light border text-center" role="status">{vacio}</div>;
  }
  return (
    <div className={`row g-4 ${columnas}`} data-testid="grilla-productos">
      {productos.map(p => (
        <div className="col" key={p.codigo}>
          <TarjetaProducto producto={p} compacta={compacta} />
        </div>
      ))}
    </div>
  );
}
