/* Grupo de formulario con Bootstrap: etiqueta + control + ayuda + error + contador. */
export default function Campo({ id, label, opcional, ayuda, error, max, largo, className = "col-12", children }) {
  return (
    <div className={className}>
      {label && (
        <div className="d-flex justify-content-between align-items-end">
          <label htmlFor={id} className="form-label mb-1">
            {label} {opcional && <span className="opcional">{opcional}</span>}
          </label>
          {max != null && (
            <small className={`contador mb-1${largo > max ? " excedido" : ""}`} data-testid={`contador-${id}`}>{largo}/{max}</small>
          )}
        </div>
      )}
      {children}
      {ayuda && <div className="form-text">{ayuda}</div>}
      {error && <div className="invalid-feedback d-block" role="alert">{error}</div>}
    </div>
  );
}
