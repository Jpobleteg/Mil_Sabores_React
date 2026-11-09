/* Paginación (componente pagination de Bootstrap).
   const { visibles, total, pagina } = paginar(lista, pagina, 8); */
export function paginar(lista, pagina, porPagina) {
  const total = Math.max(1, Math.ceil(lista.length / porPagina));
  const actual = Math.min(Math.max(1, pagina), total);
  return { visibles: lista.slice((actual - 1) * porPagina, actual * porPagina), total, pagina: actual };
}

/* Props: total (páginas), pagina (actual), onCambiar(numero) */
export default function Paginacion({ total, pagina, onCambiar }) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Paginación" className="mt-3">
      <ul className="pagination pagination-sm justify-content-center mb-0">
        <li className={`page-item${pagina === 1 ? " disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onCambiar(pagina - 1)} aria-label="Página anterior">«</button>
        </li>
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={`page-item${i + 1 === pagina ? " active" : ""}`}>
            <button type="button" className="page-link" aria-current={i + 1 === pagina ? "page" : undefined} onClick={() => onCambiar(i + 1)}>{i + 1}</button>
          </li>
        ))}
        <li className={`page-item${pagina === total ? " disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onCambiar(pagina + 1)} aria-label="Página siguiente">»</button>
        </li>
      </ul>
    </nav>
  );
}
