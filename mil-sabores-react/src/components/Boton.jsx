/* Botón reutilizable con estilos de Bootstrap.
   Props: etiqueta (texto), onClick (función), variante ("primary", "outline-primary",
   "danger", ...), tamano ("sm" | "lg"), deshabilitado, tipo ("button" | "submit") */
export default function Boton({ etiqueta, onClick, variante = "primary", tamano, deshabilitado = false, tipo = "button", className = "", ...resto }) {
  const clases = ["btn", `btn-${variante}`, tamano && `btn-${tamano}`, className].filter(Boolean).join(" ");
  return (
    <button type={tipo} className={clases} onClick={onClick} disabled={deshabilitado} {...resto}>
      {etiqueta}
    </button>
  );
}
