import { Link } from "react-router-dom";

/* Ruta de navegación (breadcrumb de Bootstrap). */
export default function Migas({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="mt-3">
      <ol className="breadcrumb">
        {items.map((it, i) => {
          const ultimo = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumb-item${ultimo ? " active" : ""}`} aria-current={ultimo ? "page" : undefined}>
              {ultimo || !it.to ? it.texto : <Link to={it.to}>{it.texto}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
