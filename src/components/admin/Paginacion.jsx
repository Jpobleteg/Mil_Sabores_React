/* Paginación simple reutilizable.
   const { visibles, total, pagina } = paginar(lista, pagina, 8); */
export function paginar(lista, pagina, porPagina) {
  const total = Math.max(1, Math.ceil(lista.length / porPagina));
  const actual = Math.min(pagina, total);
  return { visibles: lista.slice((actual - 1) * porPagina, actual * porPagina), total, pagina: actual };
}

export default function Paginacion({ total, pagina, onCambiar }) {
  return (
    <nav className="paginacion" aria-label="Paginación">
      {total > 1 && Array.from({ length: total }, (_, i) => (
        <button key={i} type="button" aria-current={i + 1 === pagina ? "true" : undefined} onClick={() => onCambiar(i + 1)}>{i + 1}</button>
      ))}
    </nav>
  );
}
