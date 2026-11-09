import { useOutletContext } from "react-router-dom";

/* Cabecera de cada página del panel, con el botón de menú para móviles.
   Props: titulo, subtitulo, children (acciones a la derecha) */
export default function CabeceraAdmin({ titulo, subtitulo, children }) {
  const { abrirMenu, menuAbierto } = useOutletContext();
  return (
    <header className="d-flex flex-wrap align-items-center gap-2 mb-4">
      <button className="btn btn-outline-primary btn-sm d-lg-none" type="button" aria-controls="admin-menu"
        aria-expanded={menuAbierto} onClick={abrirMenu}>☰ Menú</button>
      <div className="me-auto">
        <h1 className="h2 mb-0">{titulo}</h1>
        {subtitulo && <small className="text-body-secondary">{subtitulo}</small>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
