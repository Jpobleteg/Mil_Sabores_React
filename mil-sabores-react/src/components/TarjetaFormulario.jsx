/* Contenedor centrado para formularios (login, registro, contacto, perfil).
   Props: titulo, subtitulo, logo (muestra el logo), ancho (px máximo), id del título */
export default function TarjetaFormulario({ titulo, subtitulo, logo = true, ancho = 720, idTitulo = "titulo-form", children }) {
  return (
    <div className="container py-4 py-lg-5">
      <section className="card shadow-sm mx-auto" style={{ maxWidth: ancho }} aria-labelledby={idTitulo}>
        <div className="card-body p-3 p-md-4 p-lg-5">
          <header className="text-center mb-4">
            {logo && <img src="/img/logo.svg" alt="Logo Pastelería Mil Sabores" width="72" height="72" />}
            <h1 id={idTitulo} className="mt-2 mb-1">{titulo}</h1>
            {subtitulo && <p className="text-body-secondary mb-0">{subtitulo}</p>}
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}
