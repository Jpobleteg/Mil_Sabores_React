import { useOutletContext } from "react-router-dom";

/* Cabecera de cada página del panel, con el botón de menú para móviles */
export default function CabeceraAdmin({ titulo, children }) {
  const { abrirMenu, menuAbierto } = useOutletContext();
  return (
    <header className="admin-cabecera">
      <button className="btn btn-borde btn-chico admin-toggle" type="button" aria-controls="admin-menu"
        aria-expanded={menuAbierto} onClick={abrirMenu}>☰ Menú</button>
      <h1>{titulo}</h1>
      {children}
    </header>
  );
}
