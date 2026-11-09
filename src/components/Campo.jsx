/* Grupo de formulario: etiqueta + control + ayuda + error + contador.
   <Campo id="nombre" label="Nombre *" error={errores.nombre} max={50} largo={valores.nombre.length}>
     <input type="text" {...campo("nombre")} />
   </Campo> */
export default function Campo({ id, label, opcional, ayuda, error, max, largo, className = "", children }) {
  return (
    <div className={`campo ${className}`.trim()}>
      {label && (
        <label htmlFor={id}>
          {label} {opcional && <span className="opcional">{opcional}</span>}
        </label>
      )}
      {children}
      {ayuda && <small className="ayuda">{ayuda}</small>}
      <small className="error" aria-live="polite">{error || ""}</small>
      {max != null && (
        <small className={`contador${largo > max ? " excedido" : ""}`}>{largo}/{max}</small>
      )}
    </div>
  );
}
