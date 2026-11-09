import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { TIPOS_USUARIO } from "../../lib/data.js";
import { Usuarios } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Paginacion, { paginar } from "../../components/admin/Paginacion.jsx";

export default function AdminUsuarios() {
  useStore();
  useTitulo("Usuarios | Administrador Mil Sabores");
  const { sesion } = useOutletContext();
  const avisar = useAvisos();
  const [buscar, setBuscar] = useState("");
  const [tipo, setTipo] = useState("");
  const [pagina, setPagina] = useState(1);

  const t = buscar.trim().toLowerCase();
  const lista = Usuarios.todos().filter(u =>
    (!t || `${u.run} ${u.nombre} ${u.apellidos} ${u.correo}`.toLowerCase().includes(t)) && (!tipo || u.tipo === tipo));
  const pag = paginar(lista, pagina, 8);

  const eliminar = run => {
    if (window.confirm(`¿Eliminar al usuario con RUN ${run}?`)) {
      Usuarios.eliminar(run);
      avisar("Usuario eliminado.");
    }
  };

  return (
    <>
      <CabeceraAdmin titulo="Usuarios" subtitulo={`${lista.length} usuario${lista.length === 1 ? "" : "s"}`}>
        <Link className="btn btn-primary" to="/admin/usuarios/nuevo">+ Nuevo usuario</Link>
      </CabeceraAdmin>
      <section className="card shadow-sm"><div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
          <label htmlFor="buscar-usuario" className="visually-hidden">Buscar usuario</label>
          <input type="search" id="buscar-usuario" className="form-control" placeholder="Buscar por RUN, nombre o correo" value={buscar}
            onChange={e => { setBuscar(e.target.value); setPagina(1); }} />
          </div>
          <div className="col-12 col-md-4">
          <label htmlFor="filtro-tipo" className="visually-hidden">Tipo de usuario</label>
          <select id="filtro-tipo" className="form-select" value={tipo} onChange={e => { setTipo(e.target.value); setPagina(1); }}>
            <option value="">Todos los tipos</option>
            {TIPOS_USUARIO.map(x => <option key={x}>{x}</option>)}
          </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Comuna</th><th>Acciones</th></tr></thead>
            <tbody>
              {pag.visibles.length ? pag.visibles.map(u => (
                <tr key={u.run}>
                  <td>{u.run}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td>{u.correo}</td>
                  <td><span className={`badge ${u.tipo === "Administrador" ? "text-bg-primary" : u.tipo === "Vendedor" ? "text-bg-info" : "text-bg-light border"}`}>{u.tipo}</span></td>
                  <td>{u.comuna}</td>
                  <td><div className="d-flex flex-wrap gap-1">
                    <Link className="btn btn-outline-primary btn-sm" to={`/admin/usuarios/${encodeURIComponent(u.run)}`}>Ver</Link>
                    <Link className="btn btn-primary btn-sm" to={`/admin/usuarios/${encodeURIComponent(u.run)}/editar`}>Editar</Link>
                    {u.correo !== sesion.correo && (
                      <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => eliminar(u.run)}>Eliminar</button>
                    )}
                  </div></td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center py-4">No hay usuarios que coincidan.</td></tr>}
            </tbody>
          </table>
        </div>
        <Paginacion total={pag.total} pagina={pag.pagina} onCambiar={setPagina} />
      </div></section>
    </>
  );
}
